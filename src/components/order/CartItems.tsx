import React from 'react';
import { CartItem } from '../../types/order';
import { getServiceText } from '../../utils/textHelpers';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemsProps {
    cart: CartItem[];
    isAcademicServices: boolean;
    onAddToCart: (item: CartItem) => void;
    onRemoveFromCart: (itemId: string) => void;
}

export const CartItems: React.FC<CartItemsProps> = ({
    cart,
    isAcademicServices,
    onAddToCart,
    onRemoveFromCart
}) => {
    if (cart.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                {getServiceText('cartEmpty', isAcademicServices)}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => onRemoveFromCart(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                            onClick={() => onAddToCart(item)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onRemoveFromCart(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};