import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";
import { Category } from "@/types/category";

export type Todo = {
  id: string;
  name: string;
  order: number;
  memo?: string;
  completed: boolean;
  categoryId: string;
};

export type TodoStorageVersion = typeof CURRENT_TODO_STORAGE_VERSION | 1;

export type TodoStorage = {
  version: TodoStorageVersion;
  todos: Todo[];
  categories?: Record<string, Category>;
};
