# Skill: WhatsApp Order Redirect

**Context:** No in-app payment. Consumer clicks "Order via WhatsApp" → system generates pre-filled message → opens WhatsApp with merchant's number. Transaction happens entirely in WA chat.

## Key Rules

1. No order table in database. No payment gateway. Zero backend complexity for orders.
2. WA link format: `https://wa.me/[phone_number]?text=[url_encoded_message]`
3. Phone number comes from merchant profile, formatted internationally (62xxx, no +, no spaces).
4. Message template includes: merchant name, food item, quantity, total price, pickup time.
5. Opens in new tab. If WA doesn't open, show phone number for manual copy.
6. This is a READ-ONLY operation — no API call to backend needed.

## Flow

```
1. Consumer clicks "Order via WhatsApp" button on food detail page
2. FE generates pre-filled message (no backend call)
3. FE constructs wa.me URL with encoded message
4. FE opens URL in new tab (window.open)
5. WhatsApp app/web opens with merchant's number + pre-filled message
6. Consumer sends message → transaction continues in WA
```

## Message Template

```
Halo [merchant_name]! 👋

Saya mau pesan dari Ludes:
🍽️ [food_name]
📦 [quantity] porsi
💰 Rp [total_price]
🕐 Pickup: [pickup_time or "secepatnya"]

Terima kasih!
```

## Phone Number Formatting

```typescript
/**
 * Converts Indonesian phone number to international format for wa.me URL.
 * "0812-3456-7890" → "628123456789"
 * "+62 812 3456 789" → "628123456789"
 * "628123456789" → "628123456789"
 */
const formatPhoneForWA = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  return cleaned;
};
```

## URL Construction

```typescript
const generateWAOrderUrl = (foodItem: FoodItem, merchant: Merchant, quantity: number): string => {
  const phone = formatPhoneForWA(merchant.phone);
  const totalPrice = foodItem.final_price * quantity;
  const pickupTime = foodItem.pickup_time || "secepatnya";

  const message = `Halo ${merchant.name}! 👋\n\nSaya mau pesan dari Ludes:\n🍽️ ${foodItem.name}\n📦 ${quantity} porsi\n💰 Rp ${totalPrice.toLocaleString("id-ID")}\n🕐 Pickup: ${pickupTime}\n\nTerima kasih!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
```

## Fallback

If `window.open()` fails (popup blocker):
- Show modal with phone number displayed
- "Copy nomor" button
- "Buka WhatsApp" button (retry)

## Related Files

- `apps/web/src/lib/wa-order.ts` — URL generation utility
- `apps/web/src/features/browse/pages/food-detail-page.tsx` — order button
- `apps/web/src/features/browse/components/order-button.tsx` — button component with fallback
