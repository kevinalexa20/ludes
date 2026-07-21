export const DISCOUNT_RULES = {
  nasi: { maxDiscountPct: 40, label: "Makanan berat" },
  mie: { maxDiscountPct: 40, label: "Mie/Bakso" },
  lauk: { maxDiscountPct: 40, label: "Lauk pauk" },
  kue: { maxDiscountPct: 50, label: "Kue/Snack" },
  minuman: { maxDiscountPct: 50, label: "Minuman" },
  snack: { maxDiscountPct: 50, label: "Snack" },
  lainnya: { maxDiscountPct: 45, label: "Lainnya" },
} as const;

export const TIME_MULTIPLIER = [
  { hoursBeforeClose: 4, multiplier: 0.0 },
  { hoursBeforeClose: 3, multiplier: 0.25 },
  { hoursBeforeClose: 2, multiplier: 0.5 },
  { hoursBeforeClose: 1, multiplier: 0.75 },
  { hoursBeforeClose: 0, multiplier: 1.0 },
] as const;

export const FLOOR_PRICE_PCT = 0.6;

export function calculatePricing(
  originalPrice: number,
  category: keyof typeof DISCOUNT_RULES,
  hoursBeforeClose: number = 2
): { suggestedMin: number; suggestedMax: number; discountPct: number; floorPrice: number } {
  const rule = DISCOUNT_RULES[category] ?? DISCOUNT_RULES.lainnya;
  const maxDiscount = rule.maxDiscountPct / 100;

  const timeEntry = TIME_MULTIPLIER.reduce((prev, curr) =>
    Math.abs(curr.hoursBeforeClose - hoursBeforeClose) < Math.abs(prev.hoursBeforeClose - hoursBeforeClose)
      ? curr
      : prev
  );

  const timeAdjustedDiscount = maxDiscount * (0.5 + 0.5 * timeEntry.multiplier);
  const floorPrice = Math.ceil(originalPrice * FLOOR_PRICE_PCT);
  const maxDiscountPrice = Math.ceil(originalPrice * (1 - timeAdjustedDiscount));

  const suggestedMin = Math.max(floorPrice, Math.ceil(maxDiscountPrice * 0.9));
  const suggestedMax = Math.max(suggestedMin, maxDiscountPrice);

  const discountPct = Math.round(((originalPrice - suggestedMin) / originalPrice) * 100);

  return { suggestedMin, suggestedMax, discountPct, floorPrice };
}
