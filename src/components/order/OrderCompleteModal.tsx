import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { getServiceText } from '../../utils/textHelpers';

interface OrderCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    isAcademicServices: boolean;
    orderTotal: number;
}

export const OrderCompleteModal: React.FC<OrderCompleteModalProps> = ({
    isOpen,
    onClose,
    isAcademicServices,
    orderTotal
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {getServiceText('orderPlaced', isAcademicServices)}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {getServiceText('orderComplete', isAcademicServices)}
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600">
                            {getServiceText('total', isAcademicServices)}
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                            ${orderTotal.toFixed(2)}
                        </p>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};
