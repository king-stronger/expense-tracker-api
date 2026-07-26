import { config } from "dotenv";
import { expand } from "dotenv-expand";
import z from "zod";

expand(config());

const envSchema = z.object({
	PORT: z.coerce.number().positive().default(3000),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
	DB_PORT: z.coerce.number().int().positive(),
	DB_HOST: z.string().min(1),
	DB_NAME: z.string().min(1),
	DB_USER: z.string().min(1),
	DB_PASSWORD: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	throw new Error(`Invalid error: ${parsed.error.message}`);
}

export const env = parsed.data;
