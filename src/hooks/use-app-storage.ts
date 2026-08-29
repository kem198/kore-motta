"use client";

import {
  AppStorageLoadError,
  loadAppStorage,
  saveAppStorage,
} from "@/lib/app-storage";
import {
  APP_STORAGE_KEY,
  createInitialAppStorage,
  markAllIncompleteIfDateChanged,
} from "@/lib/app-storage-utils";
import { AppStorage, parseAppStorage } from "@/schemas/app-storage-schema";
import { useCallback, useEffect, useRef, useState } from "react";

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

/**
 * AppStorage の読み込み・更新・インポート・リセットを管理するカスタムフック。
 *
 * - 初期状態として AppStorage を作成し、マウント後に localStorage から保存データを読み込む。
 * - 保存データの読み込み時に日付が変わっていた場合は Todo が未完了に戻され、`didMarkAllIncomplete` が `true` になる。
 *
 * @param options localStorage の設定
 * @returns AppStorage とその操作関数
 */
export function useAppStorage(
  options: UseAppStorageOptions = {},
): UseAppStorageReturn {
  const { storageKey = APP_STORAGE_KEY } = options;

  const [appStorage, setAppStorage] = useState<AppStorage>(() =>
    createInitialAppStorage(),
  );

  // バックグラウンドからの復帰時に現在の AppStorage を参照し、更新が必要か否かを判定するため
  const appStorageRef = useRef(appStorage);

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

  useEffect(() => {
    if (!isLoaded || isStorageCorrupted) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const result = markAllIncompleteIfDateChanged(appStorageRef.current);

      setAppStorage(result.appStorage);
      setDidMarkAllIncomplete(result.didMarkAllIncomplete);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoaded, isStorageCorrupted]);

  // 常に最新の appStorage を ref に同期する
  useEffect(() => {
    appStorageRef.current = appStorage;
  }, [appStorage]);

  const updateAppStorage = useCallback(
    (updater: (current: AppStorage) => AppStorage) => {
      setAppStorage((current) => {
        const next = updater(current);
        return next;
      });
    },
    [],
  );

  const importAppStorage = useCallback((data: string) => {
    const parsed = parseAppStorage(JSON.parse(data));
    const result = markAllIncompleteIfDateChanged(parsed);

    setAppStorage(result.appStorage);
    setDidMarkAllIncomplete(result.didMarkAllIncomplete);
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
