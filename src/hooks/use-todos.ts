import { useCallback, useEffect, useState } from "react";

import { DEFAULT_CATEGORIES_STORAGE } from "@/constants/categories";
import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";
import { parseTodoStorage } from "@/schemas/todo-storage-schema";
import { Todo, TodoStorage } from "@/types/todo";

export const TODO_STORAGE_KEY = "todos";

type UseTodosOptions = {
  storageKey?: string;
};

type UseTodosReturn = {
  todos: Todo[];
  isLoaded: boolean;
  migrationError: {
    hasError: boolean;
    originalData: string | null;
  };
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  updateTodos: (todos: Todo[]) => void;
  deleteTodoById: (id: string) => void;
  resetTodos: () => void;
  importTodoStorage: (data: string) => void;
  clearMigrationError: () => void;
};

export function useTodos(options: UseTodosOptions = {}): UseTodosReturn {
  const { storageKey = TODO_STORAGE_KEY } = options;

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [migrationError, setMigrationError] = useState<{
    hasError: boolean;
    originalData: string | null;
  }>({
    hasError: false,
    originalData: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const data = window.localStorage.getItem(storageKey);

    try {
      if (data) {
        const parsedTodoStorage = parseTodoStorage(JSON.parse(data));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTodos(parsedTodoStorage.todos);
      } else {
        setTodos([]);
      }
    } catch {
      // validation error
      setTodos([]);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") {
      return;
    }

    const rawCats = window.localStorage.getItem("categories");
    const categories = rawCats
      ? JSON.parse(rawCats)
      : DEFAULT_CATEGORIES_STORAGE;

    const todoStorage: TodoStorage = {
      version: CURRENT_TODO_STORAGE_VERSION,
      todos,
      categories,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(todoStorage));
  }, [todos, isLoaded, storageKey]);

  const addTodo = useCallback((todo: Todo) => {
    setTodos((prev) => [todo, ...prev]);
  }, []);

  const updateTodo = useCallback((updated: Todo) => {
    setTodos((prev) =>
      prev.map((current) => (current.id === updated.id ? updated : current)),
    );
  }, []);

  const updateTodos = useCallback((updatedTodos: Todo[]) => {
    setTodos(updatedTodos);
  }, []);

  const deleteTodoById = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const resetTodos = useCallback(() => {
    setTodos((prev) => prev.map((todo) => ({ ...todo, completed: false })));
  }, []);

  const clearMigrationError = useCallback(() => {
    setMigrationError({
      hasError: false,
      originalData: null,
    });
  }, []);

  const importTodoStorage = useCallback((data: string) => {
    const parsedTodoStorage = parseTodoStorage(JSON.parse(data));

    setTodos(parsedTodoStorage.todos);
    try {
      if (typeof window !== "undefined" && parsedTodoStorage.categories) {
        window.localStorage.setItem(
          "categories",
          JSON.stringify(parsedTodoStorage.categories),
        );
      }
    } catch {
      // ignore
    }
  }, []);

  return {
    todos,
    isLoaded,
    migrationError,
    addTodo,
    updateTodo,
    updateTodos,
    deleteTodoById,
    resetTodos,
    importTodoStorage,
    clearMigrationError,
  };
}
