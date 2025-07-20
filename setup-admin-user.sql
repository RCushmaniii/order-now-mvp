-- ============================================
-- SETUP ADMIN USER: Robert Cushman
-- ============================================
-- This script sets up your admin user with password and store access
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: UPDATE YOUR EXISTING USER WITH PASSWORD
-- ============================================

-- Update your existing user to have a password
UPDATE auth.users 
SET 
    encrypted_password = crypt('Olverines17!', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'rcushmaniii@gmail.com';

-- ============================================
-- STEP 2: ENSURE YOUR PROFILE EXISTS AND IS LINKED TO STORE
-- ============================================

-- Update your profile with full name and link to store
UPDATE public.profiles 
SET 
    full_name = 'Robert Cushman',
    store_id = (
        SELECT id 
        FROM public.stores 
        WHERE owner_id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837'
        LIMIT 1
    ),
    updated_at = NOW()
WHERE id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837';

-- If profile doesn't exist, create it
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    store_id,
    created_at,
    updated_at
)
SELECT 
    '7f017bc4-6c37-43d3-ac72-6f9b3937b837',
    'rcushmaniii@gmail.com',
    'Robert Cushman',
    s.id,
    NOW(),
    NOW()
FROM public.stores s
WHERE s.owner_id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837'
);

-- ============================================
-- STEP 3: VERIFY ADMIN SETUP
-- ============================================

SELECT 
    'ADMIN USER SETUP' as section,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.encrypted_password IS NOT NULL as has_password,
    p.full_name,
    p.store_id IS NOT NULL as linked_to_store,
    s.name as store_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.stores s ON p.store_id = s.id
WHERE u.email = 'rcushmaniii@gmail.com';

-- ============================================
-- STEP 4: VERIFY STORE ACCESS
-- ============================================

SELECT 
    'STORE ACCESS' as section,
    s.name as store_name,
    s.business_type,
    s.is_active,
    p.full_name as owner_name,
    p.email as owner_email,
    COUNT(mi.id) as total_products,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue
FROM public.stores s
JOIN public.profiles p ON s.owner_id = p.id
LEFT JOIN public.menu_items mi ON s.id = mi.store_id
LEFT JOIN public.orders o ON s.id = o.store_id
WHERE s.owner_id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837'
GROUP BY s.id, s.name, s.business_type, s.is_active, p.full_name, p.email;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 
    '🎉 SETUP COMPLETE!' as message,
    'You can now login with:' as instructions,
    'Email: rcushmaniii@gmail.com' as email,
    'Password: Olverines17!' as password,
    'URL: http://localhost:5173/admin/login' as login_url;
