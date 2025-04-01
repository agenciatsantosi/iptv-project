import React from 'react';

interface Category {
  id: string;
  name: string;
}

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryBar({ categories, selectedCategory, onSelectCategory }: CategoryBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full transition-all duration-200
            ${selectedCategory === category.id
              ? 'bg-gradient-to-r from-red-500 to-purple-600 text-white font-medium'
              : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
            }
          `}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
