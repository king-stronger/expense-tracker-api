import pino from "pino";
import { env } from "@/env.js";
import { requestId } from "hono/request-id";
import { defaultHook } from "stoker/openapi";
import type { AppBindings } from "./types.js";
import { OpenAPIHono } from "@hono/zod-openapi";
import { structuredLogger } from "@hono/structured-logger";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";

const rootLogger = pino({
    level: env.LOG_LEVEL,
    transport: {
        target: "pino-pretty"
    }
})

export function createRouter(){
    return new OpenAPIHono<AppBindings>({
        strict: false,
        defaultHook
    });
}

export function createApp(){
    const app = createRouter()

    app.use(requestId())
    app.use(serveEmojiFavicon(""))
    app.use(
        structuredLogger({
            createLogger: c => rootLogger.child({ requestId: c.var.requestId })
        })
    )

    app.notFound(notFound)
    app.onError(onError)

    return app;
}