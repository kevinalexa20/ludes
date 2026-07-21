import { MiddlewareHandler } from "hono";

export const loggerMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const startTime = performance.now();
    
    // Wait for the request to be processed
    await next();

    const duration = Math.round(performance.now() - startTime);
    const status = c.res.status;
    const method = c.req.method;
    const path = c.req.path;
    const requestId = c.get("requestId") || "";

    // Extract user/merchant if available on context
    const user = c.get("user") as any;
    const userId = user?.id || null;
    // merchant_profile could be fetched during auth/me or attached when querying
    const merchantId = user?.merchant_id || null;

    let level: "info" | "warn" | "error" = "info";
    if (status >= 500) {
      level = "error";
    } else if (status >= 400) {
      level = "warn";
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      request_id: requestId,
      user_id: userId,
      merchant_id: merchantId,
      action: "http.request",
      result: status < 400 ? "success" : "failure",
      duration_ms: duration,
      metadata: {
        method,
        path,
        status,
      },
    };

    console.log(JSON.stringify(logEntry));
  };
};
