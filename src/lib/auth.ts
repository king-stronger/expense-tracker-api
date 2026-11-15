import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schemas.js";
import type { Environment } from "@/env.js";
import { createDb } from "../db/db.js";
import { sendEmail } from "./email.js";
import { seedDefaultCategories } from "./seed-categories.js";

type AuthEnv = Pick<
	Environment,
	| "DATABASE_URL"
	| "BETTER_AUTH_SECRET"
	| "BETTER_AUTH_URL"
	| "BETTER_AUTH_TRUSTED_ORIGIN"
	| "RESEND_API_KEY"
	| "EMAIL_FROM"
	| "LOG_LEVEL"
>;

export const createAuth = (env: AuthEnv) => {
	return betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.BETTER_AUTH_TRUSTED_ORIGIN],
		database: drizzleAdapter(createDb(env), {
			provider: "pg",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
			revokeSessionsOnPasswordReset: true,
			sendResetPassword: async ({ user, url }) => {
				void sendEmail(env, {
					to: user.email,
					subject: "Réinitialiser votre mot de passe",
					text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${url}`,
				});
			},
		},
		user: {
			deleteUser: {
				enabled: true,
				beforeDelete: async (user) => {
					const db = createDb(env);
					await db
						.delete(schema.transactions)
						.where(eq(schema.transactions.userId, user.id));
					await db
						.delete(schema.budgets)
						.where(eq(schema.budgets.userId, user.id));
					await db
						.delete(schema.categories)
						.where(eq(schema.categories.userId, user.id));
				},
			},
		},
		rateLimit: {
			enabled: true,
			window: 60,
			max: 20,
		},
		databaseHooks: {
			user: {
				create: {
					after: async (user) => {
						await seedDefaultCategories(env, user.id);
					},
				},
			},
		},
	});
};

export type Auth = ReturnType<typeof createAuth>;
