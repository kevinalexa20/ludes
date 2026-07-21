import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../middleware/auth.js";
import { generateListingSchema } from "./ai.validators.js";
import { generateListingFromPhoto } from "../services/ai-listing.service.js";
import { CustomEnv } from "../index.js";

const aiRouter = new Hono<CustomEnv>();

interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(userId);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(userId, {
      count: 1,
      resetTime: now + 60 * 1000, // 1 minute
    });
    return false;
  }

  if (limit.count >= 10) {
    return true;
  }

  limit.count++;
  return false;
}

aiRouter.post(
  "/generate-listing",
  authMiddleware(),
  zValidator("json", generateListingSchema),
  async (c) => {
    const user = c.get("user");
    if (!user || user.role !== "merchant") {
      return c.json({ error: "Hanya pedagang (merchant) yang dapat membuat listing menggunakan AI." }, 403);
    }

    if (checkRateLimit(user.id)) {
      return c.json({ error: "Batas limit pembuatan listing AI tercapai. Silakan coba lagi dalam satu menit." }, 429);
    }

    const { image, original_price } = c.req.valid("json");

    try {
      const listing = await generateListingFromPhoto(image, original_price);
      return c.json(listing);
    } catch (error: any) {
      console.error(`AI generate listing error: ${error.message}`);
      return c.json({ error: error.message || "Terjadi kesalahan pada AI." }, 500);
    }
  }
);

export default aiRouter;
