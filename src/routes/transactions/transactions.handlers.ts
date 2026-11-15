import { and, eq, gte, lt } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createDb } from "@/db/db.js";
import { transactions } from "@/db/schemas.js";
import { assertCategoryOwnedByUser, getUser } from "@/lib/helper.js";
import { monthDateRange } from "@/lib/month-summary.js";
import type { AppRouteHandler } from "@/lib/types.js";
import type {
	CreateRoute,
	ListRoute,
	RemoveRoute,
	UpdateRoute,
} from "@/routes/transactions/transactions.routes.js";

export const list: AppRouteHandler<ListRoute> = async (c) => {
	const user = getUser(c);
	const query = c.req.valid("query");
	const now = new Date();
	const month = query.month ?? now.getUTCMonth() + 1;
	const year = query.year ?? now.getUTCFullYear();
	const { start, end } = monthDateRange(year, month);

	const filters = [
		eq(transactions.userId, user.id),
		gte(transactions.transactionDate, start),
		lt(transactions.transactionDate, end),
	];

	if (query.categoryId) {
		filters.push(eq(transactions.categoryId, query.categoryId));
	}

	if (query.type) {
		filters.push(eq(transactions.type, query.type));
	}

	const db = createDb(c.env);
	const results = await db.query.transactions.findMany({
		where: and(...filters),
		orderBy: (fields, { desc }) => [desc(fields.transactionDate)],
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

	const [transaction] = await db
		.insert(transactions)
		.values({
			...data,
			userId: user.id,
		})
		.returning();

	return c.json(transaction, HttpStatusCodes.CREATED);
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

	const [transaction] = await db
		.update(transactions)
		.set(data)
		.where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
		.returning();

	if (!transaction) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(transaction, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
	const user = getUser(c);
	const { id } = c.req.valid("param");

	const db = createDb(c.env);
	const result = await db
		.delete(transactions)
		.where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

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
