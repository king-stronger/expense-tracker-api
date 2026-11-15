import { createRouter } from "@/lib/create-app.js";
import * as handlers from "@/routes/summary/summary.handlers.js";
import * as routes from "@/routes/summary/summary.routes.js";

const router = createRouter().openapi(routes.getMonth, handlers.getMonth);

export default router;
