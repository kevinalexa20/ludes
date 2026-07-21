import { z } from "zod";
import { foodItemSchema } from "@ludes/shared";

export const updateFoodItemSchema = foodItemSchema.partial();

export const statusPatchSchema = z.object({
  status: z.enum(["available", "sold_out"], {
    errorMap: () => ({ message: "Status harus 'available' atau 'sold_out'" }),
  }),
});

export { foodItemSchema };
