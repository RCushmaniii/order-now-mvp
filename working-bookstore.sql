-- ============================================
-- WORKING BOOKSTORE CREATION - STEP BY STEP
-- ============================================
-- This approach works around the auth.uid() issue in SQL Editor

-- ============================================
-- STEP 1: GET YOUR USER ID
-- ============================================
-- Run this first to find your user ID
SELECT 
    id as user_id, 
    email, 
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================
-- STEP 2: CREATE THE STORE (REPLACE USER_ID)
-- ============================================
-- After running Step 1, replace 'YOUR_USER_ID_HERE' with your actual user ID

INSERT INTO public.stores (
    owner_id,
    name,
    slug,
    description,
    phone,
    address,
    is_active,
    business_type,
    business_config
) VALUES (
    'YOUR_USER_ID_HERE',  -- Replace this with your actual user ID from Step 1
    'Dr. Verduras Conservation Biology Books',
    'dr-verduras-conservation-biology-books',
    'Libros especializados en biología de la conservación y estudios ecológicos - Specialized books on conservation biology and ecological studies',
    '+523315590572',
    'Guadalajara, Jalisco, México',
    true,
    'bookstore',
    '{
        "specialties": ["conservation_biology", "ecology", "environmental_science"],
        "languages": ["spanish", "english"],
        "author_bio": "Conservation biologist and published author specializing in ecological research",
        "contact_email": "books@drverduras.com",
        "shipping_available": true,
        "digital_downloads": true,
        "store_type": "academic_books",
        "payment_methods": ["stripe", "cash_on_delivery"],
        "delivery_areas": ["Guadalajara", "Zapopan", "Tlaquepaque"]
    }'::jsonb
);

-- ============================================
-- STEP 3: GET THE STORE ID
-- ============================================
-- Run this to get the store ID that was just created
SELECT 
    id as store_id,
    name,
    slug,
    owner_id
FROM public.stores 
WHERE slug = 'dr-verduras-conservation-biology-books';

-- ============================================
-- STEP 4: LINK YOUR PROFILE TO THE STORE
-- ============================================
-- Replace both IDs with the actual values from Steps 1 and 3

UPDATE public.profiles 
SET store_id = 'STORE_ID_FROM_STEP_3',
    updated_at = NOW()
WHERE id = 'YOUR_USER_ID_FROM_STEP_1';

-- ============================================
-- STEP 5: VERIFY THE COMPLETE SETUP
-- ============================================
-- This should show your linked store and profile
SELECT 
    s.id as store_id,
    s.name as store_name,
    s.slug,
    s.owner_id,
    s.business_type,
    s.business_config,
    p.email as owner_email,
    p.full_name as owner_name,
    p.store_id as profile_store_link
FROM public.stores s
JOIN public.profiles p ON s.owner_id = p.id
WHERE s.slug = 'dr-verduras-conservation-biology-books';

-- ============================================
-- STEP 6: ADD SAMPLE BOOKS (OPTIONAL)
-- ============================================
-- Replace STORE_ID_HERE with the actual store ID from Step 3

/*
INSERT INTO public.menu_items (
    store_id,
    name,
    description,
    price,
    category,
    is_available
) VALUES 
(
    'STORE_ID_HERE',
    'Biodiversidad en Ecosistemas Tropicales',
    'Estudio completo sobre la biodiversidad en ecosistemas tropicales de México. 350 páginas con fotografías a color y mapas detallados.',
    450.00,
    'Libros Académicos',
    true
),
(
    'STORE_ID_HERE',
    'Conservation Biology: Field Methods',
    'Comprehensive guide to field research methods in conservation biology. English edition, 280 pages with practical exercises.',
    380.00,
    'Libros Académicos',
    true
),
(
    'STORE_ID_HERE',
    'Estudio Ecológico Personalizado',
    'Consultoría y estudio ecológico personalizado para tu área de interés. Incluye análisis de biodiversidad, recomendaciones de conservación y reporte técnico.',
    2500.00,
    'Servicios de Consultoría',
    true
),
(
    'STORE_ID_HERE',
    'Guía de Campo: Flora Nativa de Jalisco',
    'Guía ilustrada de la flora nativa de Jalisco con claves de identificación botánica. Ideal para estudiantes, naturalistas y conservacionistas.',
    320.00,
    'Libros de Campo',
    true
),
(
    'STORE_ID_HERE',
    'PDF: Metodologías de Muestreo Ecológico',
    'Descarga digital: Manual completo de metodologías de muestreo para estudios ecológicos. Incluye protocolos estándar y análisis estadístico.',
    150.00,
    'Recursos Digitales',
    true
),
(
    'STORE_ID_HERE',
    'Taller: Identificación de Especies Nativas',
    'Taller presencial de 8 horas sobre identificación de especies nativas de la región. Incluye materiales y certificado de participación.',
    800.00,
    'Talleres y Cursos',
    true
);
*/

-- ============================================
-- STEP 7: ADD SAMPLE ORDER (OPTIONAL)
-- ============================================
-- Replace STORE_ID_HERE with the actual store ID from Step 3

/*
INSERT INTO public.orders (
    store_id,
    customer_name,
    customer_phone,
    customer_email,
    total_amount,
    status,
    notes
) VALUES (
    'STORE_ID_HERE',
    'Dr. María González',
    '+523315590572',
    'maria.gonzalez@universidad.edu.mx',
    830.00,
    'completed',
    'Pedido de libros para investigación universitaria - Biodiversidad + Conservation Biology. Entrega en Ciudad Universitaria.'
);
*/
