-- Enable PostGIS for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'merchant')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Merchant profiles
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT NOT NULL,
  description TEXT,
  picture_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Food listings
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('nasi', 'mie', 'lauk', 'kue', 'minuman', 'snack', 'lainnya')),
  original_price INTEGER NOT NULL CHECK (original_price >= 1000),
  suggested_min_price INTEGER,
  suggested_max_price INTEGER,
  final_price INTEGER NOT NULL CHECK (final_price >= 1000),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  pickup_time TEXT,
  picture_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_food_items_status ON food_items(status) WHERE status = 'available';
CREATE INDEX IF NOT EXISTS idx_food_items_merchant ON food_items(merchant_id);
CREATE INDEX IF NOT EXISTS idx_food_items_created ON food_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchants_user ON merchants(user_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Users can read all, write own
CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- Merchants readable by all, writable by owner
CREATE POLICY "merchants_select_all" ON merchants FOR SELECT USING (true);
CREATE POLICY "merchants_insert_own" ON merchants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "merchants_update_own" ON merchants FOR UPDATE USING (auth.uid() = user_id);

-- Food items readable by all, writable by merchant owner
CREATE POLICY "food_items_select_all" ON food_items FOR SELECT USING (true);
CREATE POLICY "food_items_merchant_write" ON food_items FOR ALL
  USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));
