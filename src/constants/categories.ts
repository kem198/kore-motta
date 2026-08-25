import { Category } from "@/schemas/category-schema";

export const DEFAULT_CATEGORY_ID = "uncategorized";
export const DEFAULT_CATEGORY_NAME = "未分類";
export const DEFAULT_CATEGORY_ORDER = 0;

export const DEFAULT_CATEGORIES_STORAGE: Category[] = [
  {
    id: DEFAULT_CATEGORY_ID,
    name: DEFAULT_CATEGORY_NAME,
    order: DEFAULT_CATEGORY_ORDER,
  },
];
