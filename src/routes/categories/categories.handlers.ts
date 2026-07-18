import { db } from "@/db/db.js";
import { eq } from "drizzle-orm";
import { categories } from "@/db/schemas.js";
import type { AppRouteHandler } from "@/lib/types.js";
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import type { CreateRoute, ListRoute, UpdateRoute, RemoveRoute } from "@/routes/categories/categories.routes.js";

export const list: AppRouteHandler<ListRoute> = async(c) => {
    const categories = await db.query.categories.findMany()
    return c.json(categories, HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async(c) => {
    const data = c.req.valid("json")
    const [category] = await db.insert(categories).values(data).returning()

    return c.json(category, HttpStatusCodes.OK)
}

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
    const data = c.req.valid("json")
    const { id } = c.req.valid("param")
    const [category] = await db
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning()

    if(!category){
        return c.json(
            {
                message: HttpStatusPhrases.NOT_FOUND
            },
            HttpStatusCodes.NOT_FOUND
        )
    }

    return c.json(category, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async(c) => {
    const { id } = c.req.valid("param")
    const result = await db
        .delete(categories)
        .where(eq(categories.id, id))

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