import React from "react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  emoji: string;
}

const CATEGORIES: Category[] = [
  { id: "Semua", name: "Semua", emoji: "🍽️" },
  { id: "nasi", name: "Nasi", emoji: "🍚" },
  { id: "mie", name: "Mie", emoji: "🍜" },
  { id: "lauk", name: "Lauk", emoji: "🍗" },
  { id: "kue", name: "Kue", emoji: "🍰" },
  { id: "minuman", name: "Minuman", emoji: "🥤" },
  { id: "snack", name: "Snack", emoji: "🍪" },
  { id: "lainnya", name: "Lainnya", emoji: "🥡" },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 md:mx-0 md:px-0 flex gap-2 scroll-smooth">
      {CATEGORIES.map((category) => {
        const isActive = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green-500"
          >
            {/* Active background anim with Framer Motion layoutId */}
            {isActive && (
              <motion.div
                layoutId="activeCategoryBg"
                className="absolute inset-0 bg-brand-green-500 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            
            <span className="relative z-10 text-base">{category.emoji}</span>
            <span
              className={`relative z-10 transition-colors duration-200 ${
                isActive ? "text-white font-semibold" : "text-brand-neutral-600 hover:text-brand-neutral-900"
              }`}
            >
              {category.name}
            </span>
            
            {!isActive && (
              <span className="absolute inset-0 bg-brand-neutral-100 hover:bg-brand-neutral-200/80 rounded-full -z-10 transition-colors duration-200" />
            )}
          </button>
        );
      })}
    </div>
  );
};
