import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import { foodItemSchema, updateFoodItemSchema, statusPatchSchema } from "./food.validators.js";
import { calculatePricing } from "@ludes/shared";
import { CustomEnv } from "../index.js";

const foodRouter = new Hono<CustomEnv>();

// Haversine distance helper (in kilometers)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/food
// Public: list available food items
foodRouter.get("/", async (c) => {
  const category = c.req.query("category");
  const sort = c.req.query("sort") || "date";
  const limit = Math.min(parseInt(c.req.query("limit") || "20", 10), 100);
  const offset = parseInt(c.req.query("offset") || "0", 10);
  const lat = c.req.query("lat");
  const lng = c.req.query("lng");

  try {
    let query = supabase
      .from("food_items")
      .select("*, merchant:merchants(*)", { count: "exact" })
      .eq("status", "available");

    if (category && category !== "Semua" && category !== "") {
      query = query.eq("category", category.toLowerCase());
    }

    if (sort === "price") {
      query = query.order("final_price", { ascending: true });
    } else if (sort === "date") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: items, count, error } = await query;

    if (error) {
      return c.json({ error: `Gagal mengambil data makanan: ${error.message}` }, 500);
    }

    let result = (items || []) as any[];

    // Handle distance calculation if coordinates are provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      if (!isNaN(userLat) && !isNaN(userLng)) {
        result = result.map((item) => {
          let distance = null;
          if (item.merchant && item.merchant.latitude && item.merchant.longitude) {
            distance = calculateDistanceKm(
              userLat,
              userLng,
              item.merchant.latitude,
              item.merchant.longitude
            );
          }
          return {
            ...item,
            distance_km: distance !== null ? parseFloat(distance.toFixed(2)) : null,
          };
        });

        // Sort by distance if specified
        if (sort === "distance") {
          result.sort((a, b) => {
            if (a.distance_km === null) return 1;
            if (b.distance_km === null) return -1;
            return a.distance_km - b.distance_km;
          });
        }
      }
    }

    return c.json({
      data: result,
      total: count || 0,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/food/my
// Protected (merchant): list merchant's own food items
foodRouter.get("/my", authMiddleware(), async (c) => {
  const user = c.get("user");
  if (!user || user.role !== "merchant") {
    return c.json({ error: "Hanya pedagang (merchant) yang dapat mengakses menu ini." }, 403);
  }

  try {
    // 1. Get merchant profile
    const { data: merchant, error: mError } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mError) {
      return c.json({ error: `Gagal memverifikasi merchant: ${mError.message}` }, 500);
    }

    if (!merchant) {
      return c.json({ error: "Profil warung tidak ditemukan. Silakan buat profil terlebih dahulu." }, 404);
    }

    // 2. Fetch food items for this merchant
    const { data: items, error: fError } = await supabase
      .from("food_items")
      .select("*")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false });

    if (fError) {
      return c.json({ error: `Gagal mengambil menu makanan: ${fError.message}` }, 500);
    }

    return c.json({ data: items || [] });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /api/food/:id
// Public: get detail of single food item
foodRouter.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const { data: item, error } = await supabase
      .from("food_items")
      .select("*, merchant:merchants(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return c.json({ error: `Gagal mengambil detail makanan: ${error.message}` }, 500);
    }

    if (!item) {
      return c.json({ error: "Menu makanan tidak ditemukan" }, 404);
    }

    return c.json(item);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/food
// Protected (merchant): create food listing
foodRouter.post("/", authMiddleware(), zValidator("json", foodItemSchema), async (c) => {
  const user = c.get("user");
  if (!user || user.role !== "merchant") {
    return c.json({ error: "Hanya pedagang (merchant) yang dapat membuat menu makanan." }, 403);
  }

  const input = c.req.valid("json");

  try {
    // 1. Get merchant profile ID
    const { data: merchant, error: mError } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mError) {
      return c.json({ error: `Gagal memverifikasi profil warung: ${mError.message}` }, 500);
    }

    if (!merchant) {
      return c.json({ error: "Silakan lengkapi profil warung terlebih dahulu sebelum memasang menu makanan." }, 400);
    }

    // 2. Validate floor price (60% of original price)
    const floorPrice = Math.ceil(input.original_price * 0.6);
    if (input.final_price < floorPrice) {
      return c.json(
        {
          error: `Harga final (Rp ${input.final_price.toLocaleString("id-ID")}) tidak boleh lebih rendah dari harga lantai (Rp ${floorPrice.toLocaleString("id-ID")}) demi melindungi keuntungan warung kamu.`,
        },
        400
      );
    }

    // 3. Compute suggested min/max prices if not already calculated
    const pricing = calculatePricing(input.original_price, input.category, 2);

    // 4. Save food item
    const { data: newItem, error: fError } = await supabase
      .from("food_items")
      .insert({
        merchant_id: merchant.id,
        name: input.name,
        description: input.description || null,
        category: input.category,
        original_price: input.original_price,
        suggested_min_price: pricing.suggestedMin,
        suggested_max_price: pricing.suggestedMax,
        final_price: input.final_price,
        quantity: input.quantity,
        pickup_time: input.pickup_time || null,
        picture_url: input.picture_url || null,
        status: input.status || "available",
      })
      .select("*")
      .single();

    if (fError) {
      return c.json({ error: `Gagal memasang makanan: ${fError.message}` }, 400);
    }

    return c.json(newItem, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /api/food/:id
// Protected (merchant): update food item
foodRouter.put("/:id", authMiddleware(), zValidator("json", updateFoodItemSchema), async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  if (!user || user.role !== "merchant") {
    return c.json({ error: "Hanya pedagang (merchant) yang dapat mengubah menu makanan." }, 403);
  }

  const updates = c.req.valid("json");

  try {
    // 1. Get current merchant profile
    const { data: merchant, error: mError } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mError || !merchant) {
      return c.json({ error: "Profil warung tidak ditemukan." }, 404);
    }

    // 2. Fetch the food item to verify ownership
    const { data: existingItem, error: fetchError } = await supabase
      .from("food_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existingItem) {
      return c.json({ error: "Menu makanan tidak ditemukan." }, 404);
    }

    if (existingItem.merchant_id !== merchant.id) {
      return c.json({ error: "Anda tidak memiliki hak untuk mengubah makanan ini." }, 403);
    }

    // 3. Re-validate floor price if original or final price are changing
    const originalPrice = updates.original_price ?? existingItem.original_price;
    const finalPrice = updates.final_price ?? existingItem.final_price;
    const category = updates.category ?? existingItem.category;

    const floorPrice = Math.ceil(originalPrice * 0.6);
    if (finalPrice < floorPrice) {
      return c.json(
        {
          error: `Harga final (Rp ${finalPrice.toLocaleString("id-ID")}) tidak boleh lebih rendah dari harga lantai (Rp ${floorPrice.toLocaleString("id-ID")}) demi melindungi keuntungan warung kamu.`,
        },
        400
      );
    }

    // Compute updated suggestions if original price or category changed
    let suggestedMin = existingItem.suggested_min_price;
    let suggestedMax = existingItem.suggested_max_price;
    if (updates.original_price !== undefined || updates.category !== undefined) {
      const pricing = calculatePricing(originalPrice, category, 2);
      suggestedMin = pricing.suggestedMin;
      suggestedMax = pricing.suggestedMax;
    }

    // 4. Update the food item
    const { data: updatedItem, error: updateError } = await supabase
      .from("food_items")
      .update({
        name: updates.name,
        description: updates.description,
        category: updates.category,
        original_price: updates.original_price,
        suggested_min_price: suggestedMin,
        suggested_max_price: suggestedMax,
        final_price: updates.final_price,
        quantity: updates.quantity,
        pickup_time: updates.pickup_time,
        picture_url: updates.picture_url,
        status: updates.status,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      return c.json({ error: `Gagal memperbarui menu makanan: ${updateError.message}` }, 400);
    }

    return c.json(updatedItem);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DELETE /api/food/:id
// Protected (merchant): delete food item
foodRouter.delete("/:id", authMiddleware(), async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  if (!user || user.role !== "merchant") {
    return c.json({ error: "Hanya pedagang (merchant) yang dapat menghapus menu makanan." }, 403);
  }

  try {
    // 1. Get current merchant profile
    const { data: merchant, error: mError } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mError || !merchant) {
      return c.json({ error: "Profil warung tidak ditemukan." }, 404);
    }

    // 2. Fetch the food item to verify ownership
    const { data: existingItem, error: fetchError } = await supabase
      .from("food_items")
      .select("merchant_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existingItem) {
      return c.json({ error: "Menu makanan tidak ditemukan." }, 404);
    }

    if (existingItem.merchant_id !== merchant.id) {
      return c.json({ error: "Anda tidak memiliki hak untuk menghapus makanan ini." }, 403);
    }

    // 3. Delete from database
    const { error: deleteError } = await supabase
      .from("food_items")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return c.json({ error: `Gagal menghapus makanan: ${deleteError.message}` }, 400);
    }

    return c.json({ message: "Menu makanan berhasil dihapus" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PATCH /api/food/:id/status
// Protected (merchant): toggle available/sold_out
foodRouter.patch("/:id/status", authMiddleware(), zValidator("json", statusPatchSchema), async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  if (!user || user.role !== "merchant") {
    return c.json({ error: "Hanya pedagang (merchant) yang dapat mengubah status makanan." }, 403);
  }

  const { status } = c.req.valid("json");

  try {
    // 1. Get current merchant profile
    const { data: merchant, error: mError } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mError || !merchant) {
      return c.json({ error: "Profil warung tidak ditemukan." }, 404);
    }

    // 2. Fetch the food item to verify ownership
    const { data: existingItem, error: fetchError } = await supabase
      .from("food_items")
      .select("merchant_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existingItem) {
      return c.json({ error: "Menu makanan tidak ditemukan." }, 404);
    }

    if (existingItem.merchant_id !== merchant.id) {
      return c.json({ error: "Anda tidak memiliki hak untuk mengubah makanan ini." }, 403);
    }

    // 3. Update status
    const { data: updatedItem, error: updateError } = await supabase
      .from("food_items")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      return c.json({ error: `Gagal mengubah status makanan: ${updateError.message}` }, 400);
    }

    return c.json(updatedItem);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default foodRouter;
