import { db } from "@/db/db.js"
import { eq } from "drizzle-orm"
import { budgets } from "@/db/schemas.js"
import type { AppRouteHandler } from "@/lib/types.js"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import type { ListRoute, CreateRoute, UpdateRoute, RemoveRoute } from "@/routes/budgets/budgets.routes.js"

export const list: AppRouteHandler<ListRoute> = async (c) => {
    const budgets = await db.query.budgets.findMany()
    return c.json(budgets, HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
    const data = c.req.valid("json")
    const [budget] = await db
        .insert(budgets)
        .values(data)
        .returning()

    return c.json(budget, HttpStatusCodes.OK)
}

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
    const { id } = c.req.valid("param")
    const data = c.req.valid("json")

    const [budget] = await db
        .update(budgets)
        .set(data)
        .where(eq(budgets.id, id))
        .returning()

    if(!budget){
        return c.json(
            {
                message: HttpStatusPhrases.NOT_FOUND
            },
            HttpStatusCodes.NOT_FOUND
        )
    }

    return c.json(budget, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
    const { id } = c.req.valid("param")
    const result = await db
        .delete(budgets)
        .where(eq(budgets.id, id))

    if(result.rowCount === 0){
        return c.json(
            {
                message: HttpStatusPhrases.NOT_FOUND
            },
            HttpStatusCodes.NOT_FOUND
        )
    }

    return c.body(null, HttpStatusCodes.NO_CONTENT)
}