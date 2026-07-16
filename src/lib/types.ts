import type { OpenAPIHono } from "@hono/zod-openapi";

export interface AppBindings {

}

export type AppOpenApi = OpenAPIHono<AppBindings>