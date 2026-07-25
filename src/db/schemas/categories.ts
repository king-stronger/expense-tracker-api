import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod"

export const categories = pgTable("categories", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
})

export const selectCategorySchema = createSelectSchema(categories)
export const insertCategorySchema = createInsertSchema(categories)
export const updateCategorySchema = createUpdateSchema(categories)