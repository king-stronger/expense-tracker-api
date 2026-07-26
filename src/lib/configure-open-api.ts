import type { AppOpenApi } from "./types.js";
import { Scalar } from "@scalar/hono-api-reference";
import packageJson from "../../package.json" with { type: "json" }

export function configureOpenApi(app: AppOpenApi){
    app.openAPIRegistry.registerComponent(
        "securitySchemes",
        "cookieAuth",
        {
            type: "apiKey",
            in: "cookie",
            name: "better-auth.session_token",
        }
    );
    
    app.doc("/doc", {
        openapi: "3.1.0",
        info: {
            version: packageJson.version,
            title: "Expense Tracker"
        }     
    })

    app.get("/scalar", Scalar({
        url: "/doc",
        theme: "kepler",
        layout: "modern",
        defaultHttpClient: {
            targetKey: "js",
            clientKey: "fetch"
        }
    }))
}