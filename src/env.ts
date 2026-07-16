import z from "zod"
import { config } from "dotenv"
import { expand } from "dotenv-expand"

expand(config())

const envSchema = z.object({
    PORT: z.coerce.number().positive().default(3000)
})

const parsed = envSchema.safeParse(process.env);

if(!parsed.success){
    throw new Error(`Invalid error: ${parsed.error.message}`)
}

export const env = parsed.data;