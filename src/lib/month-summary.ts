export type SummaryCategoryInput = {
	id: string;
	name: string;
};

export type SummaryBudgetInput = {
	categoryId: string;
	amount: number;
};

export type SummaryExpenseInput = {
	categoryId: string;
	amount: number;
};

export type MonthSummaryCategory = {
	categoryId: string;
	categoryName: string;
	spent: number;
	budget: number | null;
	remaining: number | null;
	percentUsed: number | null;
	overBudget: boolean;
};

export type MonthSummary = {
	month: number;
	year: number;
	incomeTotal: number;
	expenseTotal: number;
	balance: number;
	categories: MonthSummaryCategory[];
};

export function buildMonthSummary(input: {
	month: number;
	year: number;
	incomeTotal: number;
	expenseTotal: number;
	categories: SummaryCategoryInput[];
	budgets: SummaryBudgetInput[];
	expensesByCategory: SummaryExpenseInput[];
}): MonthSummary {
	const spentByCategory = new Map<string, number>();

	for (const expense of input.expensesByCategory) {
		spentByCategory.set(
			expense.categoryId,
			(spentByCategory.get(expense.categoryId) ?? 0) + expense.amount,
		);
	}

	const budgetByCategory = new Map(
		input.budgets.map((budget) => [budget.categoryId, budget.amount]),
	);

	const categories: MonthSummaryCategory[] = input.categories
		.map((category) => {
			const spent = spentByCategory.get(category.id) ?? 0;
			const budget = budgetByCategory.get(category.id) ?? null;
			const remaining = budget === null ? null : budget - spent;
			const percentUsed =
				budget === null || budget === 0
					? null
					: Math.round((spent / budget) * 100);
			const overBudget = budget !== null && spent > budget;

			return {
				categoryId: category.id,
				categoryName: category.name,
				spent,
				budget,
				remaining,
				percentUsed,
				overBudget,
			};
		})
		.filter(
			(category) =>
				category.spent > 0 || category.budget !== null,
		)
		.sort((a, b) => b.spent - a.spent);

	return {
		month: input.month,
		year: input.year,
		incomeTotal: input.incomeTotal,
		expenseTotal: input.expenseTotal,
		balance: input.incomeTotal - input.expenseTotal,
		categories,
	};
}

export function monthDateRange(year: number, month: number) {
	const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
	const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
	return { start, end };
}
