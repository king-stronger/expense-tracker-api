import { structuredLogger } from "@hono/structured-logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import pino from "pino";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { envSchema } from "@/env.js";
import { createAuth } from "./auth.js";
import type { AppBindings } from "./types.js";

export function createRouter() {
	return new OpenAPIHono<AppBindings>({
		strict: false,
		defaultHook,
	});
}

function docsEnabled(c: { env: AppBindings["Bindings"] }) {
	if (c.env.ENABLE_API_DOCS === "true") {
		return true;
	}

	return (c.env.ENVIRONMENT ?? "development") !== "production";
}

export function createApp() {
	const app = createRouter();

	app.use(requestId());
	app.use(serveEmojiFavicon(""));
	app.use("*", async (c, next) => {
		const parsed = envSchema.safeParse(c.env);

		if (!parsed.success) {
			return c.json({ message: "Invalid server configuration" }, 500);
		}

		await next();
	});
	app.use("*", async (c, next) => {
		const corsMiddleware = cors({
			origin: c.env.BETTER_AUTH_TRUSTED_ORIGIN,
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			credentials: true,
		});

		return corsMiddleware(c, next);
	});
	app.use(
		structuredLogger({
			createLogger: (c) =>
				pino({ level: c.env.LOG_LEVEL ?? "info" }).child({
					requestId: c.var.requestId,
				}),
		}),
	);

	app.use("/docs", async (c, next) => {
		if (!docsEnabled(c)) {
			return c.json({ message: "Not Found" }, 404);
		}
		await next();
	});
	app.use("/scalar", async (c, next) => {
		if (!docsEnabled(c)) {
			return c.json({ message: "Not Found" }, 404);
		}
		await next();
	});

	app.on(["POST", "GET"], "/api/auth/*", (c) => {
		const auth = createAuth(c.env);
		return auth.handler(c.req.raw);
	});

	app.notFound(notFound);
	app.onError(onError);

	return app;
}
