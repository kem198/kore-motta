import { CURRENT_APP_STORAGE_VERSION } from "@/constants/version";
import { Category } from "@/types/category";
import { Todo } from "@/types/todo";

export type AppStorageVersion = typeof CURRENT_APP_STORAGE_VERSION;

export type AppStorageData = {
  /** TODO: 暫定型 */
  settings: Record<string, unknown>;
  categories: Category[];
  todos: Todo[];
};

export type AppStorage = {
  version: AppStorageVersion;
  data: AppStorageData;
};
