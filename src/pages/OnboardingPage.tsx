import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface Store {
    id: string;
    name: string;
    email?: string;
    owner_id: string;
    stripe_account_id?: string;
}

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [store, setStore] = useState<Store | null>(null);
    const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'error'>('pending');

    const verifyStripeAccount = useCallback(async () => {
        if (!store) {
            setStatus('error');
            return;
        }

        setStatus('processing');
        try {
            const response = await fetch('/.netlify/functions/verify-stripe-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({
                    storeId: store.id
                })
            });

            const data = await response.json();

            if (data.chargesEnabled && data.payoutsEnabled) {
                setStatus('completed');
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 2000);
            }
        } catch (error) {
            console.error('Error verifying Stripe account:', error);
            setStatus('error');
        }
    }, [store, navigate]);

    const loadStoreData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const { data: storeData } = await supabase
            .from('stores')
            .select('*')
            .eq('owner_id', user.id)
            .single();

        if (storeData) {
            setStore(storeData);
        }
    }, [navigate]);

    const checkStripeStatus = useCallback(async () => {
        // Check if returning from Stripe
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('stripe_onboarding') === 'complete') {
            await verifyStripeAccount();
        }
    }, [verifyStripeAccount]);

    useEffect(() => {
        loadStoreData();
        checkStripeStatus();
    }, [loadStoreData, checkStripeStatus]);

    const startStripeOnboarding = async () => {
        if (!store) {
            setStatus('error');
            return;
        }

        setLoading(true);
        try {
            // Call your backend function to create Stripe Connect account
            const response = await fetch('/.netlify/functions/create-stripe-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({
                    storeId: store.id,
                    email: store.email,
                    businessName: store.name
                })
            });

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe onboarding
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Error starting Stripe onboarding:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">
                        Configuración de pagos para {store?.name}
                    </h1>

                    {status === 'pending' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-blue-900 mb-4">
                                    Configura Stripe para recibir pagos
                                </h2>
                                <p className="text-blue-700 mb-6">
                                    Para empezar a recibir pagos de tus clientes, necesitas crear una cuenta de Stripe.
                                    Este proceso es seguro y solo toma unos minutos.
                                </p>

                                <div className="space-y-4 mb-6">
                                    <h3 className="font-medium text-gray-900">Necesitarás proporcionar:</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                                        <li>RFC o CURP</li>
                                        <li>Nombre legal del negocio</li>
                                        <li>Cuenta bancaria (CLABE) para recibir depósitos</li>
                                        <li>Identificación oficial o documentos del representante</li>
                                    </ul>
                                </div>

                                <button
                                    onClick={startStripeOnboarding}
                                    disabled={loading}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                            Preparando...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="-ml-1 mr-3 h-5 w-5" />
                                            Configurar Stripe
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-medium text-gray-900 mb-3">¿Por qué Stripe?</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Procesamiento seguro de pagos con encriptación de nivel bancario</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Acepta tarjetas de crédito, débito y pagos OXXO</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Depósitos automáticos a tu cuenta bancaria</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Dashboard completo para administrar tus ventas</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-12">
                            <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Verificando tu cuenta de Stripe...
                            </h2>
                            <p className="text-gray-600">
                                Esto puede tomar unos momentos. Por favor no cierres esta ventana.
                            </p>
                        </div>
                    )}

                    {status === 'completed' && (
                        <div className="text-center py-12">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                ¡Configuración completada!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Tu cuenta de Stripe está lista. Ahora puedes empezar a recibir pagos.
                            </p>
                            <p className="text-sm text-gray-500">
                                Redirigiendo al dashboard...
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-red-900 mb-2">
                                        Hubo un problema con la configuración
                                    </h3>
                                    <p className="text-red-700 mb-4">
                                        No pudimos completar la configuración de tu cuenta. Por favor intenta nuevamente.
                                    </p>
                                    <button
                                        onClick={() => setStatus('pending')}
                                        className="text-red-600 hover:text-red-500 font-medium"
                                    >
                                        Intentar de nuevo
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}