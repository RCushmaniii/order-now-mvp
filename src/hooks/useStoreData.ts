import { useState, useEffect } from 'react';
import { Store } from '../types/store';
import { MenuItem } from '../types/order';

interface UseStoreDataReturn {
    store: Store | null;
    menuItems: MenuItem[];
    loading: boolean;
    error: string | null;
    isAcademicServices: boolean;
}

export const useStoreData = (storeId: string | undefined): UseStoreDataReturn => {
    const [store, setStore] = useState<Store | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Mock data for now - replace with actual API calls
                const mockStore: Store = {
                    id: storeId || 'unknown',
                    name: storeId === 'bella-italia' ? 'Bella Italia' : 
                          storeId === 'dr-veronica' ? 'Dr. Verónica - Servicios Académicos' :
                          'Professional Consulting',
                    description: storeId === 'bella-italia' ? 'Authentic Italian cuisine' :
                                storeId === 'dr-veronica' ? 'Servicios académicos profesionales' :
                                'Professional consulting services',
                    type: storeId === 'bella-italia' ? 'restaurant' :
                          storeId === 'dr-veronica' ? 'academic' : 'consulting',
                    rating: 4.8,
                    phone: '+1234567890',
                    address: '123 Main St',
                    hours: '9:00 AM - 9:00 PM'
                };

                const mockMenuItems: MenuItem[] = storeId === 'bella-italia' ? [
                    {
                        id: '1',
                        name: 'Margherita Pizza',
                        description: 'Fresh tomatoes, mozzarella, basil',
                        price: 18.99,
                        category: 'Pizza',
                        available: true,
                        rating: 4.8,
                        prep_time: 15
                    },
                    {
                        id: '2',
                        name: 'Pasta Carbonara',
                        description: 'Creamy pasta with pancetta and parmesan',
                        price: 16.99,
                        category: 'Pasta',
                        available: true,
                        rating: 4.9,
                        prep_time: 12
                    }
                ] : storeId === 'dr-veronica' ? [
                    {
                        id: '1',
                        name: 'Tesis de Licenciatura',
                        description: 'Asesoría completa para tesis de licenciatura',
                        price: 2500,
                        category: 'Tesis',
                        available: true,
                        rating: 5.0,
                        prep_time: 30
                    },
                    {
                        id: '2',
                        name: 'Ensayo Académico',
                        description: 'Redacción de ensayos académicos profesionales',
                        price: 800,
                        category: 'Ensayos',
                        available: true,
                        rating: 4.9,
                        prep_time: 7
                    }
                ] : [
                    {
                        id: '1',
                        name: 'Business Strategy Consultation',
                        description: 'Comprehensive business strategy planning',
                        price: 500,
                        category: 'Strategy',
                        available: true,
                        rating: 4.9,
                        prep_time: 60
                    }
                ];

                setStore(mockStore);
                setMenuItems(mockMenuItems);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load store data');
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchStoreData();
        }
    }, [storeId]);

    const isAcademicServices = store?.type === 'academic';
    
    return { store, menuItems, loading, error, isAcademicServices };
};
