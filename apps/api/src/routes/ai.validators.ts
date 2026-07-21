import { z } from "zod";

export const generateListingSchema = z.object({
  image: z.string().min(1, "Foto makanan harus dikirim dalam format base64."),
  original_price: z.number().int().min(1000, "Harga asli minimal Rp 1.000"),
});
