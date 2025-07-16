import React from 'react';
import { Plus } from 'lucide-react';
import { getServiceText } from '../../utils/textHelpers';

interface AddToCartButtonProps {
    available: boolean;
    isAcademicServices: boolean;
    onClick: () => void;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    available,
    isAcademicServices,
    onClick
}) => {
    if (!available) {
        return (
            <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
                {getServiceText('unavailable', isAcademicServices)}
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
            <Plus className="w-4 h-4" />
            <span>{getServiceText('addToCart', isAcademicServices)}</span>
        </button>
    );
};