import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import { jsonContent, jsonContentOneOf } from "stoker/openapi/helpers";
import { insertBudgetsSchema, selectBudgetsSchema, updateBudgetsSchema } from "@/db/schemas.js";
import { createErrorSchema, createMessageObjectSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";

const tags = ["Budgets"]

export const list = createRoute({
    tags,
    method: "get",
    path: "/budgets",
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.array(selectBudgetsSchema),
            "The list of budgets"
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
            "User not authentified"
        )
    }
})

export const create = createRoute({
    tags,
    method: "post",
    path: "/budgets",
    request: {
        body: jsonContent(
            insertBudgetsSchema,
            "The budget to create"
        )
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            selectBudgetsSchema,
            "The budget has been created"
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertBudgetsSchema),
            "Validation(s) error(s)"
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
            "User not authentified"
        )
    }
})

export const update = createRoute({
    tags,
    method: "put",
    path: "/budgets",
    request: {
        params: IdUUIDParamsSchema,
        body: jsonContent(
            updateBudgetsSchema,
            "The transaction to update"
        )
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            selectBudgetsSchema,
            "The budget has been updated"
        ),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            "Budget not found"
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
            [
                createErrorSchema(IdUUIDParamsSchema),
                createErrorSchema(updateBudgetsSchema)
            ],
            "Invalid ID or validation(s) error(s)"
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
            "User not authentified"
        )
    }
})

export const remove = createRoute({
    tags,
    method: "delete",
    path: "/budgets",
    request: {
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCodes.NO_CONTENT]: {
            description: "Budget has been deleted"
        },
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            "Budget not found"
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
            "User not authentified"
        )
    }
})

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type RemoveRoute = typeof remove;