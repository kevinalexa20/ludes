import "./lib/env-loader.js";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { loggerMiddleware } from "./middleware/logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import authRouter from "./routes/auth.routes.js";
import merchantRouter from "./routes/merchant.routes.js";
import foodRouter from "./routes/food.routes.js";
import aiRouter from "./routes/ai.routes.js";

export interface CustomEnv {
  Variables: {
    requestId: string;
    authToken?: string;
    user?: any;
  };
}

const app = new Hono<CustomEnv>();

// 1. Mount Global Middlewares
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  "/api/*",
  cors({
    origin: corsOrigin,
    allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Type", "X-Request-Id"],
    credentials: true,
  })
);

app.use("*", requestIdMiddleware());
app.use("*", loggerMiddleware());

// 2. Health check route
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// 3. Mount Routers
app.route("/api/auth", authRouter);
app.route("/api/merchants", merchantRouter);
app.route("/api/food", foodRouter);
app.route("/api/ai", aiRouter);

// 4. Global Error Handler
app.onError(errorHandler);

// 5. Start Server
const port = parseInt(process.env.PORT || "3001", 10);
console.log(`Ludes API Server is running on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});
