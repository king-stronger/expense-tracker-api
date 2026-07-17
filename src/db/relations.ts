import {
    categories,
    transactions,
    budgets,
} from "@/db/schemas.js";

import { defineRelations } from "drizzle-orm"

export const relations = defineRelations({
        categories,
        transactions,
        budgets,
    }, (r) => ({
    categories: {
        transactions: r.many.transactions(),
        budgets: r.many.budgets()
    },
    transactions: {
        category: r.one.categories({
            from: r.transactions.categoryId,
            to: r.categories.id
        })
    },
    budgets: {
        category: r.one.categories({
            from: r.budgets.categoryId,
            to: r.categories.id
        })
    }
}))