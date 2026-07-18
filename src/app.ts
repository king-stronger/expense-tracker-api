
import index from "@/routes/index.js"
import { createApp } from "@/lib/create-app.js";
import { configureOpenApi } from "./lib/configure-open-api.js";
import categories from "@/routes/categories/categories.index.js"

const app = createApp()

const routes = [
    index,
    categories
]

configureOpenApi(app);

routes.forEach(route => app.route("/", route))

export default app;