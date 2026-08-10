import type { Context, Next } from "hono";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createAuth } from "@/lib/auth.js";
import type { AppBindings } from "@/lib/types.js";

export const authMiddleware = async (c: Context<AppBindings>, next: Next) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		c.set("user", null);
		c.set("session", null);
		await next();
		return;
	}

	c.set("user", session.user);
	c.set("session", session.session);
	await next();
};

export const requireAuth = async (c: Context<AppBindings>, next: Next) => {
	const user = c.get("user");

	if (!user) {
		return c.json(
			{
				message: HttpStatusPhrases.UNAUTHORIZED,
			},
			HttpStatusCodes.UNAUTHORIZED,
		);
	}

	await next();
};
