import { describe, expect, it } from "vitest";
import { api } from "@/test/helpers.js";

describe("index / health", () => {
	it("returns ok on GET /health (smoke)", async () => {
		const res = await api("/health");
		expect(res.status).toBe(200);
		await expect(res.json()).resolves.toEqual({ message: "ok" });
	});

	it("returns API message on GET /", async () => {
		const res = await api("/");
		expect(res.status).toBe(200);
		await expect(res.json()).resolves.toEqual({
			message: "Expense Tracker API",
		});
	});
});
