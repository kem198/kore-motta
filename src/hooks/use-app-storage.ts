"use client";

import { useEffect, useState } from "react";

import {
  APP_STORAGE_KEY,
  createInitialAppStorage,
  loadAppStorage,
  saveAppStorage,
} from "@/lib/app-storage";
import { AppStorage, parseAppStorage } from "@/schemas/app-storage-schema";

type UseAppStorageOptions = {
  /** localStorage に使用するキー。省略時はデフォルトキーを使用する。 */
  storageKey?: string;
};

type UseAppStorageReturn = {
  /** 現在の AppStorage。 */
  appStorage: AppStorage;
  /** localStorage から AppStorage の読み込みが完了したかどうか。 */
  isLoaded: boolean;
  /**
   * 現在の AppStorage を基に更新する。
   *
   * @param updater 現在の AppStorage を受け取り、更新後の AppStorage を返す関数
   */
  updateAppStorage: (updater: (current: AppStorage) => AppStorage) => void;
  /**
   * JSON 文字列から AppStorage を読み込み、現在の状態を置き換える。
   *
   * @param data インポートする AppStorage の JSON 文字列
   * @throws JSON の解析または AppStorage のバリデーションに失敗した場合
   */
  importAppStorage: (data: string) => void;
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

  const updateAppStorage = (updater: (current: AppStorage) => AppStorage) => {
    setAppStorage((current) => updater(current));
  };

  const importAppStorage = (data: string) => {
    const parsed = parseAppStorage(JSON.parse(data));

    setAppStorage(parsed);
  };

  return {
    appStorage,
    isLoaded,
    updateAppStorage,
    importAppStorage,
  };
}
