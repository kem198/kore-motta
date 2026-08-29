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

  /**
   * React の初期レンダリングでは localStorage を読み込まず、まずアプリで使用する初期状態を作成する。
   * localStorage の読み込みは、コンポーネントがブラウザ上にマウントされた後に useEffect で行う。
   */
  const [appStorage, setAppStorage] = useState<AppStorage>(() =>
    createInitialAppStorage(),
  );

  /**
   * visibilitychange (アプリがバックグラウンドから復帰したときに発生するイベント) の
   * イベントハンドラから最新の AppStorage を参照するための ref。
   *
   * イベントハンドラは useEffect の中で作成されるため、
   * そのまま appStorage を参照すると、作成時点の値を参照し続ける可能性がある。
   *
   * ref に最新の値を保持することで、イベント発生時に現在の状態を取得できる。
   */
  const appStorageRef = useRef(appStorage);

  // localStorage からの初期読み込みが完了したかどうか
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorage のデータが壊れていて読み込めなかったかどうか
  const [isStorageCorrupted, setIsStorageCorrupted] = useState(false);

  // 破損していた localStorage の生データ
  const [corruptedStorage, setCorruptedStorage] = useState<string | null>(null);

  // 初期読み込み時に、日付変更によって Todo を未完了に戻したかどうか
  const [didMarkAllIncomplete, setDidMarkAllIncomplete] = useState(false);

  /**
   * コンポーネントがマウントされた後に localStorage から AppStorage を読み込む。
   *
   * localStorage はブラウザ側の  API のため、
   * Server Component での実行や SSR の対象にならない useEffect 内で読み込む。
   *
   * storageKey が変わった場合も、そのキーから改めてデータを読み込む。
   */
  useEffect(() => {
    try {
      const result = loadAppStorage(storageKey);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppStorage(result.appStorage);
      setDidMarkAllIncomplete(result.didMarkAllIncomplete);
    } catch (error) {
      // localStorage の JSON が壊れているなど、
      // AppStorage の読み込みに失敗した場合は破損データを保持する。
      if (error instanceof AppStorageLoadError) {
        setCorruptedStorage(error.rawData);
        setIsStorageCorrupted(true);
      } else {
        throw error;
      }
    } finally {
      // 正常に読み込めた場合もエラーになった場合も、
      // 初期読み込みは完了したとする
      setIsLoaded(true);
    }
  }, [storageKey]);

  /**
   * appStorage が変更されたとき、その内容を localStorage に保存する。
   *
   * 初期状態の作成直後はまだ localStorage の読み込みが終わっていないため、
   * isLoaded が false の間は保存しない。
   * これにより、localStorage に既に保存されているデータを初期状態で上書きしてしまうことを防ぐ。
   *
   * また、破損したデータを読み込んだ場合も、isStorageCorrupted が true の間は保存しない。
   */
  useEffect(() => {
    // localStorage のデータが破損していれば何もしない
    if (!isLoaded || isStorageCorrupted) {
      return;
    }

    try {
      saveAppStorage(appStorage, storageKey);
    } catch {
      // localStorage への保存に失敗しても、アプリ自体は動作を継続する
    }
  }, [appStorage, isLoaded, isStorageCorrupted, storageKey]);

  /**
   * Page Visibility API の visibilitychange イベントを監視し、
   * アプリがバックグラウンドから復帰したときに日付変更を確認する。
   *
   * スマートフォンではアプリを閉じずにバックグラウンドへ移動し、翌日そのまま復帰することがある。
   * その場合、ページを再読み込みしなくても日付変更を検知できるようにする。
   */
  useEffect(() => {
    if (!isLoaded || isStorageCorrupted) {
      return;
    }

    const handleVisibilityChange = () => {
      // ページが非表示になったタイミングでは処理しない
      if (document.visibilityState !== "visible") {
        return;
      }

      // イベントハンドラ内では ref から最新の AppStorage を取得する
      const result = markAllIncompleteIfDateChanged(appStorageRef.current);

      setAppStorage(result.appStorage);
      setDidMarkAllIncomplete(result.didMarkAllIncomplete);
    };

    // ページの表示状態が変わったときにイベントハンドラを実行する
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // useEffect の再実行時やコンポーネントのアンマウント時に、登録したイベントリスナーを削除する。
    // 削除しないと、古いイベントハンドラが残り続けて同じ処理が複数回実行される原因になる。
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoaded, isStorageCorrupted]);

  /**
   * appStorage が更新されるたびに ref も最新の値へ更新する。
   *
   * useRef の値を変更しても再レンダリングは発生しないため、
   * イベントハンドラから最新の状態を参照する用途に利用する。
   */
  useEffect(() => {
    appStorageRef.current = appStorage;
  }, [appStorage]);

  /**
   * AppStorage を更新する関数。
   *
   * - setAppStorage に現在の状態を受け取る関数を渡すことで、
   * 更新時点での最新の AppStorage を基に次の状態を作成できる。
   * - そのため、複数の更新が短い間隔で発生した場合でも、
   * 古い状態を基に更新してしまうことを防げる。
   */
  const updateAppStorage = useCallback(
    (updater: (current: AppStorage) => AppStorage) => {
      setAppStorage((current) => {
        const next = updater(current);
        return next;
      });
    },
    [],
  );

  /**
   * JSON 文字列から AppStorage をインポートする。
   *
   * JSON.parse で JSON として読み込んだ後、
   * parseAppStorage で AppStorage の形式として正しいかを検証する。
   *
   * インポートしたデータの日付も確認し、
   * 必要であれば Todo を未完了に戻してから状態へ反映する。
   */
  const importAppStorage = useCallback((data: string) => {
    const parsed = parseAppStorage(JSON.parse(data));
    const result = markAllIncompleteIfDateChanged(parsed);

    setAppStorage(result.appStorage);
    setDidMarkAllIncomplete(result.didMarkAllIncomplete);
  }, []);

  /**
   * AppStorage を初期状態に戻す。
   *
   * localStorage への保存は appStorage の変更を監視している
   * useEffect によって自動的に行われるため、ここでは状態だけを更新する。
   */
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
