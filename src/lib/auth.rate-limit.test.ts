import { beforeEach, describe, expect, it } from "vitest";
import { clearAuthCache } from "@/lib/auth.js";
import { TEST_EMAIL_DOMAIN, api, testEnv } from "@/test/helpers.js";

describe("auth rate limit", () => {
	beforeEach(() => {
		clearAuthCache();
	});

	it("rate-limits /sign-in/email after Better Auth special-rule max (3)", async () => {
		const env = testEnv();
		const email = `rate-${crypto.randomUUID().slice(0, 8)}@${TEST_EMAIL_DOMAIN}`;
		const headers = { "x-forwarded-for": "203.0.113.51" };
		const statuses: number[] = [];

		for (let i = 0; i < 4; i++) {
			const res = await api(
				"/api/auth/sign-in/email",
				{
					method: "POST",
					headers,
					body: JSON.stringify({
						email,
						password: "wrong-password-123456",
					}),
				},
				env,
			);
			statuses.push(res.status);
		}

		expect(statuses.slice(0, 3).every((status) => status !== 429)).toBe(true);
		expect(statuses[3]).toBe(429);
	});

	it("applies AUTH_RATE_LIMIT_MAX on non-special auth paths", async () => {
		const env = testEnv({ AUTH_RATE_LIMIT_MAX: "2" });
		const headers = { "x-forwarded-for": "203.0.113.52" };
		const statuses: number[] = [];

		for (let i = 0; i < 3; i++) {
			const res = await api(
				"/api/auth/get-session",
				{ headers },
				env,
			);
			statuses.push(res.status);
		}

		expect(statuses[0]).toBe(200);
		expect(statuses[1]).toBe(200);
		expect(statuses[2]).toBe(429);
	});
});
