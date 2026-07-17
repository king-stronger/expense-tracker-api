import { env } from "@/env.js"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
    out: "./src/db/migrations",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: {
        port: env.DB_PORT,
        host: env.DB_HOST,
        user: env.DB_USER,
        database: env.DB_NAME,
        password: env.DB_PASSWORD,
    }
})