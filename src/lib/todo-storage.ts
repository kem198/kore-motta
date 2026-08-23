import { DEFAULT_CATEGORIES_STORAGE } from "@/constants/categories";
import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";
import { parseTodoStorage } from "@/schemas/todo-storage-schema";
import { Todo, TodoStorage } from "@/types/todo";

export const TODO_STORAGE_KEY = "todoStorage";

const TODO_STORAGE_EVENT = "todo-storage-change";

function getStorageData(storageKey: string): TodoStorage {
  if (typeof window === "undefined") {
    return {
      version: CURRENT_TODO_STORAGE_VERSION,
      todos: [],
      categories: DEFAULT_CATEGORIES_STORAGE,
    };
  }

  const data = window.localStorage.getItem(storageKey);

  if (!data) {
    return {
      version: CURRENT_TODO_STORAGE_VERSION,
      todos: [],
      categories: DEFAULT_CATEGORIES_STORAGE,
    };
  }

  return parseTodoStorage(JSON.parse(data));
}

function setStorageData(storageKey: string, storage: TodoStorage): void {
  window.localStorage.setItem(storageKey, JSON.stringify(storage));

  window.dispatchEvent(new Event(TODO_STORAGE_EVENT));
}

export function subscribeTodoStorage(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(TODO_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(TODO_STORAGE_EVENT, callback);
  };
}

export function getTodoStorage(storageKey: string): TodoStorage {
  return getStorageData(storageKey);
}

export function getServerTodoStorage(): TodoStorage {
  return {
    version: CURRENT_TODO_STORAGE_VERSION,
    todos: [],
    categories: DEFAULT_CATEGORIES_STORAGE,
  };
}

export function setTodos(storageKey: string, todos: Todo[]): void {
  const storage = getStorageData(storageKey);

  setStorageData(storageKey, {
    ...storage,
    version: CURRENT_TODO_STORAGE_VERSION,
    todos,
  });
}

export function addTodo(storageKey: string, todo: Todo): void {
  const storage = getStorageData(storageKey);

  setTodos(storageKey, [todo, ...storage.todos]);
}

export function updateTodo(storageKey: string, updated: Todo): void {
  const storage = getStorageData(storageKey);

  setTodos(
    storageKey,
    storage.todos.map((todo) => (todo.id === updated.id ? updated : todo)),
  );
}

export function deleteTodoById(storageKey: string, id: string): void {
  const storage = getStorageData(storageKey);

  setTodos(
    storageKey,
    storage.todos.filter((todo) => todo.id !== id),
  );
}

export function resetTodos(storageKey: string): void {
  const storage = getStorageData(storageKey);

  setTodos(
    storageKey,
    storage.todos.map((todo) => ({
      ...todo,
      completed: false,
    })),
  );
}
