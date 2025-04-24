'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Standard set of category colors for consistent visual identification
const CATEGORY_COLORS = [
  '#3f51b5', // indigo
  '#f50057', // pink
  '#00bcd4', // cyan
  '#4caf50', // green
  '#ff9800', // orange
  '#9c27b0', // purple
  '#f44336', // red
  '#2196f3', // blue
  '#ff5722', // deep orange
  '#607d8b'  // blue grey
];

export interface Category {
  name: string;
  color: string;
  count?: number;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string, color?: string) => void;
  updateCategory: (oldName: string, newName: string, newColor?: string) => void;
  deleteCategory: (name: string) => void;
  getCategoryColor: (name: string) => string;
  isCategoryUsed: (name: string) => boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Generate a consistent color based on category name
const getColorForCategory = (categoryName: string): string => {
  // Use a simple hash function to always get the same color for the same category name
  const hash = categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
};

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch all categories from tasks on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        
        const tasks = await response.json();
        
        // Extract unique categories and count occurrences
        const categoryMap = new Map<string, { color: string, count: number }>();
        
        tasks.forEach((task: any) => {
          if (task.category) {
            const categoryData = task.category.includes(':') 
              ? task.category.split(':') 
              : [task.category, ''];
            
            const [name, color] = categoryData;
            
            if (categoryMap.has(name)) {
              const current = categoryMap.get(name)!;
              categoryMap.set(name, {
                color: current.color || color || getColorForCategory(name),
                count: current.count + 1
              });
            } else {
              categoryMap.set(name, {
                color: color || getColorForCategory(name),
                count: 1
              });
            }
          }
        });
        
        // Convert to array of Category objects
        const categoryList: Category[] = Array.from(categoryMap).map(([name, data]) => ({
          name,
          color: data.color,
          count: data.count
        }));
        
        setCategories(categoryList);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Add a new category
  const addCategory = useCallback((name: string, color?: string) => {
    const trimmedName = name.trim();
    if (!trimmedName || categories.some(cat => cat.name === trimmedName)) return;
    
    setCategories(prev => [
      ...prev, 
      { 
        name: trimmedName, 
        color: color || getColorForCategory(trimmedName),
        count: 0
      }
    ]);
  }, [categories]);

  // Update an existing category
  const updateCategory = useCallback(async (oldName: string, newName: string, newColor?: string) => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName) return;
    
    // Update the category in our local state
    setCategories(prev => prev.map(cat => 
      cat.name === oldName 
        ? { ...cat, name: trimmedNewName, color: newColor || cat.color }
        : cat
    ));
    
    // Update category in all tasks that use it
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const tasks = await response.json();
      
      // Find all tasks using this category
      const tasksToUpdate = tasks.filter((task: any) => {
        const categoryData = task.category?.includes(':') 
          ? task.category.split(':')[0] 
          : task.category;
        return categoryData === oldName;
      });
      
      // Update each task with the new category name and color
      for (const task of tasksToUpdate) {
        await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...task,
            category: `${trimmedNewName}:${newColor || getColorForCategory(trimmedNewName)}`
          })
        });
      }
    } catch (error) {
      console.error('Failed to update category in tasks:', error);
    }
  }, []);

  // Delete a category
  const deleteCategory = useCallback(async (name: string) => {
    // Remove from local state
    setCategories(prev => prev.filter(cat => cat.name !== name));
    
    // Update tasks that use this category (set to null)
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const tasks = await response.json();
      
      // Find all tasks using this category
      const tasksToUpdate = tasks.filter((task: any) => {
        const categoryData = task.category?.includes(':') 
          ? task.category.split(':')[0] 
          : task.category;
        return categoryData === name;
      });
      
      // Update each task to remove the category
      for (const task of tasksToUpdate) {
        await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...task,
            category: null
          })
        });
      }
    } catch (error) {
      console.error('Failed to remove category from tasks:', error);
    }
  }, []);

  // Get color for a category
  const getCategoryColor = useCallback((name: string): string => {
    const category = categories.find(cat => cat.name === name);
    return category ? category.color : getColorForCategory(name);
  }, [categories]);

  // Check if a category is being used
  const isCategoryUsed = useCallback((name: string): boolean => {
    const category = categories.find(cat => cat.name === name);
    return category ? (category.count || 0) > 0 : false;
  }, [categories]);

  return (
    <CategoryContext.Provider value={{ 
      categories, 
      addCategory, 
      updateCategory, 
      deleteCategory,
      getCategoryColor,
      isCategoryUsed
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};