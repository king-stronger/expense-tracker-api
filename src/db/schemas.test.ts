import { describe, expect, it } from "vitest";
import {
	insertBudgetsSchema,
	insertCategorySchema,
	insertTransactionsSchema,
} from "@/db/schemas.js";

describe("insert schemas", () => {
	it("accepts a valid transaction payload", () => {
		const parsed = insertTransactionsSchema.safeParse({
			categoryId: "11111111-1111-4111-8111-111111111111",
			type: "expense",
			amount: 25,
			description: "Café",
		});
		expect(parsed.success).toBe(true);
	});

	it("rejects transaction without amount", () => {
		const parsed = insertTransactionsSchema.safeParse({
			categoryId: "11111111-1111-4111-8111-111111111111",
			type: "income",
		});
		expect(parsed.success).toBe(false);
	});

	it("accepts a valid budget payload", () => {
		const parsed = insertBudgetsSchema.safeParse({
			categoryId: "11111111-1111-4111-8111-111111111111",
			amount: 400,
			month: 11,
			year: 2026,
		});
		expect(parsed.success).toBe(true);
	});

	it("accepts a valid category payload", () => {
		const parsed = insertCategorySchema.safeParse({ name: "Courses" });
		expect(parsed.success).toBe(true);
	});
});
