import { migrateAppStorage } from "@/lib/app-storage-migration";
import { repairAppStorage, validateIntegrity } from "@/lib/app-storage-utils";
import { AppStorage, parseAppStorage } from "@/schemas/app-storage-schema";

/**
 * AppStorage の読み込みに失敗したことを表すエラー。
 *
 * JSON の解析、AppStorage のバリデーション、またはデータの整合性検証に
 * 失敗した場合に使用する。
 */
export class AppStorageLoadError extends Error {
  constructor(
    public readonly rawData: string,
    cause: unknown,
  ) {
    super("Failed to load AppStorage.", { cause });
    this.name = "AppStorageLoadError";
  }
}

type AppStorageLoadResult = {
  appStorage: AppStorage;
  didMarkAllIncomplete: boolean;
};

/**
 * localStorage から AppStorage を読み込む。
 *
 * - 保存データが存在しない場合は初期データを作成して保存する。
 * - 保存データを現在の AppStorage のバージョンへ migration する。
 * - 保存データの整合性を検証する。
 * - 保存データの日付が前回の未完了化日時と異なる場合は、すべての Todo を未完了にする。
 *
 * @param storageKey localStorage に使用するキー
 * @returns 読み込んだ AppStorage と、Todo を未完了化したかどうか
 * @throws {AppStorageLoadError} 保存データの JSON 解析、AppStorage のバリデーション、
 * データの整合性検証に失敗した場合
 */
export function loadAppStorage(
  storageKey = APP_STORAGE_KEY,
): AppStorageLoadResult {
  if (typeof window === "undefined") {
    return {
      appStorage: createInitialAppStorage(),
      didMarkAllIncomplete: false,
    };
  }

  const raw = window.localStorage.getItem(storageKey);

  // localStorage にデータがない場合は初期データを作成して返す
  if (!raw) {
    const initialStorage = createInitialAppStorage();
    saveAppStorage(initialStorage, storageKey);

    return {
      appStorage: initialStorage,
      didMarkAllIncomplete: false,
    };
  }

  // JSON として解釈できなければ例外をスローする
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new AppStorageLoadError(raw, error);
  }

  // 現在の AppStorage のバージョンへ migration できなければ例外をスローする
  let appStorage: AppStorage;
  try {
    appStorage = migrateAppStorage(parsed);
  } catch (error) {
    throw new AppStorageLoadError(raw, error);
  }

  try {
    validateIntegrity(appStorage);
  } catch (error) {
    try {
      appStorage = repairAppStorage(appStorage);
      saveAppStorage(appStorage, storageKey);
    } catch (repairError) {
      throw new AppStorageLoadError(raw, error);
    }
  }

  return markAllIncompleteIfDateChanged(appStorage);
}

/**
 * AppStorage を localStorage に保存する。
 *
 * @param appStorage 保存する AppStorage
 * @param storageKey localStorage に使用するキー
 */
export function saveAppStorage(
  appStorage: AppStorage,
  storageKey = APP_STORAGE_KEY,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(appStorage));
}

/**
 * JSON 文字列を AppStorage として解析する。
 *
 * @param data AppStorage の JSON 文字列
 * @returns 解析済みの AppStorage
 * @throws JSON の解析または AppStorage のバリデーションに失敗した場合
 */
export function importAppStorage(data: string): AppStorage {
  const appStorage = parseAppStorage(JSON.parse(data));
  validateIntegrity(appStorage);
  return appStorage;
}
