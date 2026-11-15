import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "@/db/db.js";
import { transactions } from "@/db/schemas.js";
import {
	api,
	cleanupTestFixtures,
	createTestUser,
	getOrCreateCategory,
	testEnv,
} from "@/test/helpers.js";

describe("transactions", () => {
	const userIds: string[] = [];

	afterEach(async () => {
		await cleanupTestFixtures({ userIds });
		userIds.length = 0;
	});

	it("rejects create with another user's categoryId", async () => {
		const owner = await createTestUser({ name: "Txn Owner" });
		const attacker = await createTestUser({ name: "Txn Attacker" });
		userIds.push(owner.id, attacker.id);

		const foreignCategory = await getOrCreateCategory(owner, "Transport");

		const res = await api("/transactions", {
			method: "POST",
			headers: { cookie: attacker.cookie },
			body: JSON.stringify({
				categoryId: foreignCategory.id,
				type: "expense",
				amount: 42,
				description: "IDOR attempt",
			}),
		});

		expect(res.status).toBe(404);

		const db = createDb(testEnv());
		const leaked = await db.query.transactions.findFirst({
			where: eq(transactions.userId, attacker.id),
		});
		expect(leaked).toBeUndefined();
	});

	it("creates lists and filters by month/type", async () => {
		const owner = await createTestUser({ name: "Txn Filter" });
		userIds.push(owner.id);

		const category = await getOrCreateCategory(owner, "Loisirs");
		const month = 3;
		const year = 2026;
		const db = createDb(testEnv());

		const createRes = await api("/transactions", {
			method: "POST",
			headers: { cookie: owner.cookie },
			body: JSON.stringify({
				categoryId: category.id,
				type: "expense",
				amount: 75,
				description: "Cinéma test",
			}),
		});
		expect(createRes.status).toBe(201);
		const created = (await createRes.json()) as { id: string; amount: number };
		expect(created.amount).toBe(75);

		await db
			.update(transactions)
			.set({ transactionDate: new Date(Date.UTC(year, month - 1, 12)) })
			.where(eq(transactions.id, created.id));

		const listRes = await api(
			`/transactions?month=${month}&year=${year}&type=expense`,
			{ headers: { cookie: owner.cookie } },
		);
		expect(listRes.status).toBe(200);
		const list = (await listRes.json()) as Array<{ id: string }>;
		expect(list.some((row) => row.id === created.id)).toBe(true);

		const otherMonth = await api(`/transactions?month=1&year=${year}`, {
			headers: { cookie: owner.cookie },
		});
		const otherList = (await otherMonth.json()) as Array<{ id: string }>;
		expect(otherList.some((row) => row.id === created.id)).toBe(false);

		const persisted = await db.query.transactions.findFirst({
			where: eq(transactions.id, created.id),
		});
		expect(persisted?.description).toBe("Cinéma test");
	});
});
