import { and, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createDb } from "@/db/db.js";
import { transactions } from "@/db/schemas.js";
import { getUser } from "@/lib/helper.js";
import type { AppRouteHandler } from "@/lib/types.js";
import type {
	CreateRoute,
	ListRoute,
	RemoveRoute,
	UpdateRoute,
} from "@/routes/transactions/transactions.routes.js";

export const list: AppRouteHandler<ListRoute> = async (c) => {
	const user = getUser(c);

	const db = createDb(c.env);
	const results = await db.query.transactions.findMany({
		where: eq(transactions.userId, user.id),
	});
	return c.json(results, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const user = getUser(c);
	const data = c.req.valid("json");

	const db = createDb(c.env);
	const [transaction] = await db
		.insert(transactions)
		.values({
			...data,
			userId: user.id,
		})
		.returning();

	return c.json(transaction, HttpStatusCodes.OK);
};

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
	const user = getUser(c);
	const { id } = c.req.valid("param");
	const data = c.req.valid("json");

	const db = createDb(c.env);
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
