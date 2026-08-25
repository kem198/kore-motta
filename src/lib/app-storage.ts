import { DEFAULT_CATEGORIES_STORAGE } from "@/constants/categories";
import { CURRENT_APP_STORAGE_VERSION } from "@/constants/version";
import { AppStorage, parseAppStorage } from "@/schemas/app-storage-schema";

export const APP_STORAGE_KEY = "appStorage";

export function createInitialAppStorage(): AppStorage {
  return {
    version: CURRENT_APP_STORAGE_VERSION,
    data: {
      settings: {},
      categories: DEFAULT_CATEGORIES_STORAGE,
      todos: [],
    },
  };
}

export function loadAppStorage(storageKey = APP_STORAGE_KEY): AppStorage {
  if (typeof window === "undefined") {
    return createInitialAppStorage();
  }

  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    const initialStorage = createInitialAppStorage();
    saveAppStorage(initialStorage, storageKey);
    return initialStorage;
  }

  return parseAppStorage(JSON.parse(raw));
}

export function saveAppStorage(
  appStorage: AppStorage,
  storageKey = APP_STORAGE_KEY,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(appStorage));
}

export function importAppStorage(data: string): AppStorage {
  return parseAppStorage(JSON.parse(data));
}
