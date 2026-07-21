import { MiddlewareHandler } from "hono";

export const requestIdMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const requestId = crypto.randomUUID();
    c.set("requestId", requestId);
    c.header("X-Request-Id", requestId);
    await next();
  };
};
