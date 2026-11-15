import { z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { COOKIE_AUTH } from "@/lib/helper.js";
import { protectedRoute } from "@/middlewares/auth.js";

const tags = ["Summary"];

const monthQuerySchema = z.object({
	month: z.coerce.number().int().min(1).max(12).optional().openapi({
		param: { name: "month", in: "query" },
		example: 11,
	}),
	year: z.coerce.number().int().min(2000).max(2100).optional().openapi({
		param: { name: "year", in: "query" },
		example: 2026,
	}),
});

const categorySummarySchema = z.object({
	categoryId: z.string().uuid(),
	categoryName: z.string(),
	spent: z.number().int(),
	budget: z.number().int().nullable(),
	remaining: z.number().int().nullable(),
	percentUsed: z.number().int().nullable(),
	overBudget: z.boolean(),
});

export const monthSummarySchema = z.object({
	month: z.number().int(),
	year: z.number().int(),
	incomeTotal: z.number().int(),
	expenseTotal: z.number().int(),
	balance: z.number().int(),
	categories: z.array(categorySummarySchema),
});

export const getMonth = protectedRoute({
	tags,
	method: "get",
	path: "/summary",
	security: COOKIE_AUTH,
	request: {
		query: monthQuerySchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			monthSummarySchema,
			"Monthly income, expenses and budget remaining",
		),
		[HttpStatusCodes.UNAUTHORIZED]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
			"User not authentified",
		),
	},
});

export type GetMonthRoute = typeof getMonth;
