import { and, eq, like } from "drizzle-orm";
import app from "@/app.js";
import { createDb } from "@/db/db.js";
import {
	account,
	budgets,
	categories,
	session,
	transactions,
	user,
	verification,
} from "@/db/schemas.js";
import type { Environment } from "@/env.js";
import { createAuth } from "@/lib/auth.js";
import { getTestEnv } from "./env.js";

/** Disposable emails for this repo's fixtures. */
export const TEST_EMAIL_DOMAIN = "expense-tracker.test";
export const TEST_CATEGORY_PREFIX = "test-exp-";

export function testEnv(overrides: Partial<Environment> = {}) {
	return getTestEnv(overrides);
}

export function testDb(env: Environment = testEnv()) {
	return createDb(env);
}

export async function api(
	path: string,
	init: RequestInit = {},
	env: Environment = testEnv(),
) {
	const headers = new Headers(init.headers);
	if (init.body && !headers.has("content-type")) {
		headers.set("content-type", "application/json");
	}
	return app.request(
		path,
		{
			...init,
			headers,
		},
		env,
	);
}

function setCookiesFromResponse(response: Response) {
	const headersWithGetSetCookie = response.headers as Headers & {
		getSetCookie?: () => string[];
	};
	return (
		headersWithGetSetCookie.getSetCookie?.() ??
		(response.headers.get("set-cookie")
			? [response.headers.get("set-cookie") as string]
			: [])
	);
}

function cookieFromAuthResponse(response: Response) {
	const sessionCookie = setCookiesFromResponse(response).find((value) =>
		value.startsWith("better-auth.session_token="),
	);
	if (!sessionCookie) {
		throw new Error("No better-auth.session_token cookie in auth response");
	}
	return sessionCookie.split(";")[0] ?? sessionCookie;
}

export type TestUser = {
	id: string;
	email: string;
	name: string;
	cookie: string;
};

export async function createTestUser(input?: {
	email?: string;
	name?: string;
	password?: string;
}): Promise<TestUser> {
	const env = testEnv();
	const db = testDb(env);
	const auth = createAuth(env);
	const suffix = crypto.randomUUID().slice(0, 8);
	const email = input?.email ?? `user-${suffix}@${TEST_EMAIL_DOMAIN}`;
	const name = input?.name ?? `Test User ${suffix}`;
	const password = input?.password ?? "test-password-123456";

	const response = await auth.api.signUpEmail({
		body: { email, password, name },
		asResponse: true,
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`signUpEmail failed (${response.status}): ${body}`);
	}

	const cookie = cookieFromAuthResponse(response);
	const created = await db.query.user.findFirst({
		where: eq(user.email, email),
	});
	if (!created) {
		throw new Error(`User not found after signup: ${email}`);
	}

	return {
		id: created.id,
		email,
		name,
		cookie,
	};
}

/** Prefer a seeded default category; otherwise create a fixture one. */
export async function getOrCreateCategory(
	owner: TestUser,
	name = "Alimentation",
) {
	const db = testDb();
	const existing = await db.query.categories.findFirst({
		where: and(eq(categories.userId, owner.id), eq(categories.name, name)),
	});
	if (existing) {
		return existing;
	}

	const [created] = await db
		.insert(categories)
		.values({
			name: `${TEST_CATEGORY_PREFIX}${name}`,
			userId: owner.id,
		})
		.returning();

	return created;
}

export async function cleanupTestFixtures(input: { userIds?: string[] }) {
	const db = testDb();

	for (const userId of input.userIds ?? []) {
		await db.delete(transactions).where(eq(transactions.userId, userId));
		await db.delete(budgets).where(eq(budgets.userId, userId));
		await db.delete(categories).where(eq(categories.userId, userId));
		await db.delete(session).where(eq(session.userId, userId));
		await db.delete(account).where(eq(account.userId, userId));
		await db.delete(user).where(eq(user.id, userId));
	}

	await db
		.delete(verification)
		.where(like(verification.identifier, `%@${TEST_EMAIL_DOMAIN}`));
}
