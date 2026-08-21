import { useCallback, useEffect, useState } from "react";

import { CURRENT_ETRIAN_REGISTRY_VERSION } from "@/constants/version";
import { Etrian, EtrianRegistry } from "@/types/etrian";

export const ETRIAN_REGISTRY_STORAGE_KEY = "etrianRegistry";

type UseEtrianRegistryOptions = {
  storageKey?: string;
};

type UseEtrianRegistryReturn = {
  storedEtrians: Etrian[];
  storedEtrianRegistry: EtrianRegistry;
  isLoaded: boolean;
  migrationError: {
    hasError: boolean;
    originalData: string | null;
  };
  addEtrian: (etrian: Etrian) => void;
  updateEtrian: (etrian: Etrian) => void;
  updateEtrians: (updatedEtrians: Etrian[]) => void;
  deleteEtrianById: (id: string) => void;
  resetEtrians: () => void;
  importEtrianRegistry: (data: string) => void;
  clearMigrationError: () => void;
};

export function useEtrianRegistry(
  options: UseEtrianRegistryOptions = {},
): UseEtrianRegistryReturn {
  const { storageKey = ETRIAN_REGISTRY_STORAGE_KEY } = options;

  const [storedEtrians, setStoredEtrians] = useState<Etrian[]>([]);
  const [storedEtrianRegistry, setStoredEtrianRegistry] =
    useState<EtrianRegistry | null>(null);
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
        const parsedData = JSON.parse(data);
        setStoredEtrianRegistry(parsedData);
        setStoredEtrians(parsedData.etrians);
      } else {
        setStoredEtrianRegistry(null);
        setStoredEtrians([]);
      }
    } catch {
      // マイグレーション処理に失敗した場合、元のデータを保持してエラー状態を設定する
      setMigrationError({
        // MigrationErrorDialog を表示する
        hasError: true,
        originalData: data,
      });
      setStoredEtrians([]);
      setStoredEtrianRegistry(null);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") {
      return;
    }

    const registry: EtrianRegistry = {
      version: CURRENT_ETRIAN_REGISTRY_VERSION,
      etrians: storedEtrians,
    };
    setStoredEtrianRegistry(registry);
    window.localStorage.setItem(storageKey, JSON.stringify(registry));
  }, [storedEtrians, isLoaded, storageKey]);

  const addEtrian = useCallback((etrian: Etrian) => {
    setStoredEtrians((prev) => [etrian, ...prev]);
  }, []);

  const updateEtrian = useCallback((updated: Etrian) => {
    setStoredEtrians((prev) =>
      prev.map((current) => (current.id === updated.id ? updated : current)),
    );
  }, []);

  const updateEtrians = (updatedEtrians: Etrian[]) =>
    setStoredEtrians(updatedEtrians);

  const deleteEtrianById = useCallback((id: string) => {
    setStoredEtrians((prev) => prev.filter((etrian) => etrian.id !== id));
  }, []);

  const resetEtrians = useCallback(() => {
    setStoredEtrians([]);
    setStoredEtrianRegistry(null);
  }, []);

  const clearMigrationError = useCallback(() => {
    setMigrationError({
      hasError: false,
      originalData: null,
    });
  }, []);

  const importEtrianRegistry = useCallback((data: string) => {
    const parsedTodos = JSON.parse(data);

    setStoredEtrianRegistry(parsedTodos);
    setStoredEtrians(parsedTodos.etrians);
  }, []);

  return {
    storedEtrians,
    storedEtrianRegistry: storedEtrianRegistry ?? {
      version: CURRENT_ETRIAN_REGISTRY_VERSION,
      etrians: storedEtrians,
    },
    isLoaded,
    migrationError,
    addEtrian,
    updateEtrian,
    updateEtrians,
    deleteEtrianById,
    resetEtrians,
    importEtrianRegistry,
    clearMigrationError,
  };
}
