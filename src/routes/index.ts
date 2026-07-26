import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { createRouter } from "@/lib/create-app.js";

const router = createRouter().openapi(
	createRoute({
		tags: ["Index"],
		path: "/",
		method: "get",
		responses: {
			[HttpStatusCodes.OK]: jsonContent(
				createMessageObjectSchema("Expense Tracker API"),
				"Expense Tracker API Index",
			),
		},
	}),
	(c) =>
		c.json(
			{
				message: "Expense Tracker API",
			},
			HttpStatusCodes.OK,
		),
);

export default router;
