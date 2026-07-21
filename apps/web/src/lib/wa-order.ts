import { FoodItem, Merchant } from "@ludes/shared";

/**
 * Converts Indonesian phone number to international format for wa.me URL.
 * "0812-3456-7890" -> "628123456789"
 * "+62 812 3456 789" -> "628123456789"
 * "628123456789" -> "628123456789"
 */
export const formatPhoneForWA = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  return cleaned;
};

/**
 * Generates WhatsApp order URL with pre-filled message.
 */
export const generateWAOrderUrl = (
  foodItem: FoodItem,
  merchant: Merchant,
  quantity: number = 1
): string => {
  const phone = formatPhoneForWA(merchant.phone);
  const totalPrice = foodItem.final_price * quantity;
  const formattedPrice = totalPrice.toLocaleString("id-ID");
  const pickupTime = foodItem.pickup_time || "secepatnya";

  const message = `Halo ${merchant.name}! 👋\n\nSaya mau pesan dari Ludes:\n🍽️ ${foodItem.name}\n📦 ${quantity} porsi\n💰 Rp ${formattedPrice}\n🕐 Pickup: ${pickupTime}\n\nTerima kasih!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
