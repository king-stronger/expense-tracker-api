import { describe, expect, it } from "vitest";
import { api, testEnv } from "@/test/helpers.js";

describe("docs gating", () => {
	it("allows /docs in development even when ENABLE_API_DOCS=false", async () => {
		const res = await api(
			"/docs",
			{},
			testEnv({ ENVIRONMENT: "development", ENABLE_API_DOCS: "false" }),
		);
		expect(res.status).toBe(200);
	});

	it("blocks /docs in production when ENABLE_API_DOCS=false", async () => {
		const res = await api(
			"/docs",
			{},
			testEnv({ ENVIRONMENT: "production", ENABLE_API_DOCS: "false" }),
		);
		expect(res.status).toBe(404);
		await expect(res.json()).resolves.toEqual({ message: "Not Found" });
	});

	it("allows /docs in production when ENABLE_API_DOCS=true", async () => {
		const res = await api(
			"/docs",
			{},
			testEnv({ ENVIRONMENT: "production", ENABLE_API_DOCS: "true" }),
		);
		expect(res.status).toBe(200);
	});

	it("blocks /scalar in production when docs are disabled", async () => {
		const res = await api(
			"/scalar",
			{},
			testEnv({ ENVIRONMENT: "production", ENABLE_API_DOCS: "false" }),
		);
		expect(res.status).toBe(404);
	});
});

describe("CORS", () => {
	it("reflects the trusted origin with credentials on /health", async () => {
		const env = testEnv();
		const res = await api(
			"/health",
			{ headers: { Origin: env.BETTER_AUTH_TRUSTED_ORIGIN } },
			env,
		);

		expect(res.status).toBe(200);
		expect(res.headers.get("access-control-allow-origin")).toBe(
			env.BETTER_AUTH_TRUSTED_ORIGIN,
		);
		expect(res.headers.get("access-control-allow-credentials")).toBe("true");
	});

	it("does not allow an untrusted origin", async () => {
		const env = testEnv();
		const res = await api(
			"/health",
			{ headers: { Origin: "http://evil.example" } },
			env,
		);

		expect(res.headers.get("access-control-allow-origin")).not.toBe(
			"http://evil.example",
		);
	});

	it("answers preflight OPTIONS for the trusted origin", async () => {
		const env = testEnv();
		const res = await api(
			"/health",
			{
				method: "OPTIONS",
				headers: {
					Origin: env.BETTER_AUTH_TRUSTED_ORIGIN,
					"Access-Control-Request-Method": "GET",
				},
			},
			env,
		);

		expect([200, 204]).toContain(res.status);
		expect(res.headers.get("access-control-allow-origin")).toBe(
			env.BETTER_AUTH_TRUSTED_ORIGIN,
		);
	});
});
