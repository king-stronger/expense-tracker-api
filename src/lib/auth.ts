import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schemas.js";
import { db } from "../db/db.js";

export const auth = betterAuth({
	trustedOrigins: ["http://localhost:3000"],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
});
