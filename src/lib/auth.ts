import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schemas.js";
import type { Environment } from "@/env.js";
import { createDb } from "../db/db.js";

export const createAuth = (env: Environment) => {
	return betterAuth({
		trustedOrigins: [env.BETTER_AUTH_TRUSTED_ORIGIN],
		database: drizzleAdapter(createDb, {
			provider: "pg",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
		},
	});
};
