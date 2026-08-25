"use client";

import { useCallback } from "react";

import { AppStorage } from "@/schemas/app-storage-schema";
import { Category } from "@/schemas/category-schema";

type UseCategoriesOptions = {
  appStorage: AppStorage;
  updateAppStorage: (updater: (current: AppStorage) => AppStorage) => void;
};

type UseCategoriesReturn = {
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  updateCategories: (categories: Category[]) => void;
  deleteCategoryById: (id: string) => void;
};

export function useCategories({
  appStorage,
  updateAppStorage,
}: UseCategoriesOptions): UseCategoriesReturn {
  const categories = appStorage.data.categories;

  const addCategory = useCallback(
    (category: Category) => {
      updateAppStorage((current) => ({
        ...current,
        data: {
          ...current.data,
          categories: [...current.data.categories, category],
        },
      }));
    },
    [updateAppStorage],
  );

  const updateCategory = useCallback(
    (updated: Category) => {
      updateAppStorage((current) => ({
        ...current,
        data: {
          ...current.data,
          categories: current.data.categories.map((category) =>
            category.id === updated.id ? updated : category,
          ),
        },
      }));
    },
    [updateAppStorage],
  );

  const updateCategories = useCallback(
    (updatedCategories: Category[]) => {
      updateAppStorage((current) => ({
        ...current,
        data: {
          ...current.data,
          categories: updatedCategories,
        },
      }));
    },
    [updateAppStorage],
  );

  const deleteCategoryById = useCallback(
    (id: string) => {
      updateAppStorage((current) => ({
        ...current,
        data: {
          ...current.data,
          categories: current.data.categories.filter(
            (category) => category.id !== id,
          ),
        },
      }));
    },
    [updateAppStorage],
  );

  return {
    categories,
    addCategory,
    updateCategory,
    updateCategories,
    deleteCategoryById,
  };
}
