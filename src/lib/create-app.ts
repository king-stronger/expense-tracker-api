import { defaultHook } from "stoker/openapi"
import type { AppBindings } from "./types.js";
import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";

export function createRouter(){
    return new OpenAPIHono<AppBindings>({
        strict: false,
        defaultHook
    });
}

export function createApp(){
    const app = createRouter()

    app.use(serveEmojiFavicon(""))
    app.notFound(notFound)
    app.onError(onError)

    return app;
}