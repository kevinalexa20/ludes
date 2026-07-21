import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { registerSchema, loginSchema } from "@ludes/shared";
import { supabase, createAdminClient } from "../lib/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import { CustomEnv } from "../index.js";

const authRouter = new Hono<CustomEnv>();

// POST /api/auth/register
authRouter.post("/register", zValidator("json", registerSchema), async (c) => {
  const { name, email, password, role, phone } = c.req.valid("json");

  try {
    // 1. Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      if (
        authError.message.toLowerCase().includes("already registered") ||
        authError.message.toLowerCase().includes("already been registered") ||
        authError.status === 409 ||
        authError.code === "email_exists"
      ) {
        return c.json({ error: "Email already registered" }, 409);
      }
      return c.json({ error: authError.message }, 400);
    }

    if (!authData.user) {
      return c.json({ error: "Failed to create user account" }, 400);
    }

    // 2. Insert into public.users table
    const { error: dbError } = await supabase.from("users").insert({
      id: authData.user.id,
      name,
      email,
      role,
      phone: phone || null,
    });

    if (dbError) {
      // Cleanup auth user on database insert failure
      await supabase.auth.admin.deleteUser(authData.user.id);
      return c.json({ error: `Failed to save user profile: ${dbError.message}` }, 400);
    }

    // 3. Sign in to retrieve access token
    const authClient = createAdminClient();
    const { data: sessionData, error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !sessionData.session) {
      return c.json({ error: "Account created but sign-in failed. Please login manually." }, 400);
    }

    // 4. Fetch the final user profile row
    const { data: userRow } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    return c.json(
      {
        user: userRow,
        token: sessionData.session.access_token,
      },
      201
    );
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/auth/login
authRouter.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    const authClient = createAdminClient();
    const { data: sessionData, error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !sessionData.session) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const { data: userRow, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", sessionData.user.id)
      .single();

    if (dbError || !userRow) {
      return c.json({ error: "User profile not found" }, 404);
    }

    return c.json({
      user: userRow,
      token: sessionData.session.access_token,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/auth/logout
authRouter.post("/logout", authMiddleware(), async (c) => {
  const token = c.get("authToken") as string;
  try {
    if (token) {
      // Invalidate the session on Supabase
      await supabase.auth.admin.signOut(token);
    }
    return c.json({ message: "Logged out" });
  } catch (err: any) {
    // Return success anyway as client will clear token
    return c.json({ message: "Logged out" });
  }
});

// GET /api/auth/me
authRouter.get("/me", authMiddleware(), async (c) => {
  const user = c.get("user") as any;

  try {
    let merchantProfile = null;

    if (user.role === "merchant") {
      const { data: profile } = await supabase
        .from("merchants")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      merchantProfile = profile;
    }

    return c.json({
      user,
      merchant_profile: merchantProfile,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default authRouter;
