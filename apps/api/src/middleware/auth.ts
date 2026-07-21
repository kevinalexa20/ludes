import { MiddlewareHandler } from "hono";
import { supabase } from "../lib/supabase.js";

export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);

    try {
      // 1. Get the user from Supabase Auth using the access token
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // 2. Fetch the corresponding record from public.users table
      const { data: userRow, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (dbError || !userRow) {
        // If user is in Auth but not in public.users, return unauthorized
        return c.json({ error: "Unauthorized" }, 401);
      }

      // 3. Attach the user row and token to the context
      c.set("user", userRow);
      c.set("authToken", token);

      await next();
    } catch (err: any) {
      return c.json({ error: "Unauthorized", message: err.message }, 401);
    }
  };
};
