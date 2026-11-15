import { and, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createDb } from "@/db/db.js";
import { budgets } from "@/db/schemas.js";
import { assertCategoryOwnedByUser, getUser } from "@/lib/helper.js";
import type { AppRouteHandler } from "@/lib/types.js";
import type {
	CreateRoute,
	ListRoute,
	RemoveRoute,
	UpdateRoute,
} from "@/routes/budgets/budgets.routes.js";

export const list: AppRouteHandler<ListRoute> = async (c) => {
	const user = getUser(c);
	const query = c.req.valid("query");
	const now = new Date();
	const month = query.month ?? now.getUTCMonth() + 1;
	const year = query.year ?? now.getUTCFullYear();

	const db = createDb(c.env);
	const results = await db.query.budgets.findMany({
		where: and(
			eq(budgets.userId, user.id),
			eq(budgets.month, month),
			eq(budgets.year, year),
		),
	});
	return c.json(results, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const user = getUser(c);
	const data = c.req.valid("json");

	const db = createDb(c.env);
	const ownsCategory = await assertCategoryOwnedByUser(
		db,
		data.categoryId,
		user.id,
	);

	if (!ownsCategory) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	const [budget] = await db
		.insert(budgets)
		.values({
			...data,
			userId: user.id,
		})
		.returning();

	return c.json(budget, HttpStatusCodes.CREATED);
};

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
	const user = getUser(c);

	const { id } = c.req.valid("param");
	const data = c.req.valid("json");

	const db = createDb(c.env);

	if (data.categoryId) {
		const ownsCategory = await assertCategoryOwnedByUser(
			db,
			data.categoryId,
			user.id,
		);

		if (!ownsCategory) {
			return c.json(
				{
					message: HttpStatusPhrases.NOT_FOUND,
				},
				HttpStatusCodes.NOT_FOUND,
			);
		}
	}

	const [budget] = await db
		.update(budgets)
		.set(data)
		.where(and(eq(budgets.id, id), eq(budgets.userId, user.id)))
		.returning();

	if (!budget) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(budget, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
	const user = getUser(c);
	const { id } = c.req.valid("param");

	const db = createDb(c.env);
	const result = await db
		.delete(budgets)
		.where(and(eq(budgets.id, id), eq(budgets.userId, user.id)));

	if (result.rowCount === 0) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.body(null, HttpStatusCodes.NO_CONTENT);
};
