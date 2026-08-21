import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";

export type Todo = {
  id: string;
  name: string;
  order: number;
  memo?: string;
  completed: boolean;
};

export type TodoStorageVersion = typeof CURRENT_TODO_STORAGE_VERSION | 1;

export type TodoStorage = {
  version: TodoStorageVersion;
  todos: Todo[];
};
