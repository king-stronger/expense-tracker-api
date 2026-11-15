import { z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent, jsonContentOneOf } from "stoker/openapi/helpers";
import {
	createErrorSchema,
	createMessageObjectSchema,
	IdUUIDParamsSchema,
} from "stoker/openapi/schemas";
import {
	insertBudgetsSchema,
	selectBudgetsSchema,
	updateBudgetsSchema,
} from "@/db/schemas.js";
import { COOKIE_AUTH } from "@/lib/helper.js";
import { protectedRoute } from "@/middlewares/auth.js";

const tags = ["Budgets"];

const listQuerySchema = z.object({
	month: z.coerce.number().int().min(1).max(12).optional().openapi({
		param: { name: "month", in: "query" },
	}),
	year: z.coerce.number().int().min(2000).max(2100).optional().openapi({
		param: { name: "year", in: "query" },
	}),
});

export const list = protectedRoute({
	tags,
	method: "get",
	path: "/budgets",
	security: COOKIE_AUTH,
	request: {
		query: listQuerySchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.array(selectBudgetsSchema),
			"The list of budgets",
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
			"User not authentified",
		),
	},
});

export const create = protectedRoute({
	tags,
	method: "post",
	path: "/budgets",
	security: COOKIE_AUTH,
	request: {
		body: jsonContent(insertBudgetsSchema, "The budget to create"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(
			selectBudgetsSchema,
			"The budget has been created",
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Category not found",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(insertBudgetsSchema),
			"Validation(s) error(s)",
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
			"User not authentified",
		),
	},
});

export const update = protectedRoute({
	tags,
	method: "put",
	path: "/budgets/{id}",
	security: COOKIE_AUTH,
	request: {
		params: IdUUIDParamsSchema,
		body: jsonContent(updateBudgetsSchema, "The budget to update"),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			selectBudgetsSchema,
			"The budget has been updated",
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Budget not found",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
			[
				createErrorSchema(IdUUIDParamsSchema),
				createErrorSchema(updateBudgetsSchema),
			],
			"Invalid ID or validation(s) error(s)",
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
			"User not authentified",
		),
	},
});

export const remove = protectedRoute({
	tags,
	method: "delete",
	path: "/budgets/{id}",
	security: COOKIE_AUTH,
	request: {
		params: IdUUIDParamsSchema,
	},
	responses: {
		[HttpStatusCodes.NO_CONTENT]: {
			description: "Budget has been deleted",
		},
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Budget not found",
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
