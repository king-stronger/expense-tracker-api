import { createDb } from "@/db/db.js";
import { categories } from "@/db/schemas.js";
import type { Environment } from "@/env.js";

export const DEFAULT_CATEGORY_NAMES = [
	"Alimentation",
	"Transport",
	"Logement",
	"Loisirs",
	"Santé",
	"Shopping",
	"Abonnements",
	"Autre",
] as const;

export async function seedDefaultCategories(
	env: Pick<Environment, "DATABASE_URL">,
	userId: string,
) {
	const db = createDb(env);

	await db.insert(categories).values(
		DEFAULT_CATEGORY_NAMES.map((name) => ({
			name,
			userId,
		})),
	);
}
