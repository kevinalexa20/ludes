export type UserRole = "customer" | "merchant";
export type FoodItemStatus = "available" | "sold_out";
export type FoodCategory = "nasi" | "mie" | "lauk" | "kue" | "minuman" | "snack" | "lainnya";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export interface Merchant {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  description?: string;
  picture_url?: string;
  created_at: string;
}

export interface FoodItem {
  id: string;
  merchant_id: string;
  merchant?: Merchant;
  name: string;
  description?: string;
  category: FoodCategory;
  original_price: number;
  suggested_min_price: number;
  suggested_max_price: number;
  final_price: number;
  quantity: number;
  pickup_time?: string;
  picture_url?: string;
  status: FoodItemStatus;
  created_at: string;
}

export interface PricingSuggestion {
  suggested_min: number;
  suggested_max: number;
  suggested_discount_pct: number;
  reason: string;
  floor_price: number;
}

export interface AIListingResult {
  name: string;
  description: string;
  category: FoodCategory;
  pricing: PricingSuggestion;
  marketing_caption: string;
}
