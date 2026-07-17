import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core"

export const categories = pgTable("categories", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
})