import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional(),
  role: z.enum(["customer", "merchant"]).default("customer"),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const merchantSchema = z.object({
  name: z.string().min(2, "Nama warung minimal 2 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  phone: z.string().min(8, "Nomor HP minimal 8 digit"),
  description: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

export const foodItemSchema = z.object({
  name: z.string().min(2, "Nama makanan minimal 2 karakter"),
  description: z.string().optional(),
  category: z.enum(["nasi", "mie", "lauk", "kue", "minuman", "snack", "lainnya"]),
  original_price: z.number().int().min(1000, "Harga minimal Rp 1.000"),
  final_price: z.number().int().min(1000, "Harga minimal Rp 1.000"),
  quantity: z.number().int().min(1, "Minimal 1 porsi"),
  pickup_time: z.string().optional(),
  picture_url: z.string().url().optional().or(z.literal("")),
  status: z.enum(["available", "sold_out"]).default("available"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MerchantInput = z.infer<typeof merchantSchema>;
export type FoodItemInput = z.infer<typeof foodItemSchema>;
