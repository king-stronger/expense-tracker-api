import { categories } from "./categories.js"
import { pgTable, timestamp, uuid, integer } from "drizzle-orm/pg-core"

export const budgets = pgTable("budgets", {
    id: uuid().primaryKey().defaultRandom(),
    categoryId: uuid().notNull().references(() => categories.id),
    amount: integer().notNull(),
    month: integer().notNull(),
    year: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
})