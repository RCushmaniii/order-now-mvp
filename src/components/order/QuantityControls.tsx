import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuantityControlsProps {
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

export const QuantityControls: React.FC<QuantityControlsProps> = ({
    quantity,
    onIncrement,
    onDecrement
}) => {
    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={onDecrement}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
                onClick={onIncrement}
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
};