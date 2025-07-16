// src/components/order/CartSection.tsx
import React from 'react';
import { CartItem, OrderFormData, MenuItem } from '../../types/order';
import { Store } from '../../types/store';
import { WhatsAppStatus } from '../../types/whatsapp';
import { CartItems } from './CartItems';
import { CartTotal } from './CartTotal';
import { OrderForm } from './OrderForm';
import { WhatsAppToggle } from '../whatsapp/WhatsAppToggle';
import { getServiceText } from '../../utils/textHelpers';

interface CartSectionProps {
    cart: CartItem[];
    orderForm: OrderFormData;
    store: Store | null;
    isAcademicServices: boolean;
    loading: boolean;
    paymentLoading: boolean;
    totalPrice: number;
    whatsappEnabled: boolean;
    whatsappStatus: WhatsAppStatus;
    whatsappError: string | null;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onPlaceOrder: (e: React.FormEvent) => void;
    onWhatsAppToggle: (enabled: boolean) => void;
    onAddToCart: (item: MenuItem) => void;
    onRemoveFromCart: (itemId: string) => void;
}

export const CartSection: React.FC<CartSectionProps> = ({
    cart,
    orderForm,
    isAcademicServices,
    loading,
    paymentLoading,
    totalPrice,
    whatsappEnabled,
    whatsappStatus,
    whatsappError,
    onInputChange,
    onPlaceOrder,
    onWhatsAppToggle,
    onAddToCart,
    onRemoveFromCart
}) => {
    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
                <CartHeader isAcademicServices={isAcademicServices} />

                {cart.length === 0 ? (
                    <EmptyCart isAcademicServices={isAcademicServices} />
                ) : (
                    <CartContent
                        cart={cart}
                        orderForm={orderForm}
                        isAcademicServices={isAcademicServices}
                        loading={loading}
                        paymentLoading={paymentLoading}
                        totalPrice={totalPrice}
                        whatsappEnabled={whatsappEnabled}
                        whatsappStatus={whatsappStatus}
                        whatsappError={whatsappError}
                        onInputChange={onInputChange}
                        onPlaceOrder={onPlaceOrder}
                        onWhatsAppToggle={onWhatsAppToggle}
                        onAddToCart={onAddToCart}
                        onRemoveFromCart={onRemoveFromCart}
                    />
                )}
            </div>
        </div>
    );
};

interface CartHeaderProps {
    isAcademicServices: boolean;
}

const CartHeader: React.FC<CartHeaderProps> = ({ isAcademicServices }) => {
    return (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {getServiceText('cart', isAcademicServices)}
        </h3>
    );
};

interface EmptyCartProps {
    isAcademicServices: boolean;
}

const EmptyCart: React.FC<EmptyCartProps> = ({ isAcademicServices }) => {
    return (
        <p className="text-gray-500 text-center py-8">
            {getServiceText('cartEmpty', isAcademicServices)}
        </p>
    );
};

interface CartContentProps {
    cart: CartItem[];
    orderForm: OrderFormData;
    isAcademicServices: boolean;
    loading: boolean;
    paymentLoading: boolean;
    totalPrice: number;
    whatsappEnabled: boolean;
    whatsappStatus: WhatsAppStatus;
    whatsappError: string | null;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onPlaceOrder: (e: React.FormEvent) => void;
    onWhatsAppToggle: (enabled: boolean) => void;
    onAddToCart: (item: MenuItem) => void;
    onRemoveFromCart: (itemId: string) => void;
}

const CartContent: React.FC<CartContentProps> = ({
    cart,
    orderForm,
    isAcademicServices,
    loading,
    paymentLoading,
    totalPrice,
    whatsappEnabled,
    whatsappStatus,
    whatsappError,
    onInputChange,
    onPlaceOrder,
    onWhatsAppToggle,
    onAddToCart,
    onRemoveFromCart
}) => {
    return (
        <div>
            <CartItems
                cart={cart}
                isAcademicServices={isAcademicServices}
                onAddToCart={onAddToCart}
                onRemoveFromCart={onRemoveFromCart}
            />

            <CartTotal
                totalPrice={totalPrice}
                isAcademicServices={isAcademicServices}
            />

            <WhatsAppToggle
                enabled={whatsappEnabled}
                status={whatsappStatus}
                error={whatsappError}
                isAcademicServices={isAcademicServices}
                onToggle={onWhatsAppToggle}
            />

            <OrderForm
                orderForm={orderForm}
                isAcademicServices={isAcademicServices}
                loading={loading}
                paymentLoading={paymentLoading}
                onInputChange={onInputChange}
                onPlaceOrder={onPlaceOrder}
            />
        </div>
    );
};