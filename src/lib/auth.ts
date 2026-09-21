import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schemas.js";
import { createDb } from "../db/db.js";

type AuthEnv = Pick<Env, "DATABASE_URL" | "BETTER_AUTH_SECRET" | "BETTER_AUTH_URL" | "BETTER_AUTH_TRUSTED_ORIGIN">

export const createAuth = (env: AuthEnv) => {
	return betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		trustedOrigins: [env.BETTER_AUTH_TRUSTED_ORIGIN],
		database: drizzleAdapter(createDb(env), {
			provider: "pg",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
		},
	});
};

export type Auth = ReturnType<typeof createAuth>;
