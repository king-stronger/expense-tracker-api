import { db } from "@/db/db.js";
import { eq, and } from "drizzle-orm";
import { categories } from "@/db/schemas.js";
import type { AppRouteHandler } from "@/lib/types.js";
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import type { CreateRoute, ListRoute, UpdateRoute, RemoveRoute } from "@/routes/categories/categories.routes.js";

export const list: AppRouteHandler<ListRoute> = async(c) => {
    const user = c.get("user")!

    const results = await db.query.categories.findMany({
        where: eq(categories.userId, user.id)
    })

    return c.json(results, HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async(c) => {
    const user = c.get("user")!
    const data = c.req.valid("json")
    
    const [category] = await db
        .insert(categories)
        .values({
            ...data,
            userId: user.id,
        })
        .returning()

    return c.json(category, HttpStatusCodes.OK)
}

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
    const user = c.get("user")!

    const data = c.req.valid("json")
    const { id } = c.req.valid("param")
    const [category] = await db
        .update(categories)
        .set(data)
        .where(
            and(
                eq(categories.id, id),
                eq(categories.userId, user.id)
            )
        )
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
    const user = c.get("user")!

    const { id } = c.req.valid("param")
    const result = await db
        .delete(categories)
        .where(
            and(
                eq(categories.id, id),
                eq(categories.userId, user.id)
            )
        )

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