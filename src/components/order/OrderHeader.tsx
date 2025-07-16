// src/components/order/OrderHeader.tsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Store } from '../../types/store';
import { getServiceText } from '../../utils/textHelpers';

interface OrderHeaderProps {
    store: Store | null;
    totalItems: number;
    isAcademicServices: boolean;
    onCartToggle?: () => void;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
    store,
    totalItems,
    isAcademicServices,
    onCartToggle
}) => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        {store?.logo_url && (
                            <img
                                src={store.logo_url}
                                alt={store.name}
                                className="h-10 w-10 rounded-full mr-3"
                                onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.style.display = 'none';
                                }}
                            />
                        )}
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                {store?.name}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {store?.description}
                            </p>
                        </div>
                    </div>

                    <CartButton
                        totalItems={totalItems}
                        isAcademicServices={isAcademicServices}
                        onClick={onCartToggle}
                    />
                </div>
            </div>
        </header>
    );
};

interface CartButtonProps {
    totalItems: number;
    isAcademicServices: boolean;
    onClick?: () => void;
}

const CartButton: React.FC<CartButtonProps> = ({
    totalItems,
    isAcademicServices,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {getServiceText('cart', isAcademicServices)} ({totalItems})
            {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {totalItems}
                </span>
            )}
        </button>
    );
};