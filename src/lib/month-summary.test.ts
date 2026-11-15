import { describe, expect, it } from "vitest";
import { buildMonthSummary } from "./month-summary.js";

describe("buildMonthSummary", () => {
	it("computes balance and remaining per category", () => {
		const summary = buildMonthSummary({
			month: 11,
			year: 2026,
			incomeTotal: 3000,
			expenseTotal: 900,
			categories: [
				{ id: "a", name: "Alimentation" },
				{ id: "b", name: "Transport" },
				{ id: "c", name: "Loisirs" },
			],
			budgets: [
				{ categoryId: "a", amount: 500 },
				{ categoryId: "b", amount: 200 },
			],
			expensesByCategory: [
				{ categoryId: "a", amount: 400 },
				{ categoryId: "b", amount: 250 },
				{ categoryId: "c", amount: 250 },
			],
		});

		expect(summary.balance).toBe(2100);
		expect(summary.categories).toEqual([
			{
				categoryId: "a",
				categoryName: "Alimentation",
				spent: 400,
				budget: 500,
				remaining: 100,
				percentUsed: 80,
				overBudget: false,
			},
			{
				categoryId: "b",
				categoryName: "Transport",
				spent: 250,
				budget: 200,
				remaining: -50,
				percentUsed: 125,
				overBudget: true,
			},
			{
				categoryId: "c",
				categoryName: "Loisirs",
				spent: 250,
				budget: null,
				remaining: null,
				percentUsed: null,
				overBudget: false,
			},
		]);
	});

	it("hides categories with no spend and no budget", () => {
		const summary = buildMonthSummary({
			month: 1,
			year: 2026,
			incomeTotal: 0,
			expenseTotal: 0,
			categories: [{ id: "a", name: "Autre" }],
			budgets: [],
			expensesByCategory: [],
		});

		expect(summary.categories).toEqual([]);
	});
});
