"use client";

import { useCallback, useEffect, useState } from "react";

import {
  APP_STORAGE_KEY,
  createInitialAppStorage,
  loadAppStorage,
  saveAppStorage,
} from "@/lib/storage/app-storage";
import { AppStorage } from "@/schemas/app-storage-schema";

type UseAppStorageOptions = {
  storageKey?: string;
};

type UseAppStorageReturn = {
  appStorage: AppStorage;
  isLoaded: boolean;
  updateAppStorage: (updater: (current: AppStorage) => AppStorage) => void;
  replaceAppStorage: (appStorage: AppStorage) => void;
};

export function useAppStorage(
  options: UseAppStorageOptions = {},
): UseAppStorageReturn {
  const { storageKey = APP_STORAGE_KEY } = options;

  const [appStorage, setAppStorage] = useState<AppStorage>(() =>
    createInitialAppStorage(),
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const loadedStorage = loadAppStorage(storageKey);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppStorage(loadedStorage);
    } catch {
      setAppStorage(createInitialAppStorage());
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      saveAppStorage(appStorage, storageKey);
    } catch {
      // ignore
    }
  }, [appStorage, isLoaded, storageKey]);

  const updateAppStorage = useCallback(
    (updater: (current: AppStorage) => AppStorage) => {
      setAppStorage((current) => updater(current));
    },
    [],
  );

  const replaceAppStorage = useCallback((next: AppStorage) => {
    setAppStorage(next);
  }, []);

  return {
    appStorage,
    isLoaded,
    updateAppStorage,
    replaceAppStorage,
  };
}
