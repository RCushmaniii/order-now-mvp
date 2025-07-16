// src/components/order/MenuItemCard.tsx
import React from 'react';
import { Star, Clock } from 'lucide-react';
import { MenuItem } from '../../types/order';
import { formatPrice, getServiceText } from '../../utils/textHelpers';
import { QuantityControls } from './QuantityControls';
import { AddToCartButton } from './AddToCartButton';

interface MenuItemCardProps {
    item: MenuItem;
    cartQuantity: number;
    isAcademicServices: boolean;
    onAddToCart: () => void;
    onRemoveFromCart: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
    item,
    cartQuantity,
    isAcademicServices,
    onAddToCart,
    onRemoveFromCart
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col md:flex-row">
                <MenuItemImage
                    item={item}
                    isAcademicServices={isAcademicServices}
                />

                <div className="flex-1">
                    <MenuItemHeader
                        item={item}
                        isAcademicServices={isAcademicServices}
                    />

                    <p className="text-gray-600 mb-3">{item.description}</p>

                    <MenuItemFooter
                        item={item}
                        cartQuantity={cartQuantity}
                        isAcademicServices={isAcademicServices}
                        onAddToCart={onAddToCart}
                        onRemoveFromCart={onRemoveFromCart}
                    />
                </div>
            </div>
        </div>
    );
};

interface MenuItemImageProps {
    item: MenuItem;
    isAcademicServices: boolean;
}

const MenuItemImage: React.FC<MenuItemImageProps> = ({ item, isAcademicServices }) => {
    if (!item.image_url) return null;

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;
        const fallback = isAcademicServices
            ? '/images/placeholders/service-default.jpg'
            : '/images/placeholders/food-default.jpg';
        img.src = fallback;
    };

    return (
        <img
            src={item.image_url}
            alt={item.name}
            className="w-full md:w-48 h-32 object-cover rounded-lg mb-4 md:mb-0 md:mr-6"
            onError={handleImageError}
        />
    );
};

interface MenuItemHeaderProps {
    item: MenuItem;
    isAcademicServices: boolean;
}

const MenuItemHeader: React.FC<MenuItemHeaderProps> = ({ item, isAcademicServices }) => {
    return (
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <span className="text-lg font-bold text-green-600">
                {formatPrice(item.price, isAcademicServices)}
            </span>
        </div>
    );
};

interface MenuItemFooterProps {
    item: MenuItem;
    cartQuantity: number;
    isAcademicServices: boolean;
    onAddToCart: () => void;
    onRemoveFromCart: () => void;
}

const MenuItemFooter: React.FC<MenuItemFooterProps> = ({
    item,
    cartQuantity,
    isAcademicServices,
    onAddToCart,
    onRemoveFromCart
}) => {
    return (
        <div className="flex items-center justify-between">
            <MenuItemMetadata item={item} isAcademicServices={isAcademicServices} />

            <div className="flex items-center space-x-2">
                {cartQuantity > 0 ? (
                    <QuantityControls
                        quantity={cartQuantity}
                        onIncrement={onAddToCart}
                        onDecrement={onRemoveFromCart}
                    />
                ) : (
                    <AddToCartButton
                        available={item.available}
                        isAcademicServices={isAcademicServices}
                        onClick={onAddToCart}
                    />
                )}
            </div>
        </div>
    );
};

interface MenuItemMetadataProps {
    item: MenuItem;
    isAcademicServices: boolean;
}

const MenuItemMetadata: React.FC<MenuItemMetadataProps> = ({ item, isAcademicServices }) => {
    return (
        <div className="flex items-center text-sm text-gray-500">
            {item.rating && (
                <div className="flex items-center mr-4">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{item.rating}</span>
                </div>
            )}
            {item.prep_time && (
                <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>
                        {item.prep_time} {getServiceText('min', isAcademicServices)}
                    </span>
                </div>
            )}
        </div>
    );
};