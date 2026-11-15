import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "@/db/db.js";
import { budgets } from "@/db/schemas.js";
import {
	api,
	cleanupTestFixtures,
	createTestUser,
	getOrCreateCategory,
	testEnv,
} from "@/test/helpers.js";

describe("budgets", () => {
	const userIds: string[] = [];

	afterEach(async () => {
		await cleanupTestFixtures({ userIds });
		userIds.length = 0;
	});

	it("updates and deletes by /budgets/{id}", async () => {
		const owner = await createTestUser({ name: "Budget User" });
		userIds.push(owner.id);

		const category = await getOrCreateCategory(owner, "Logement");
		const month = 4;
		const year = 2026;

		const createRes = await api("/budgets", {
			method: "POST",
			headers: { cookie: owner.cookie },
			body: JSON.stringify({
				categoryId: category.id,
				amount: 800,
				month,
				year,
			}),
		});
		expect(createRes.status).toBe(201);
		const created = (await createRes.json()) as { id: string; amount: number };
		expect(created.amount).toBe(800);

		const updateRes = await api(`/budgets/${created.id}`, {
			method: "PUT",
			headers: { cookie: owner.cookie },
			body: JSON.stringify({ amount: 900 }),
		});
		expect(updateRes.status).toBe(200);
		const updated = (await updateRes.json()) as { amount: number };
		expect(updated.amount).toBe(900);

		const db = createDb(testEnv());
		const persisted = await db.query.budgets.findFirst({
			where: eq(budgets.id, created.id),
		});
		expect(persisted?.amount).toBe(900);

		const deleteRes = await api(`/budgets/${created.id}`, {
			method: "DELETE",
			headers: { cookie: owner.cookie },
		});
		expect(deleteRes.status).toBe(204);

		const gone = await db.query.budgets.findFirst({
			where: eq(budgets.id, created.id),
		});
		expect(gone).toBeUndefined();
	});

	it("lists budgets for the requested month only", async () => {
		const owner = await createTestUser({ name: "Budget List" });
		userIds.push(owner.id);

		const category = await getOrCreateCategory(owner, "Santé");

		await api("/budgets", {
			method: "POST",
			headers: { cookie: owner.cookie },
			body: JSON.stringify({
				categoryId: category.id,
				amount: 100,
				month: 5,
				year: 2026,
			}),
		});

		const may = await api("/budgets?month=5&year=2026", {
			headers: { cookie: owner.cookie },
		});
		expect(may.status).toBe(200);
		const mayList = (await may.json()) as Array<{ month: number }>;
		expect(mayList.length).toBeGreaterThanOrEqual(1);
		expect(mayList.every((row) => row.month === 5)).toBe(true);

		const june = await api("/budgets?month=6&year=2026", {
			headers: { cookie: owner.cookie },
		});
		const juneList = (await june.json()) as Array<{ id: string }>;
		expect(juneList).toEqual([]);
	});
});
