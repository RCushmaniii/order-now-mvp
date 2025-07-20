-- ============================================
-- SUPABASE SETUP: User-Store Linking & RLS
-- ============================================
-- This SQL script sets up user-store linking, automatic profile creation,
-- and Row Level Security (RLS) policies for the YapaNow admin dashboard.

-- ============================================
-- 0. SCHEMA DIAGNOSTIC & MISSING COLUMNS
-- ============================================
-- First, let's check and add any missing columns

-- Check if store_id exists in profiles table, add if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'store_id') THEN
        ALTER TABLE public.profiles ADD COLUMN store_id UUID REFERENCES public.stores(id);
    END IF;
END $$;

-- Check if store_id exists in orders table, add if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'store_id') THEN
        ALTER TABLE public.orders ADD COLUMN store_id UUID REFERENCES public.stores(id);
    END IF;
END $$;

-- Check if store_id exists in menu_items table, add if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_items' AND column_name = 'store_id') THEN
        ALTER TABLE public.menu_items ADD COLUMN store_id UUID REFERENCES public.stores(id);
    END IF;
END $$;

-- Add updated_at column to profiles if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add created_at column to profiles if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- 1. AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================
-- This function automatically creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 2. PROFILE UPDATE TRIGGER
-- ============================================
-- This function updates the updated_at timestamp when a profile is modified
CREATE OR REPLACE FUNCTION public.handle_profile_update() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_profile_update();

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- STORES TABLE POLICIES
-- ============================================

-- Users can only view stores they are associated with
CREATE POLICY "Users can view associated store" ON public.stores
  FOR SELECT USING (
    id IN (
      SELECT store_id FROM public.profiles 
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

-- Users can update stores they are associated with
CREATE POLICY "Users can update associated store" ON public.stores
  FOR UPDATE USING (
    id IN (
      SELECT store_id FROM public.profiles 
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

-- ============================================
-- MENU_ITEMS TABLE POLICIES
-- ============================================

-- Users can view menu items for their store
CREATE POLICY "Users can view store menu items" ON public.menu_items
  FOR SELECT USING (
    store_id IN (
      SELECT store_id FROM public.profiles 
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

-- Users can manage menu items for their store
CREATE POLICY "Users can manage store menu items" ON public.menu_items
  FOR ALL USING (
    store_id IN (
      SELECT store_id FROM public.profiles 
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Users can view orders for their store
CREATE POLICY "Users can view store orders" ON public.orders
  FOR SELECT USING (
    store_id IN (
      SELECT store_id FROM public.profiles 
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

-- Users can update orders for their store
CREATE POLICY "Users can update store orders" ON public.orders
  FOR UPDATE USING (
    store_id IN (
      SELECT store_id FROM public.profiles 
      WHERE id = auth.uid() AND store_id IS NOT NULL
    )
  );

-- ============================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================

-- Users can view order items for orders in their store
CREATE POLICY "Users can view store order items" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE store_id IN (
        SELECT store_id FROM public.profiles 
        WHERE id = auth.uid() AND store_id IS NOT NULL
      )
    )
  );

-- ============================================
-- 4. SAMPLE DATA FOR TESTING
-- ============================================
-- Uncomment and modify these INSERT statements to create test data

-- Insert a test store (replace with your actual store data)
/*
INSERT INTO public.stores (id, name, description, address, phone, email, is_active)
VALUES (
  'test-store-id',
  'Test Restaurant',
  'A test restaurant for development',
  '123 Test Street, Test City',
  '+523315590572',
  'test@restaurant.com',
  true
);
*/

-- Link your user to the test store (replace 'your-user-id' with actual user ID)
/*
UPDATE public.profiles 
SET store_id = 'test-store-id'
WHERE id = 'your-user-id';
*/

-- ============================================
-- 5. USEFUL QUERIES FOR DEBUGGING
-- ============================================

-- Check all profiles and their store associations
-- SELECT p.id, p.email, p.full_name, p.store_id, s.name as store_name
-- FROM public.profiles p
-- LEFT JOIN public.stores s ON p.store_id = s.id;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

-- ============================================
-- NOTES FOR MANUAL USER-STORE LINKING
-- ============================================
-- To manually link a user to a store:
-- 1. Get the user ID from the Supabase Auth dashboard
-- 2. Get the store ID from your stores table
-- 3. Run: UPDATE public.profiles SET store_id = 'your-store-id' WHERE id = 'your-user-id';

-- To create a new store and link it to a user:
-- 1. INSERT INTO public.stores (name, description, address, phone, email, is_active) VALUES (...);
-- 2. Get the new store ID
-- 3. UPDATE public.profiles SET store_id = 'new-store-id' WHERE id = 'user-id';
