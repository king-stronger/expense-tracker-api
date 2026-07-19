import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent, jsonContentOneOf } from "stoker/openapi/helpers";
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import { createErrorSchema, createMessageObjectSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { insertTransactionsSchema, selectTransactionsSchema, updateTransactionsSchema } from "@/db/schemas.js";

const tags = ["Transactions"];

export const list = createRoute({
    tags,
    method: "get",
    path: "/transactions",
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.array(selectTransactionsSchema),
            "The list of transactions"
        )
    }
})

export const create = createRoute({
    tags,
    method: "post",
    path: "/transactions",
    request: {
        body: jsonContent(
            insertTransactionsSchema,
            "The transaction to insert"
        )
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            selectTransactionsSchema,
            "The transaction created"
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertTransactionsSchema),
            "The transaction has been created"
        )
    }
})

export const update = createRoute({
    tags,
    method: "put",
    path: "/transactions/{id}",
    request: {
        params: IdUUIDParamsSchema,
        body: jsonContent(
            updateTransactionsSchema,
            "The transaction to update"
        )        
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            selectTransactionsSchema,
            "The transaction has been updated"
        ),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            "Transaction not found"
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
            [
                createErrorSchema(updateTransactionsSchema),
                createErrorSchema(IdUUIDParamsSchema)
            ],
            "Invalid ID or validation(s) error(s)"
        )
    }
})

export const remove = createRoute({
    tags,
    method: "delete",
    path: "/transactions/{id}",
    request: {
        params: IdUUIDParamsSchema
    },
    responses: {
        [HttpStatusCodes.NO_CONTENT]: {
            description: "The transaction has been deleted"
        },
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
            "Transaction not found"
        )
    }
})

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type RemoveRoute = typeof remove;