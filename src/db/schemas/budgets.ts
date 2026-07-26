import { user } from "@/db/schemas/auth.js"
import { categories } from "@/db/schemas/categories.js"
import { pgTable, timestamp, uuid, text, integer } from "drizzle-orm/pg-core"
import { createSelectSchema, createInsertSchema, createUpdateSchema } from "drizzle-zod"

export const budgets = pgTable("budgets", {
    id: uuid().primaryKey().defaultRandom(),
    categoryId: uuid().notNull().references(() => categories.id),
    amount: integer().notNull(),
    month: integer().notNull(),
    year: integer().notNull(),
    userId: text().notNull().references(() => user.id),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
})

export const selectBudgetsSchema = createSelectSchema(budgets)
export const insertBudgetsSchema = createInsertSchema(budgets)
    .omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true
    })
export const updateBudgetsSchema = createUpdateSchema(budgets)
    .omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true
    })