'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define a type for category with color
export interface Category {
  name: string;
  color: string;
}

// Default categories with color assignments
const defaultCategories: Category[] = [
  { name: 'Work', color: '#4caf50' },
  { name: 'Personal', color: '#2196f3' },
  { name: 'Health', color: '#f44336' },
  { name: 'Finance', color: '#ff9800' },
  { name: 'Learning', color: '#9c27b0' },
  { name: 'Home', color: '#795548' },
  { name: 'Travel', color: '#009688' },
];

// Define the context type
interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Category) => void;
  getCategoryColor: (categoryName: string | null | undefined) => string;
  getAllCategories: () => Category[];
}

// Create the context
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Custom hook to use the category context
export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

// Props for the category provider
interface CategoryProviderProps {
  children: ReactNode;
}

// The category provider component
export default function CategoryProvider({ children }: CategoryProviderProps) {
  // Initialize categories state with default categories
  const [categories, setCategories] = useState<Category[]>(() => {
    // On the client side, try to get saved categories from localStorage
    if (typeof window !== 'undefined') {
      const savedCategories = localStorage.getItem('taskTrackerCategories');
      return savedCategories ? JSON.parse(savedCategories) : defaultCategories;
    }
    return defaultCategories;
  });

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskTrackerCategories', JSON.stringify(categories));
    }
  }, [categories]);

  // Add a new category if it doesn't already exist
  const addCategory = (newCategory: Category) => {
    if (!categories.some(cat => cat.name === newCategory.name)) {
      setCategories(prevCategories => [...prevCategories, newCategory]);
    }
  };

  // Get the color for a given category name
  const getCategoryColor = (categoryName: string | null | undefined): string => {
    if (!categoryName) return '#757575'; // Default gray for no category
    
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#757575';
  };

  // Get all categories
  const getAllCategories = (): Category[] => {
    return categories;
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        getCategoryColor,
        getAllCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}