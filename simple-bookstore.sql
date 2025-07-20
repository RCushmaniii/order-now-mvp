-- ============================================
-- MINIMAL BOOKSTORE CREATION - WORKS WITH EXISTING SCHEMA
-- ============================================
-- This creates the store using only the columns that actually exist
-- Based on your database schema from the images

-- ============================================
-- STEP 1: CHECK WHAT COLUMNS EXIST
-- ============================================
-- First, let's see what columns your stores table actually has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'stores' 
ORDER BY ordinal_position;

-- ============================================
-- STEP 2: CREATE STORE WITH MINIMAL REQUIRED FIELDS
-- ============================================
-- This uses only the columns that definitely exist in your schema

DO $$
DECLARE
    current_user_id UUID;
    new_store_id UUID;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Generate a new UUID for the store
    new_store_id := gen_random_uuid();
    
    -- Create the store with only the basic required fields
    INSERT INTO public.stores (
        id,
        owner_id,
        name,
        description,
        address,
        phone,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        new_store_id,
        current_user_id,
        'Dr. Verduras Conservation Biology Books',
        'Libros especializados en biología de la conservación y estudios ecológicos - Specialized books on conservation biology and ecological studies',
        'Guadalajara, Jalisco, México',
        '+523315590572',
        true,
        NOW(),
        NOW()
    );
    
    -- Link your profile to the new store
    UPDATE public.profiles 
    SET store_id = new_store_id,
        updated_at = NOW()
    WHERE id = current_user_id;
    
    -- Output success message with store details
    RAISE NOTICE 'Store created successfully! Store ID: %, Owner ID: %', new_store_id, current_user_id;
    
END $$;

-- ============================================
-- STEP 3: VERIFY THE SETUP
-- ============================================
-- Run this to verify everything was created correctly

SELECT 
    s.id as store_id,
    s.name as store_name,
    s.owner_id,
    s.description,
    s.address,
    s.phone,
    s.is_active,
    p.email as owner_email,
    p.full_name as owner_name,
    p.store_id as profile_store_link
FROM public.stores s
JOIN public.profiles p ON s.owner_id = p.id
WHERE s.name = 'Dr. Verduras Conservation Biology Books';

-- ============================================
-- STEP 4: ADD SAMPLE BOOKS (OPTIONAL)
-- ============================================
-- Uncomment this section to add sample conservation biology books
-- Using only the basic menu_items columns that exist

/*
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
) 
SELECT 
    gen_random_uuid(),
    s.id,
    book_data.name,
    book_data.description,
    book_data.price,
    book_data.category,
    true,
    NOW(),
    NOW()
FROM public.stores s,
(VALUES 
    ('Biodiversidad en Ecosistemas Tropicales', 'Estudio completo sobre la biodiversidad en ecosistemas tropicales de México. 350 páginas con fotografías a color.', 450.00, 'Libros'),
    ('Conservation Biology: Field Methods', 'Comprehensive guide to field research methods in conservation biology. English edition, 280 pages.', 380.00, 'Libros'),
    ('Estudio Ecológico Personalizado', 'Consultoría y estudio ecológico personalizado para tu área de interés. Incluye análisis de biodiversidad y recomendaciones.', 2500.00, 'Servicios'),
    ('Guía de Campo: Flora Nativa de Jalisco', 'Guía ilustrada de la flora nativa de Jalisco con claves de identificación. Ideal para estudiantes y naturalistas.', 320.00, 'Libros'),
    ('PDF: Metodologías de Muestreo Ecológico', 'Descarga digital: Manual completo de metodologías de muestreo para estudios ecológicos. Formato PDF.', 150.00, 'Digitales')
) AS book_data(name, description, price, category)
WHERE s.name = 'Dr. Verduras Conservation Biology Books';
*/

-- ============================================
-- STEP 5: ADD SAMPLE ORDER (OPTIONAL)
-- ============================================
-- Uncomment to create a sample order for dashboard testing

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
)
SELECT 
    gen_random_uuid(),
    s.id,
    'Dr. María González',
    '+523315590572',
    'maria.gonzalez@universidad.edu.mx',
    830.00,
    'completed',
    'Pedido de libros para investigación universitaria - Biodiversidad + Conservation Biology',
    NOW(),
    NOW()
FROM public.stores s
WHERE s.name = 'Dr. Verduras Conservation Biology Books';
*/
