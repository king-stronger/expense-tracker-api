import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "@/db/db.js";
import { categories } from "@/db/schemas.js";
import { DEFAULT_CATEGORY_NAMES } from "@/lib/seed-categories.js";
import {
	api,
	cleanupTestFixtures,
	createTestUser,
	TEST_CATEGORY_PREFIX,
	testEnv,
} from "@/test/helpers.js";

describe("categories", () => {
	const userIds: string[] = [];

	afterEach(async () => {
		await cleanupTestFixtures({ userIds });
		userIds.length = 0;
	});

	it("requires auth to list", async () => {
		const res = await api("/categories");
		expect(res.status).toBe(401);
	});

	it("lists seeded defaults after signup", async () => {
		const owner = await createTestUser({ name: "Category Seed" });
		userIds.push(owner.id);

		const res = await api("/categories", {
			headers: { cookie: owner.cookie },
		});
		expect(res.status).toBe(200);

		const list = (await res.json()) as Array<{ name: string }>;
		const names = list.map((row) => row.name);
		for (const name of DEFAULT_CATEGORY_NAMES) {
			expect(names).toContain(name);
		}
	});

	it("creates updates and deletes a category", async () => {
		const owner = await createTestUser({ name: "Category CRUD" });
		userIds.push(owner.id);

		const name = `${TEST_CATEGORY_PREFIX}custom`;
		const createRes = await api("/categories", {
			method: "POST",
			headers: { cookie: owner.cookie },
			body: JSON.stringify({ name }),
		});
		expect(createRes.status).toBe(201);
		const created = (await createRes.json()) as { id: string; name: string };
		expect(created.name).toBe(name);

		const updateRes = await api(`/categories/${created.id}`, {
			method: "PUT",
			headers: { cookie: owner.cookie },
			body: JSON.stringify({ name: `${name}-updated` }),
		});
		expect(updateRes.status).toBe(200);
		const updated = (await updateRes.json()) as { name: string };
		expect(updated.name).toBe(`${name}-updated`);

		const db = createDb(testEnv());
		const persisted = await db.query.categories.findFirst({
			where: eq(categories.id, created.id),
		});
		expect(persisted?.name).toBe(`${name}-updated`);

		const deleteRes = await api(`/categories/${created.id}`, {
			method: "DELETE",
			headers: { cookie: owner.cookie },
		});
		expect(deleteRes.status).toBe(204);

		const gone = await db.query.categories.findFirst({
			where: eq(categories.id, created.id),
		});
		expect(gone).toBeUndefined();
	});
});
