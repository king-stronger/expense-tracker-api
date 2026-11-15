import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schemas.js";
import type { Environment } from "@/env.js";

type DBEnv = Pick<Environment, "DATABASE_URL">;

export function createDb(env: DBEnv) {
	const sql = neon(env.DATABASE_URL);

	return drizzle({
		client: sql,
		schema,
	});
}

export type Db = ReturnType<typeof createDb>;
