-- ============================================
-- TEST STORE SETUP: Dr. Verduras Conservation Biology Books
-- ============================================
-- This SQL creates a conservation biology bookstore and links it to your user account
-- Demonstrates generic schema that works for any business type (books, food, services, etc.)

-- ============================================
-- 0. ADD STORE TYPE SUPPORT (IF NEEDED)
-- ============================================
-- Add business_type column to stores table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stores' AND column_name = 'business_type') THEN
        ALTER TABLE public.stores ADD COLUMN business_type TEXT DEFAULT 'retail';
    END IF;
END $$;

-- Add metadata column for flexible store configuration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stores' AND column_name = 'metadata') THEN
        ALTER TABLE public.stores ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- ============================================
-- 1. INSERT TEST STORE - CONSERVATION BIOLOGY BOOKS
-- ============================================
-- Insert the "Dr. Verduras Conservation Biology Books" store
-- First, we need to get your user ID to set as the store owner
-- Run this query first to get your user ID:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Then replace 'YOUR_USER_ID_HERE' below with your actual user ID
INSERT INTO public.stores (
  id,
  owner_id,
  name,
  description,
  address,
  phone,
  business_type,
  metadata,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID from the query above
  'Dr. Verduras Conservation Biology Books',
  'Libros especializados en biología de la conservación y estudios ecológicos - Specialized books on conservation biology and ecological studies',
  'Guadalajara, Jalisco, México',
  '+523315590572',
  'bookstore',
  '{
    "specialties": ["conservation_biology", "ecology", "environmental_science"],
    "languages": ["spanish", "english"],
    "author_bio": "Conservation biologist and published author specializing in ecological research",
    "contact_email": "books@drverduras.com",
    "shipping_available": true,
    "digital_downloads": true
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  business_type = EXCLUDED.business_type,
  metadata = EXCLUDED.metadata,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================
-- 2. LINK YOUR USER TO THE STORE
-- ============================================
-- Get your user ID and link to the store
-- First, let's see all current users to identify yours:

-- STEP 1: Run this query to see all users and find your user ID
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as user_created,
  p.id as profile_id,
  p.full_name,
  p.store_id,
  s.name as store_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.stores s ON p.store_id = s.id
ORDER BY au.created_at DESC;

-- ============================================
-- 3. LINK USER TO STORE (REPLACE USER_ID)
-- ============================================
-- After running the query above, replace 'YOUR_USER_ID_HERE' with your actual user ID

-- First, get the store UUID:
-- SELECT id, name FROM public.stores WHERE name = 'Dr. Verduras Conservation Biology Books';
-- Then update your profile with the actual UUID:
-- UPDATE public.profiles 
-- SET store_id = 'ACTUAL_STORE_UUID_FROM_ABOVE_QUERY'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================
-- After linking, run these to verify everything is working:

-- Check your profile and store linkage
SELECT 
  p.id as profile_id,
  p.email,
  p.full_name,
  p.store_id,
  s.name as store_name,
  s.description,
  s.business_type,
  s.metadata,
  s.is_active
FROM public.profiles p
LEFT JOIN public.stores s ON p.store_id = s.id
WHERE p.id = auth.uid();

-- Check store details
SELECT 
  id,
  name,
  description,
  address,
  phone,
  business_type,
  metadata,
  is_active,
  created_at
FROM public.stores 
WHERE name = 'Dr. Verduras Conservation Biology Books';

-- ============================================
-- 5. SAMPLE PRODUCTS - BOOKS & SURVEYS (OPTIONAL)
-- ============================================
-- Uncomment to add sample conservation biology books and ecological surveys
-- Note: Using generic 'menu_items' table but with book/survey data

/*
-- First get the store UUID:
-- SELECT id FROM public.stores WHERE name = 'Dr. Verduras Conservation Biology Books';
-- Then replace STORE_UUID_HERE with the actual UUID

INSERT INTO public.menu_items (
  id,
  store_id,
  name,
  description,
  price,
  category,
  is_available,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'STORE_UUID_HERE',
  'Biodiversidad en Ecosistemas Tropicales',
  'Estudio completo sobre la biodiversidad en ecosistemas tropicales de México. 350 páginas con fotografías a color.',
  450.00,
  'Libros',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'STORE_UUID_HERE',
  'Conservation Biology: Field Methods',
  'Comprehensive guide to field research methods in conservation biology. English edition, 280 pages.',
  380.00,
  'Libros',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'STORE_UUID_HERE',
  'Estudio Ecológico Personalizado',
  'Consultoría y estudio ecológico personalizado para tu área de interés. Incluye análisis de biodiversidad y recomendaciones.',
  2500.00,
  'Servicios',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'STORE_UUID_HERE',
  'Guía de Campo: Flora Nativa de Jalisco',
  'Guía ilustrada de la flora nativa de Jalisco con claves de identificación. Ideal para estudiantes y naturalistas.',
  320.00,
  'Libros',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'STORE_UUID_HERE',
  'PDF: Metodologías de Muestreo Ecológico',
  'Descarga digital: Manual completo de metodologías de muestreo para estudios ecológicos. Formato PDF.',
  150.00,
  'Digitales',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
*/

-- ============================================
-- 6. SAMPLE ORDER (OPTIONAL)
-- ============================================
-- Uncomment to create a sample book order for testing dashboard stats

/*
INSERT INTO public.orders (
  id,
  store_id,
  customer_name,
  customer_phone,
  customer_email,
  total_amount,
  status,
  notes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'STORE_UUID_HERE',
  'Dr. María González',
  '+523315590572',
  'maria.gonzalez@universidad.edu.mx',
  830.00,
  'completed',
  'Pedido de libros para investigación universitaria - Biodiversidad + Conservation Biology',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample order items
INSERT INTO public.order_items (
  id,
  order_id,
  menu_item_id,
  quantity,
  unit_price,
  total_price
) VALUES 
(
  'order-item-001',
  'test-order-001',
  'book-001',
  1,
  450.00,
  450.00
),
(
  'order-item-002',
  'test-order-001',
  'book-002',
  1,
  380.00,
  380.00
) ON CONFLICT (id) DO NOTHING;
*/
