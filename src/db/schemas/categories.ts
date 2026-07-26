import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { user } from "@/db/schemas/auth.js";

export const categories = pgTable("categories", {
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull(),
	userId: text()
		.notNull()
		.references(() => user.id),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const selectCategorySchema = createSelectSchema(categories);
export const insertCategorySchema = createInsertSchema(categories).omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
});
export const updateCategorySchema = createUpdateSchema(categories).omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
});
