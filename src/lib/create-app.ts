import { structuredLogger } from "@hono/structured-logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId } from "hono/request-id";
import pino from "pino";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { parseEnv, type Environment } from "@/env.js";
import type { AppBindings } from "./types.js";

export function createRouter() {
	return new OpenAPIHono<AppBindings>({
		strict: false,
		defaultHook,
	});
}

let parsedEnv: Environment | null = null

export function createApp() {
	const app = createRouter();

	app.use(async (c, next) => {
		if(!parsedEnv){
			parsedEnv = parseEnv(c.env);
		}

		c.env = parsedEnv;

		await next();
	})
	app.use("*", async (c, next) => {
		const logger = pino({
			level: c.env.LOG_LEVEL
		});

		c.set("logger", logger)

		await next();
	})

	app.use(requestId());
	app.use(serveEmojiFavicon(""));
	app.use(
		structuredLogger({
			createLogger: (c) => c.get("logger").child({ requestId: c.var.requestId }),
		}),
	);

	app.notFound(notFound);
	app.onError(onError);

	return app;
}
