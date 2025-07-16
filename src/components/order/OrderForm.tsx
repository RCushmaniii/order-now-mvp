import React from 'react';
import { OrderFormData } from '../../types/order';
import { getServiceText } from '../../utils/textHelpers';

interface OrderFormProps {
    orderForm: OrderFormData;
    isAcademicServices: boolean;
    loading: boolean;
    paymentLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onPlaceOrder: (e: React.FormEvent) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
    orderForm,
    isAcademicServices,
    loading,
    paymentLoading,
    onInputChange,
    onPlaceOrder
}) => {
    return (
        <form onSubmit={onPlaceOrder} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getServiceText('deliveryAddress', isAcademicServices)}
                </label>
                <input
                    type="text"
                    name="delivery_address"
                    value={orderForm.delivery_address}
                    onChange={onInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                </label>
                <input
                    type="tel"
                    name="customer_phone"
                    value={orderForm.customer_phone}
                    onChange={onInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getServiceText('specialInstructions', isAcademicServices)}
                </label>
                <textarea
                    name="special_instructions"
                    value={orderForm.special_instructions}
                    onChange={onInputChange}
                    placeholder={getServiceText('specialPlaceholder', isAcademicServices)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                />
            </div>

            <button
                type="submit"
                disabled={loading || paymentLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading || paymentLoading 
                    ? getServiceText('loading', isAcademicServices)
                    : getServiceText('placeOrder', isAcademicServices)
                }
            </button>
        </form>
    );
};