import {
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { user } from "@/db/schemas/auth.js";
import { categories } from "@/db/schemas/categories.js";

export const transactionTypeEnum = pgEnum("transaction_type", [
	"income",
	"expense",
]);

export const transactions = pgTable("transactions", {
	id: uuid().primaryKey().defaultRandom(),
	categoryId: uuid()
		.notNull()
		.references(() => categories.id),
	type: transactionTypeEnum().notNull(),
	description: text(),
	amount: integer().notNull(),
	transactionDate: timestamp({ withTimezone: true }).notNull().defaultNow(),
	userId: text()
		.notNull()
		.references(() => user.id),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const selectTransactionsSchema = createSelectSchema(transactions);
export const insertTransactionsSchema = createInsertSchema(transactions).omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
});
export const updateTransactionsSchema = createUpdateSchema(transactions).omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
});
