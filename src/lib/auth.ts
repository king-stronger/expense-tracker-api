import { db } from "../db/db.js";
import { betterAuth } from "better-auth";
import * as schema from "@/db/schemas.js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    emailAndPassword: { 
        enabled: true, 
    }
});