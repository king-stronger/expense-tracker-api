import { createRouter } from "@/lib/create-app.js";
import * as routes from "@/routes/budgets/budgets.routes.js"
import * as handlers from "@/routes/budgets/budgets.handlers.js"

const router = createRouter()
    .openapi(routes.list, handlers.list)
    .openapi(routes.create, handlers.create)
    .openapi(routes.update, handlers.update)
    .openapi(routes.remove, handlers.remove)

export default router;