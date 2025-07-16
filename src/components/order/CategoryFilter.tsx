import React from 'react';

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string | null;
    onCategorySelect: (category: string | null) => void;
    isAcademicServices: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    categories,
    selectedCategory,
    onCategorySelect,
    isAcademicServices
}) => {
    if (categories.length <= 1) {
        return null;
    }

    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onCategorySelect(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === null
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {isAcademicServices ? 'Todos los Servicios' : 'All Items'}
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategorySelect(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
};