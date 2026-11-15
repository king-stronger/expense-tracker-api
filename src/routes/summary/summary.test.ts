import { and, eq } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "@/db/db.js";
import { budgets, transactions } from "@/db/schemas.js";
import {
	api,
	cleanupTestFixtures,
	createTestUser,
	getOrCreateCategory,
	testEnv,
} from "@/test/helpers.js";

describe("summary", () => {
	const userIds: string[] = [];

	afterEach(async () => {
		await cleanupTestFixtures({ userIds });
		userIds.length = 0;
	});

	it("requires auth", async () => {
		const res = await api("/summary");
		expect(res.status).toBe(401);
	});

	it("returns monthly totals and budget remaining", async () => {
		const owner = await createTestUser({ name: "Summary User" });
		userIds.push(owner.id);

		const category = await getOrCreateCategory(owner, "Alimentation");
		const month = 11;
		const year = 2026;
		const db = createDb(testEnv());

		await db.insert(budgets).values({
			categoryId: category.id,
			amount: 500,
			month,
			year,
			userId: owner.id,
		});

		await db.insert(transactions).values([
			{
				categoryId: category.id,
				type: "income",
				amount: 3000,
				description: "Salaire test",
				transactionDate: new Date(Date.UTC(year, month - 1, 5)),
				userId: owner.id,
			},
			{
				categoryId: category.id,
				type: "expense",
				amount: 400,
				description: "Courses test",
				transactionDate: new Date(Date.UTC(year, month - 1, 10)),
				userId: owner.id,
			},
		]);

		const res = await api(`/summary?month=${month}&year=${year}`, {
			headers: { cookie: owner.cookie },
		});
		expect(res.status).toBe(200);

		const body = (await res.json()) as {
			month: number;
			year: number;
			incomeTotal: number;
			expenseTotal: number;
			balance: number;
			categories: Array<{
				categoryId: string;
				spent: number;
				budget: number | null;
				remaining: number | null;
				overBudget: boolean;
			}>;
		};

		expect(body.month).toBe(month);
		expect(body.year).toBe(year);
		expect(body.incomeTotal).toBe(3000);
		expect(body.expenseTotal).toBe(400);
		expect(body.balance).toBe(2600);

		const row = body.categories.find((c) => c.categoryId === category.id);
		expect(row).toMatchObject({
			spent: 400,
			budget: 500,
			remaining: 100,
			overBudget: false,
		});

		const persisted = await db.query.budgets.findFirst({
			where: and(
				eq(budgets.userId, owner.id),
				eq(budgets.categoryId, category.id),
				eq(budgets.month, month),
				eq(budgets.year, year),
			),
		});
		expect(persisted?.amount).toBe(500);
	});
});
