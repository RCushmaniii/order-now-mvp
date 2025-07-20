-- ============================================
-- INSTANT BOOKSTORE SETUP FOR RCUSHMANIII
-- ============================================
-- This creates your conservation biology bookstore with your actual user ID
-- Just copy and paste each section into Supabase SQL Editor

-- ============================================
-- STEP 1: CREATE YOUR BOOKSTORE
-- ============================================

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
    '7f017bc4-6c37-43d3-ac72-6f9b3937b837',  -- Your actual user ID
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
-- STEP 2: LINK YOUR PROFILE TO THE STORE
-- ============================================

UPDATE public.profiles 
SET store_id = (
    SELECT id FROM public.stores 
    WHERE owner_id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837'
    LIMIT 1
),
updated_at = NOW()
WHERE id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837';

-- ============================================
-- STEP 3: ADD CONSERVATION BIOLOGY BOOKS
-- ============================================

INSERT INTO public.menu_items (
    store_id,
    name,
    description,
    price,
    category,
    is_available
) 
SELECT 
    s.id,
    book_data.name,
    book_data.description,
    book_data.price,
    book_data.category,
    true
FROM public.stores s,
(VALUES 
    ('Biodiversidad en Ecosistemas Tropicales', 'Estudio completo sobre la biodiversidad en ecosistemas tropicales de México. 350 páginas con fotografías a color y mapas detallados.', 450.00, 'Libros Académicos'),
    ('Conservation Biology: Field Methods', 'Comprehensive guide to field research methods in conservation biology. English edition, 280 pages with practical exercises.', 380.00, 'Libros Académicos'),
    ('Estudio Ecológico Personalizado', 'Consultoría y estudio ecológico personalizado para tu área de interés. Incluye análisis de biodiversidad, recomendaciones de conservación y reporte técnico.', 2500.00, 'Servicios de Consultoría'),
    ('Guía de Campo: Flora Nativa de Jalisco', 'Guía ilustrada de la flora nativa de Jalisco con claves de identificación botánica. Ideal para estudiantes, naturalistas y conservacionistas.', 320.00, 'Libros de Campo'),
    ('PDF: Metodologías de Muestreo Ecológico', 'Descarga digital: Manual completo de metodologías de muestreo para estudios ecológicos. Incluye protocolos estándar y análisis estadístico.', 150.00, 'Recursos Digitales'),
    ('Taller: Identificación de Especies Nativas', 'Taller presencial de 8 horas sobre identificación de especies nativas de la región. Incluye materiales y certificado de participación.', 800.00, 'Talleres y Cursos')
) AS book_data(name, description, price, category)
WHERE s.owner_id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837';

-- ============================================
-- STEP 4: ADD SAMPLE ORDERS FOR DASHBOARD
-- ============================================

INSERT INTO public.orders (
    store_id,
    customer_name,
    customer_phone,
    customer_email,
    total_amount,
    status,
    notes
) 
SELECT 
    s.id,
    order_data.customer_name,
    order_data.customer_phone,
    order_data.customer_email,
    order_data.total_amount,
    order_data.status,
    order_data.notes
FROM public.stores s,
(VALUES 
    ('Dr. María González', '+523315590572', 'maria.gonzalez@universidad.edu.mx', 830.00, 'delivered', 'Pedido de libros para investigación universitaria - Biodiversidad + Conservation Biology'),
    ('Prof. Carlos Mendoza', '+523312345678', 'carlos.mendoza@iteso.mx', 2500.00, 'pending', 'Estudio ecológico para proyecto de conservación en la Sierra de Manantlán'),
    ('Ana Rodríguez', '+523319876543', 'ana.rodriguez@estudiante.udg.mx', 470.00, 'delivered', 'Guía de campo + PDF metodologías para tesis de maestría')
) AS order_data(customer_name, customer_phone, customer_email, total_amount, status, notes)
WHERE s.owner_id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837';

-- ============================================
-- STEP 5: VERIFY COMPLETE SETUP
-- ============================================

SELECT 
    'STORE INFO' as section,
    s.name,
    s.business_type,
    s.is_active::text,
    p.email as owner_email,
    (s.id = p.store_id)::text as profile_linked
FROM public.stores s
JOIN public.profiles p ON s.owner_id = p.id
WHERE s.owner_id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837'

UNION ALL

SELECT 
    'PRODUCTS',
    mi.name,
    mi.category,
    mi.price::text,
    null,
    mi.is_available::text
FROM public.stores s
JOIN public.menu_items mi ON s.id = mi.store_id
WHERE s.owner_id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837'

UNION ALL

SELECT 
    'ORDERS',
    o.customer_name,
    o.status,
    o.total_amount::text,
    null,
    o.created_at::text
FROM public.stores s
JOIN public.orders o ON s.id = o.store_id
WHERE s.owner_id = '7f017bc4-6c37-43d3-ac72-6f9b3937b837'

ORDER BY section, name;
