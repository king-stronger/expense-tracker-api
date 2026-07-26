import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schemas.js";
import { env } from "@/env.js";

export const db = drizzle({
	schema,
	connection: {
		port: env.DB_PORT,
		host: env.DB_HOST,
		user: env.DB_USER,
		database: env.DB_NAME,
		password: env.DB_PASSWORD,
	},
});
