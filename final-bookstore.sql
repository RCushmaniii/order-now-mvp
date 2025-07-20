-- ============================================
-- FINAL BOOKSTORE CREATION - EXACT SCHEMA MATCH
-- ============================================
-- This creates the Dr. Verduras Conservation Biology Books store
-- using the EXACT column structure from your database schema

DO $$
DECLARE
    current_user_id UUID;
    new_store_id UUID;
    store_slug TEXT;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Generate a new UUID for the store (though it has a default)
    new_store_id := gen_random_uuid();
    
    -- Create a URL-friendly slug
    store_slug := 'dr-verduras-conservation-biology-books';
    
    -- Create the store with ALL the correct columns
    INSERT INTO public.stores (
        id,
        owner_id,
        name,
        slug,
        description,
        phone,
        address,
        is_active,
        stripe_account_id,
        business_type,
        business_config
    ) VALUES (
        new_store_id,
        current_user_id,
        'Dr. Verduras Conservation Biology Books',
        store_slug,
        'Libros especializados en biología de la conservación y estudios ecológicos - Specialized books on conservation biology and ecological studies',
        '+523315590572',
        'Guadalajara, Jalisco, México',
        true,
        null, -- Will set up Stripe later
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
    
    -- Link your profile to the new store
    UPDATE public.profiles 
    SET store_id = new_store_id,
        updated_at = NOW()
    WHERE id = current_user_id;
    
    -- Output success message with store details
    RAISE NOTICE 'Bookstore created successfully!';
    RAISE NOTICE 'Store ID: %', new_store_id;
    RAISE NOTICE 'Owner ID: %', current_user_id;
    RAISE NOTICE 'Store Slug: %', store_slug;
    
END $$;

-- ============================================
-- VERIFY THE SETUP
-- ============================================
SELECT 
    s.id as store_id,
    s.name as store_name,
    s.slug,
    s.owner_id,
    s.business_type,
    s.business_config,
    s.description,
    s.address,
    s.phone,
    s.is_active,
    p.email as owner_email,
    p.full_name as owner_name,
    p.store_id as profile_store_link
FROM public.stores s
JOIN public.profiles p ON s.owner_id = p.id
WHERE s.slug = 'dr-verduras-conservation-biology-books';

-- ============================================
-- ADD SAMPLE CONSERVATION BIOLOGY BOOKS
-- ============================================
INSERT INTO public.menu_items (
    id,
    store_id,
    name,
    description,
    price,
    category,
    is_available
) 
SELECT 
    gen_random_uuid(),
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
WHERE s.slug = 'dr-verduras-conservation-biology-books';

-- ============================================
-- ADD SAMPLE ORDER FOR DASHBOARD TESTING
-- ============================================
INSERT INTO public.orders (
    id,
    store_id,
    customer_name,
    customer_phone,
    customer_email,
    total_amount,
    status,
    notes
)
SELECT 
    gen_random_uuid(),
    s.id,
    'Dr. María González',
    '+523315590572',
    'maria.gonzalez@universidad.edu.mx',
    830.00,
    'completed',
    'Pedido de libros para investigación universitaria - Biodiversidad + Conservation Biology. Entrega en Ciudad Universitaria.'
FROM public.stores s
WHERE s.slug = 'dr-verduras-conservation-biology-books';

-- ============================================
-- FINAL VERIFICATION - DASHBOARD READY DATA
-- ============================================
-- This shows exactly what your admin dashboard will display

SELECT 
    'STORE SUMMARY' as section,
    s.name,
    s.business_type,
    s.is_active,
    COUNT(DISTINCT mi.id) as total_products,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue
FROM public.stores s
LEFT JOIN public.menu_items mi ON s.id = mi.store_id
LEFT JOIN public.orders o ON s.id = o.store_id
WHERE s.slug = 'dr-verduras-conservation-biology-books'
GROUP BY s.id, s.name, s.business_type, s.is_active

UNION ALL

SELECT 
    'PRODUCTS' as section,
    mi.name,
    mi.category,
    mi.is_available::text,
    NULL,
    NULL,
    mi.price
FROM public.stores s
JOIN public.menu_items mi ON s.id = mi.store_id
WHERE s.slug = 'dr-verduras-conservation-biology-books'
ORDER BY section, name;
