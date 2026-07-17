import * as schema from "@/db/schema.js"
import { defineRelations } from "drizzle-orm"

export const relations = defineRelations(schema)