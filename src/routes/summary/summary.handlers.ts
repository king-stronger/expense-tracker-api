import { and, eq, gte, lt, sql } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { createDb } from "@/db/db.js";
import { budgets, categories, transactions } from "@/db/schemas.js";
import { getUser } from "@/lib/helper.js";
import { buildMonthSummary, monthDateRange } from "@/lib/month-summary.js";
import type { AppRouteHandler } from "@/lib/types.js";
import type { GetMonthRoute } from "@/routes/summary/summary.routes.js";

export const getMonth: AppRouteHandler<GetMonthRoute> = async (c) => {
	const user = getUser(c);
	const now = new Date();
	const query = c.req.valid("query");
	const month = query.month ?? now.getUTCMonth() + 1;
	const year = query.year ?? now.getUTCFullYear();
	const { start, end } = monthDateRange(year, month);

	const db = createDb(c.env);

	const [totals] = await db
		.select({
			incomeTotal: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end), 0)`.mapWith(
				Number,
			),
			expenseTotal: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end), 0)`.mapWith(
				Number,
			),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.userId, user.id),
				gte(transactions.transactionDate, start),
				lt(transactions.transactionDate, end),
			),
		);

	const expensesByCategory = await db
		.select({
			categoryId: transactions.categoryId,
			amount: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(
				Number,
			),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.userId, user.id),
				eq(transactions.type, "expense"),
				gte(transactions.transactionDate, start),
				lt(transactions.transactionDate, end),
			),
		)
		.groupBy(transactions.categoryId);

	const userCategories = await db.query.categories.findMany({
		where: eq(categories.userId, user.id),
		columns: { id: true, name: true },
	});

	const userBudgets = await db.query.budgets.findMany({
		where: and(
			eq(budgets.userId, user.id),
			eq(budgets.month, month),
			eq(budgets.year, year),
		),
		columns: { categoryId: true, amount: true },
	});

	const summary = buildMonthSummary({
		month,
		year,
		incomeTotal: totals?.incomeTotal ?? 0,
		expenseTotal: totals?.expenseTotal ?? 0,
		categories: userCategories,
		budgets: userBudgets,
		expensesByCategory,
	});

	return c.json(summary, HttpStatusCodes.OK);
};
