import { desc, eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDb } from "@/db/db.js";
import { categories, user, verification } from "@/db/schemas.js";
import {
	api,
	cleanupTestFixtures,
	createTestUser,
	getOrCreateCategory,
	testEnv,
} from "@/test/helpers.js";

function extractResetToken(urlString: string) {
	const url = new URL(urlString);
	const fromQuery = url.searchParams.get("token");
	if (fromQuery) {
		return fromQuery;
	}

	const segments = url.pathname.split("/").filter(Boolean);
	const resetIdx = segments.findIndex((part) => part === "reset-password");
	if (resetIdx >= 0 && segments[resetIdx + 1]) {
		return segments[resetIdx + 1];
	}

	const last = segments.at(-1);
	if (last && last !== "reset-password") {
		return last;
	}

	return null;
}

async function latestVerificationToken() {
	const db = createDb(testEnv());
	const [row] = await db
		.select()
		.from(verification)
		.orderBy(desc(verification.createdAt))
		.limit(1);
	return row?.identifier ?? row?.value ?? null;
}

describe("auth session", () => {
	const userIds: string[] = [];

	afterEach(async () => {
		await cleanupTestFixtures({ userIds });
		userIds.length = 0;
	});

	it("returns null session without cookie", async () => {
		const res = await api("/api/auth/get-session");
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toBeNull();
	});

	it("returns the signed-in user with session cookie", async () => {
		const owner = await createTestUser({ name: "Session User" });
		userIds.push(owner.id);

		const res = await api("/api/auth/get-session", {
			headers: { cookie: owner.cookie },
		});
		expect(res.status).toBe(200);
		const body = (await res.json()) as {
			user: { id: string; email: string };
		};
		expect(body.user.id).toBe(owner.id);
		expect(body.user.email).toBe(owner.email);
	});
});

describe("auth delete account", () => {
	const userIds: string[] = [];

	afterEach(async () => {
		await cleanupTestFixtures({ userIds });
		userIds.length = 0;
	});

	it("deletes the user and related app data with password", async () => {
		const password = "test-password-123456";
		const owner = await createTestUser({
			name: "Delete Me",
			password,
		});
		userIds.push(owner.id);

		const category = await getOrCreateCategory(owner, "Shopping");
		await api("/transactions", {
			method: "POST",
			headers: { cookie: owner.cookie },
			body: JSON.stringify({
				categoryId: category.id,
				type: "expense",
				amount: 10,
				description: "to be deleted",
			}),
		});

		const res = await api("/api/auth/delete-user", {
			method: "POST",
			headers: { cookie: owner.cookie },
			body: JSON.stringify({ password }),
		});
		expect(res.status).toBe(200);

		const db = createDb(testEnv());
		const goneUser = await db.query.user.findFirst({
			where: eq(user.id, owner.id),
		});
		expect(goneUser).toBeUndefined();

		const leftoverCategories = await db.query.categories.findMany({
			where: eq(categories.userId, owner.id),
		});
		expect(leftoverCategories).toEqual([]);

		userIds.length = 0;
	});
});

describe("auth password reset", () => {
	const userIds: string[] = [];

	afterEach(async () => {
		await cleanupTestFixtures({ userIds });
		userIds.length = 0;
		vi.restoreAllMocks();
	});

	it("resets password from token captured in skipped email log", async () => {
		const oldPassword = "old-password-123456";
		const newPassword = "new-password-123456";
		const owner = await createTestUser({
			name: "Reset User",
			password: oldPassword,
		});
		userIds.push(owner.id);

		let capturedUrl: string | undefined;
		vi.spyOn(console, "info").mockImplementation((msg: unknown) => {
			if (typeof msg !== "string") {
				return;
			}
			try {
				const parsed = JSON.parse(msg) as {
					msg?: string;
					text?: string;
				};
				if (parsed.msg === "email_skipped_no_resend_key" && parsed.text) {
					const match = parsed.text.match(/https?:\/\/\S+/);
					capturedUrl = match?.[0];
				}
			} catch {
				// ignore non-JSON logs
			}
		});

		const requestRes = await api("/api/auth/request-password-reset", {
			method: "POST",
			body: JSON.stringify({
				email: owner.email,
				redirectTo: "http://localhost:5173/reset-password",
			}),
		});
		expect(requestRes.status).toBe(200);

		const token =
			(capturedUrl ? extractResetToken(capturedUrl) : null) ??
			(await latestVerificationToken());
		expect(
			token,
			`token missing (url=${capturedUrl ?? "none"})`,
		).toBeTruthy();

		const resetRes = await api("/api/auth/reset-password", {
			method: "POST",
			body: JSON.stringify({
				token,
				newPassword,
			}),
		});
		expect(resetRes.status).toBe(200);

		const oldSignIn = await api("/api/auth/sign-in/email", {
			method: "POST",
			body: JSON.stringify({
				email: owner.email,
				password: oldPassword,
			}),
		});
		expect(oldSignIn.status).toBe(401);

		const newSignIn = await api("/api/auth/sign-in/email", {
			method: "POST",
			body: JSON.stringify({
				email: owner.email,
				password: newPassword,
			}),
		});
		expect(newSignIn.status).toBe(200);
	});
});
