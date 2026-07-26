import { relations } from "drizzle-orm";
import { budgets } from "@/db/schemas/budgets.js";
import { categories } from "@/db/schemas/categories.js";
import { transactions } from "@/db/schemas/transactions.js";

export const categoriesRelations = relations(categories, ({ many }) => ({
    transactions: many(transactions),
    budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
    category: one(categories, {
        fields: [transactions.categoryId],
        references: [categories.id],
    })
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
    category: one(categories, {
        fields: [budgets.categoryId],
        references: [categories.id],
    })
}));