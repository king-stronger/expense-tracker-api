import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import type { Db } from "@/db/db.js";
import { categories } from "@/db/schemas.js";
import type { AppBindings } from "./types.js";

export function getUser(c: Context<AppBindings>) {
	const user = c.get("user");

	if (!user) {
		throw new Error("User not found");
	}

	return user;
}

export async function assertCategoryOwnedByUser(
	db: Db,
	categoryId: string,
	userId: string,
) {
	const category = await db.query.categories.findFirst({
		where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
		columns: { id: true },
	});

	return Boolean(category);
}

export const COOKIE_AUTH = [
	{
		cookieAuth: [],
	},
];
