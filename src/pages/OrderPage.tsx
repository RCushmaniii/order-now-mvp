// src/pages/OrderPage.tsx (Fixed version)
import React from 'react';
import { useParams } from 'react-router-dom';
import { OrderHeader } from '../components/order/OrderHeader';
import { StoreInfo } from '../components/order/StoreInfo';
import { MenuSection } from '../components/order/MenuSection';
import { CartSection } from '../components/order/CartSection';
import { OrderCompleteModal } from '../components/order/OrderCompleteModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { WhatsAppProvider } from '../components/whatsapp/WhatsAppProvider';
import { useOrderLogic } from '../hooks/useOrderLogic';
import { useStoreData } from '../hooks/useStoreData';
import { useWhatsAppNotifications } from '../hooks/useWhatsAppNotifications';

const OrderPage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();

    // Custom hooks for logic separation
    const {
        store,
        menuItems,
        loading: storeLoading,
        isAcademicServices
    } = useStoreData(storeId);

    const {
        cart,
        orderForm,
        selectedCategory,
        orderComplete,
        loading,
        paymentLoading,
        error,
        addToCart,
        removeFromCart,
        handleInputChange,
        handlePlaceOrder,
        resetOrder,
        totalPrice,
        totalItems,
        filteredItems,
        categories,
        setSelectedCategory, // This was missing!
        clearError
    } = useOrderLogic(store, menuItems, isAcademicServices);

    const {
        whatsappEnabled,
        whatsappStatus,
        whatsappError,
        setWhatsappEnabled
    } = useWhatsAppNotifications();

    // Loading state
    if (storeLoading) {
        return <LoadingSpinner message={isAcademicServices ? 'Cargando servicios...' : 'Loading menu...'} />;
    }

    // Order complete modal
    if (orderComplete) {
        return (
            <OrderCompleteModal
                isOpen={orderComplete}
                onClose={resetOrder}
                isAcademicServices={isAcademicServices}
                orderTotal={totalPrice}
            />
        );
    }

    return (
        <WhatsAppProvider>
            <div className="min-h-screen bg-gray-50">
                <OrderHeader
                    store={store}
                    totalItems={totalItems}
                    isAcademicServices={isAcademicServices}
                />

                <StoreInfo store={store} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <MenuSection
                            items={filteredItems}
                            categories={categories}
                            selectedCategory={selectedCategory}
                            cart={cart}
                            isAcademicServices={isAcademicServices}
                            onAddToCart={addToCart}
                            onRemoveFromCart={removeFromCart}
                            onCategoryChange={(category) => setSelectedCategory(category || 'All')}
                        />

                        <CartSection
                            cart={cart}
                            orderForm={orderForm}
                            store={store}
                            isAcademicServices={isAcademicServices}
                            loading={loading}
                            paymentLoading={paymentLoading}
                            totalPrice={totalPrice}
                            whatsappEnabled={whatsappEnabled}
                            whatsappStatus={whatsappStatus}
                            whatsappError={whatsappError}
                            onInputChange={handleInputChange}
                            onPlaceOrder={handlePlaceOrder}
                            onWhatsAppToggle={setWhatsappEnabled}
                            onAddToCart={addToCart}
                            onRemoveFromCart={removeFromCart}
                        />
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                        <div className="flex justify-between items-center">
                            <span>{error}</span>
                            <button
                                onClick={clearError}
                                className="ml-2 text-red-700 hover:text-red-900"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </WhatsAppProvider>
    );
};

export default OrderPage;