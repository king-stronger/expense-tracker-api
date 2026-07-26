import { db } from "../db/db.js";
import { betterAuth } from "better-auth";
import * as schema from "@/db/schemas.js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
    trustedOrigins: [
        "http://localhost:3000"
    ],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    emailAndPassword: { 
        enabled: true, 
    }
});