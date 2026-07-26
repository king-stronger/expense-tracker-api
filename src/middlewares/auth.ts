import { auth } from "@/lib/auth.js"
import type { Context, Next } from "hono"
import type { AppBindings } from "@/lib/types.js"

export const authMiddleware = async (c: Context<AppBindings>, next: Next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers })

	if(!session){
		c.set("user", null)
		c.set("session", null)
		await next()
		return;
	}

	c.set("user", session.user)
	c.set("session", session.session)
	await next();
}