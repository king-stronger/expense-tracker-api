import { createAuth } from "@/lib/auth.js";
import { configureOpenApi } from "@/lib/configure-open-api.js";
import { createApp } from "@/lib/create-app.js";
import { authMiddleware, requireAuth } from "@/middlewares/auth.js";
import budgets from "@/routes/budgets/budgets.index.js";
import categories from "@/routes/categories/categories.index.js";
import index from "@/routes/index.js";
import transactions from "@/routes/transactions/transactions.index.js";

const app = createApp();

const routes = [index, categories, transactions, budgets];

configureOpenApi(app);

app.on(["GET", "POST"], "/api/auth/*", (c) => {
	const auth = createAuth(c.env);

	return auth.handler(c.req.raw);
});

app.use("*", authMiddleware);
app.use("*", requireAuth);

routes.forEach((route) => {
	app.route("/", route);
});

export default app;
