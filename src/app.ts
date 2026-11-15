import { configureOpenApi } from "@/lib/configure-open-api.js";
import { createApp } from "@/lib/create-app.js";
import { authMiddleware } from "@/middlewares/auth.js";
import budgets from "@/routes/budgets/budgets.index.js";
import categories from "@/routes/categories/categories.index.js";
import index from "@/routes/index.js";
import summary from "@/routes/summary/summary.index.js";
import transactions from "@/routes/transactions/transactions.index.js";

const app = createApp();

configureOpenApi(app);

app.use("*", authMiddleware);

const routes = [index, summary, categories, transactions, budgets];

routes.forEach((route) => {
	app.route("/", route);
});

export default app;
