"use client";

import { useCallback, useEffect, useState } from "react";

import {
  APP_STORAGE_KEY,
  AppStorageLoadError,
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
  /** 現在の AppStorage 。 */
  appStorage: AppStorage;
  /** データが破損している場合の AppStorage 。 */
  corruptedStorage: string | null;
  /** localStorage に保存された AppStorage が破損しているかどうか。 */
  isStorageCorrupted: boolean;
  /** localStorage から AppStorage の読み込みが完了したかどうか。 */
  isLoaded: boolean;
  /** AppStorage の読み込み時に Todo が未完了に戻されたかどうか。 */
  didMarkAllIncomplete: boolean;
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
  /** AppStorage を初期状態に戻す。 */
  resetAppStorage: () => void;
};

export function useAppStorage(
  options: UseAppStorageOptions = {},
): UseAppStorageReturn {
  const { storageKey = APP_STORAGE_KEY } = options;

  const [appStorage, setAppStorage] = useState<AppStorage>(() =>
    createInitialAppStorage(),
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const [isStorageCorrupted, setIsStorageCorrupted] = useState(false);
  const [corruptedStorage, setCorruptedStorage] = useState<string | null>(null);
  const [didMarkAllIncomplete, setDidMarkAllIncomplete] = useState(false);

  useEffect(() => {
    try {
      const result = loadAppStorage(storageKey);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppStorage(result.appStorage);
      setDidMarkAllIncomplete(result.didMarkAllIncomplete);
    } catch (error) {
      if (error instanceof AppStorageLoadError) {
        setCorruptedStorage(error.rawData);
        setIsStorageCorrupted(true);
      } else {
        throw error;
      }
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    // localStorage のデータが破損していれば何もしない
    if (!isLoaded || isStorageCorrupted) {
      return;
    }

    try {
      saveAppStorage(appStorage, storageKey);
    } catch {
      // ignore
    }
  }, [appStorage, isLoaded, isStorageCorrupted, storageKey]);

  const updateAppStorage = useCallback(
    (updater: (current: AppStorage) => AppStorage) => {
      setAppStorage((current) => updater(current));
    },
    [],
  );

  const importAppStorage = useCallback((data: string) => {
    const parsed = parseAppStorage(JSON.parse(data));

    setAppStorage(parsed);
    setDidMarkAllIncomplete(false);
  }, []);

  const resetAppStorage = useCallback(() => {
    const initialStorage = createInitialAppStorage();

    setAppStorage(initialStorage);
    setDidMarkAllIncomplete(false);
    setIsStorageCorrupted(false);
    setCorruptedStorage(null);
  }, []);

  return {
    appStorage,
    corruptedStorage,
    isLoaded,
    isStorageCorrupted,
    didMarkAllIncomplete,
    updateAppStorage,
    importAppStorage,
    resetAppStorage,
  };
}
