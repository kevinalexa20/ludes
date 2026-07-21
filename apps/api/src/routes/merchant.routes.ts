import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import { merchantSchema, updateMerchantSchema } from "./merchant.validators.js";
import { CustomEnv } from "../index.js";

const merchantRouter = new Hono<CustomEnv>();

// GET /api/merchants/me
merchantRouter.get("/me", authMiddleware(), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { data: merchant, error } = await supabase
      .from("merchants")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return c.json({ error: `Gagal mengambil profil merchant: ${error.message}` }, 500);
    }

    if (!merchant) {
      return c.json({ error: "Belum punya profil warung" }, 404);
    }

    return c.json(merchant);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/merchants
merchantRouter.post("/", authMiddleware(), zValidator("json", merchantSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (user.role !== "merchant") {
    return c.json({ error: "Hanya pengguna dengan peran pedagang (merchant) yang dapat membuat profil warung." }, 403);
  }

  const { name, address, phone, description, latitude, longitude } = c.req.valid("json");

  try {
    // Check if merchant profile already exists
    const { data: existing, error: checkError } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) {
      return c.json({ error: `Gagal memverifikasi profil: ${checkError.message}` }, 500);
    }

    if (existing) {
      return c.json({ error: "Profil warung untuk akun ini sudah ada" }, 409);
    }

    // Insert new merchant profile
    const { data: newMerchant, error: insertError } = await supabase
      .from("merchants")
      .insert({
        user_id: user.id,
        name,
        address,
        phone,
        description: description || null,
        latitude,
        longitude,
      })
      .select("*")
      .single();

    if (insertError) {
      return c.json({ error: `Gagal membuat profil warung: ${insertError.message}` }, 400);
    }

    return c.json(newMerchant, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/merchants/me
merchantRouter.put("/me", authMiddleware(), zValidator("json", updateMerchantSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const updates = c.req.valid("json");

  try {
    // Check if profile exists
    const { data: existing, error: checkError } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) {
      return c.json({ error: `Gagal memverifikasi profil: ${checkError.message}` }, 500);
    }

    if (!existing) {
      return c.json({ error: "Profil warung tidak ditemukan. Silakan buat profil terlebih dahulu." }, 404);
    }

    // Update merchant profile
    const { data: updatedMerchant, error: updateError } = await supabase
      .from("merchants")
      .update(updates)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (updateError) {
      return c.json({ error: `Gagal memperbarui profil warung: ${updateError.message}` }, 400);
    }

    return c.json(updatedMerchant);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default merchantRouter;
