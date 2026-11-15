import type { Environment } from "@/env.js";

function required(name: string, fallback?: string) {
	const value = process.env[name] ?? fallback;
	if (!value) {
		throw new Error(
			`Missing ${name}. Set it in .env (or DATABASE_URL_TEST for tests).`,
		);
	}
	return value;
}

/** Cloudflare Worker env shape for `app.request(..., env)`. */
export function getTestEnv(
	overrides: Partial<Environment> = {},
): Environment {
	const databaseUrl =
		process.env.DATABASE_URL_TEST?.trim() ||
		process.env.DATABASE_URL?.trim() ||
		"";

	if (!databaseUrl) {
		throw new Error(
			"Set DATABASE_URL_TEST or DATABASE_URL in .env for integration tests.",
		);
	}

	return {
		DATABASE_URL: databaseUrl,
		BETTER_AUTH_SECRET: required(
			"BETTER_AUTH_SECRET",
			"test-secret-at-least-32-characters-long!!",
		),
		BETTER_AUTH_URL: required("BETTER_AUTH_URL", "http://localhost:8787"),
		BETTER_AUTH_TRUSTED_ORIGIN: required(
			"BETTER_AUTH_TRUSTED_ORIGIN",
			"http://localhost:5173",
		),
		LOG_LEVEL: "error",
		ENVIRONMENT: "development",
		ENABLE_API_DOCS: "false",
		EMAIL_FROM: "Expense Tracker <onboarding@resend.dev>",
		...overrides,
	};
}
