import type { Context } from "hono";
import type { AppBindings } from "./types.js";

export function getUser(c: Context<AppBindings>) {
	const user = c.get("user");

	if (!user) {
		throw new Error("User not found");
	}

	return user;
}


export const COOKIE_AUTH = [
	{
		cookieAuth: [],
	},
];