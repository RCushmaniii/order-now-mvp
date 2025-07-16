import React from 'react';
import { getServiceText, formatPrice } from '../../utils/textHelpers';

interface CartTotalProps {
    totalPrice: number;
    isAcademicServices: boolean;
}

export const CartTotal: React.FC<CartTotalProps> = ({ totalPrice, isAcademicServices }) => {
    return (
        <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
                <span>{getServiceText('total', isAcademicServices)}</span>
                <span>{formatPrice(totalPrice, isAcademicServices)}</span>
            </div>
        </div>
    );
};