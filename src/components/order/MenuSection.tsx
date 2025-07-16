// src/components/order/MenuSection.tsx (Fixed version)
import React from 'react';
import type { MenuItem, CartItem } from '../../types/order';
import { CategoryFilter } from './CategoryFilter';
import { MenuItemCard } from './MenuItemCard';

interface MenuSectionProps {
    items: MenuItem[];
    categories: string[];
    selectedCategory: string;
    cart: CartItem[];
    isAcademicServices: boolean;
    onAddToCart: (item: MenuItem) => void;
    onRemoveFromCart: (itemId: string) => void;
    onCategoryChange: (category: string | null) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
    items,
    categories,
    selectedCategory,
    cart,
    isAcademicServices,
    onAddToCart,
    onRemoveFromCart,
    onCategoryChange
}) => {
    return (
        <div className="lg:col-span-2">
            <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={onCategoryChange}
                isAcademicServices={isAcademicServices}
            />

            <MenuItemsList
                items={items}
                cart={cart}
                isAcademicServices={isAcademicServices}
                onAddToCart={onAddToCart}
                onRemoveFromCart={onRemoveFromCart}
            />
        </div>
    );
};

interface MenuItemsListProps {
    items: MenuItem[];
    cart: CartItem[];
    isAcademicServices: boolean;
    onAddToCart: (item: MenuItem) => void;
    onRemoveFromCart: (itemId: string) => void;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({
    items,
    cart,
    isAcademicServices,
    onAddToCart,
    onRemoveFromCart
}) => {
    return (
        <div className="space-y-6">
            {items.map(item => (
                <MenuItemCard
                    key={item.id}
                    item={item}
                    cartQuantity={cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                    isAcademicServices={isAcademicServices}
                    onAddToCart={() => onAddToCart(item)}
                    onRemoveFromCart={() => onRemoveFromCart(item.id)}
                />
            ))}
        </div>
    );
};