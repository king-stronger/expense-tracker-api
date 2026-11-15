import z from "zod";

export const envSchema = z.object({
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
	ENVIRONMENT: z.enum(["development", "production"]).default("development"),
	DATABASE_URL: z.url(),
	BETTER_AUTH_URL: z.url(),
	BETTER_AUTH_TRUSTED_ORIGIN: z.url(),
	BETTER_AUTH_SECRET: z.string().min(32),
	/** Optional. Without it, reset-password links are logged instead of emailed. */
	RESEND_API_KEY: z.string().min(1).optional(),
	EMAIL_FROM: z
		.string()
		.default("Expense Tracker <onboarding@resend.dev>"),
	ENABLE_API_DOCS: z.enum(["true", "false"]).default("false"),
});

export type Environment = z.infer<typeof envSchema>;

export function parseEnv(data: unknown): Environment {
	const { data: env, error } = envSchema.safeParse(data);

	if (error) {
		throw new Error(`Invalid environment: ${error.message}`);
	}

	return env;
}

/** Node/tooling only (drizzle-kit). Runtime must use `c.env`. */
export default parseEnv(process.env);
