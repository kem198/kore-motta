"use client";

import { useCallback } from "react";

import { AppStorage, parseAppStorage } from "@/schemas/app-storage-schema";
import { Todo } from "@/schemas/todo-schema";

type UseTodosOptions = {
  appStorage: AppStorage;
  updateAppStorage: (updater: (current: AppStorage) => AppStorage) => void;
};

type UseTodosReturn = {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  updateTodos: (todos: Todo[]) => void;
  deleteTodoById: (id: string) => void;
  markAllIncompleteTodos: () => void;
  importTodoStorage: (data: string) => void;
};

export function useTodos({
  appStorage,
  updateAppStorage,
}: UseTodosOptions): UseTodosReturn {
  const todos = appStorage.data.todos;

  const addTodo = useCallback(
    (todo: Todo) => {
      updateAppStorage((current) => ({
        ...current,
        data: {
          ...current.data,
          todos: [todo, ...current.data.todos],
        },
      }));
    },
    [updateAppStorage],
  );

  const updateTodo = useCallback(
    (updated: Todo) => {
      updateAppStorage((current) => ({
        ...current,
        data: {
          ...current.data,
          todos: current.data.todos.map((todo) =>
            todo.id === updated.id ? updated : todo,
          ),
        },
      }));
    },
    [updateAppStorage],
  );

  const updateTodos = useCallback(
    (updatedTodos: Todo[]) => {
      updateAppStorage((current) => ({
        ...current,
        data: {
          ...current.data,
          todos: updatedTodos,
        },
      }));
    },
    [updateAppStorage],
  );

  const deleteTodoById = useCallback(
    (id: string) => {
      updateAppStorage((current) => ({
        ...current,
        data: {
          ...current.data,
          todos: current.data.todos.filter((todo) => todo.id !== id),
        },
      }));
    },
    [updateAppStorage],
  );

  const markAllIncomplete = useCallback(() => {
    updateAppStorage((current) => ({
      ...current,
      data: {
        ...current.data,
        todos: current.data.todos.map((todo) => ({
          ...todo,
          completed: false,
        })),
      },
    }));
  }, [updateAppStorage]);

  const importTodoStorage = useCallback(
    (data: string) => {
      const parsed = parseAppStorage(JSON.parse(data));

      updateAppStorage(() => parsed);
    },
    [updateAppStorage],
  );

  return {
    todos,
    addTodo,
    updateTodo,
    updateTodos,
    deleteTodoById,
    markAllIncompleteTodos: markAllIncomplete,
    importTodoStorage,
  };
}
