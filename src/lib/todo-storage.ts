import { createInitialAppStorage } from "@/lib/storage/app-storage";
import { parseAppStorage } from "@/schemas/app-storage-schema";
import { AppStorage } from "@/types/app-storage";
import { Todo } from "@/types/todo";

export const TODO_STORAGE_KEY = "todoStorage";

const TODO_STORAGE_EVENT = "todo-storage-change";

function getStorageData(storageKey: string): AppStorage {
  if (typeof window === "undefined") {
    return createInitialAppStorage();
  }

  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return createInitialAppStorage();
  }

  return parseAppStorage(JSON.parse(raw));
}

function setStorageData(storageKey: string, storage: AppStorage): void {
  window.localStorage.setItem(storageKey, JSON.stringify(storage));

  window.dispatchEvent(new Event(TODO_STORAGE_EVENT));
}

export function subscribeAppStorage(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(TODO_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(TODO_STORAGE_EVENT, callback);
  };
}

export function getAppStorage(storageKey: string): AppStorage {
  return getStorageData(storageKey);
}

export function getServerAppStorage(): AppStorage {
  return createInitialAppStorage();
}

export function setTodos(storageKey: string, todos: Todo[]): void {
  const storage = getStorageData(storageKey);

  setStorageData(storageKey, {
    ...storage,
    data: {
      ...storage.data,
      todos,
    },
  });
}

export function addTodo(storageKey: string, todo: Todo): void {
  const storage = getStorageData(storageKey);

  setTodos(storageKey, [todo, ...storage.data.todos]);
}

export function updateTodo(storageKey: string, updated: Todo): void {
  const storage = getStorageData(storageKey);

  setTodos(
    storageKey,
    storage.data.todos.map((todo) => (todo.id === updated.id ? updated : todo)),
  );
}

export function deleteTodoById(storageKey: string, id: string): void {
  const storage = getStorageData(storageKey);

  setTodos(
    storageKey,
    storage.data.todos.filter((todo) => todo.id !== id),
  );
}

export function markAllIncompleteTodos(storageKey: string): void {
  const storage = getStorageData(storageKey);

  setTodos(
    storageKey,
    storage.data.todos.map((todo) => ({
      ...todo,
      completed: false,
    })),
  );
}
