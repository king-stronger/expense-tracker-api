import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent, jsonContentOneOf } from "stoker/openapi/helpers";
import {
	createErrorSchema,
	createMessageObjectSchema,
	IdUUIDParamsSchema,
} from "stoker/openapi/schemas";
import {
	insertTransactionsSchema,
	selectTransactionsSchema,
	updateTransactionsSchema,
} from "@/db/schemas.js";
import { COOKIE_AUTH } from "@/lib/helper.js";

const tags = ["Transactions"];

export const list = createRoute({
	tags,
	method: "get",
	path: "/transactions",
	security: COOKIE_AUTH,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.array(selectTransactionsSchema),
			"The list of transactions",
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
			"User not authentified",
		),
	},
});

export const create = createRoute({
	tags,
	method: "post",
	path: "/transactions",
	security: COOKIE_AUTH,
	request: {
		body: jsonContent(insertTransactionsSchema, "The transaction to insert"),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			selectTransactionsSchema,
			"The transaction created",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(insertTransactionsSchema),
			"The transaction has been created",
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
			"User not authentified",
		),
	},
});

export const update = createRoute({
	tags,
	method: "put",
	path: "/transactions/{id}",
	security: COOKIE_AUTH,
	request: {
		params: IdUUIDParamsSchema,
		body: jsonContent(updateTransactionsSchema, "The transaction to update"),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			selectTransactionsSchema,
			"The transaction has been updated",
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Transaction not found",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
			[
				createErrorSchema(updateTransactionsSchema),
				createErrorSchema(IdUUIDParamsSchema),
			],
			"Invalid ID or validation(s) error(s)",
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
			"User not authentified",
		),
	},
});

export const remove = createRoute({
	tags,
	method: "delete",
	path: "/transactions/{id}",
	security: COOKIE_AUTH,
	request: {
		params: IdUUIDParamsSchema,
	},
	responses: {
		[HttpStatusCodes.NO_CONTENT]: {
			description: "The transaction has been deleted",
		},
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Transaction not found",
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
			"User not authentified",
		),
	},
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type RemoveRoute = typeof remove;
