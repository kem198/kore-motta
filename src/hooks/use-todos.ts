import { useCallback, useEffect, useState } from "react";

import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";
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
        const parsedTodoStorage: TodoStorage = JSON.parse(data);

        setTodos(parsedTodoStorage.todos);
      } else {
        setTodos([]);
      }
    } catch {
      // マイグレーション処理に失敗した場合、元のデータを保持してエラー状態を設定する
      setMigrationError({
        // MigrationErrorDialog を表示する
        hasError: true,
        originalData: data,
      });
      setTodos([]);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") {
      return;
    }

    const todoStorage: TodoStorage = {
      version: CURRENT_TODO_STORAGE_VERSION,
      todos,
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
    setTodos([]);
  }, []);

  const clearMigrationError = useCallback(() => {
    setMigrationError({
      hasError: false,
      originalData: null,
    });
  }, []);

  const importTodoStorage = useCallback((data: string) => {
    const parsedTodoStorage: TodoStorage = JSON.parse(data);

    setTodos(parsedTodoStorage.todos);
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
