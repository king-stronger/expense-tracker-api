import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import {
	jsonContent,
	jsonContentOneOf,
	jsonContentRequired,
} from "stoker/openapi/helpers";
import {
	createErrorSchema,
	createMessageObjectSchema,
	IdUUIDParamsSchema,
} from "stoker/openapi/schemas";
import {
	insertCategorySchema,
	selectCategorySchema,
	updateCategorySchema,
} from "@/db/schemas.js";

const tags = ["Categories"];

export const list = createRoute({
	tags,
	method: "get",
	path: "/categories",
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.array(selectCategorySchema),
			"The list of categories",
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
	path: "/categories",
	request: {
		body: jsonContentRequired(insertCategorySchema, "The category to create"),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			selectCategorySchema,
			"The category created",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(insertCategorySchema),
			"The validation(s) error(s)",
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
	path: "/categories/{id}",
	request: {
		params: IdUUIDParamsSchema,
		body: jsonContent(updateCategorySchema, "The category to update"),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			selectCategorySchema,
			"The category updated",
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Category not found",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
			[
				createErrorSchema(IdUUIDParamsSchema),
				createErrorSchema(updateCategorySchema),
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
	path: "/categories/{id}",
	request: {
		params: IdUUIDParamsSchema,
	},
	responses: {
		[HttpStatusCodes.NO_CONTENT]: {
			description: "Category deleted",
		},
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Category not found",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(IdUUIDParamsSchema),
			"Invalid ID",
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
