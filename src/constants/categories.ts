import { Category } from "@/types/category";

export const DEFAULT_CATEGORY_ID = "uncategorized";
export const DEFAULT_CATEGORY_NAME = "未分類";
export const DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT = "00:00";

export const DEFAULT_CATEGORIES_STORAGE: Category[] = [
  {
    id: DEFAULT_CATEGORY_ID,
    name: DEFAULT_CATEGORY_NAME,
    markAllIncompleteAt: DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
  },
];
