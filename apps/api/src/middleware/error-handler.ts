import { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = async (err, c) => {
  const requestId = c.get("requestId") || "";
  const method = c.req.method;
  const path = c.req.path;
  
  // Log the full error to stdout/stderr in structured format
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "error",
    request_id: requestId,
    user_id: (c.get("user") as any)?.id || null,
    merchant_id: null,
    action: "http.error",
    result: "failure",
    duration_ms: 0,
    error: err.message,
    metadata: {
      method,
      path,
      stack: err.stack,
    },
  };
  
  console.error(JSON.stringify(logEntry));

  // Check if error has status code (e.g. from Hono HTTPException)
  const status = (err as any).status || 500;
  
  return c.json(
    { 
      error: status === 500 ? "Internal server error" : err.message, 
      request_id: requestId 
    },
    status
  );
};
