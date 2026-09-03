"use client";

import { CategoryList } from "@/components/shared/category-list";
import { CategorySettingDialog } from "@/components/shared/dialog/category-setting-dialog";
import { StorageRecoveryDialog } from "@/components/shared/dialog/storage-recovery-dialog";
import { TodoAppHeader } from "@/components/shared/todo-app-header";
import { TodoAppHeaderMenu } from "@/components/shared/todo-app-header-menu";
import { TodoAppNavigation } from "@/components/shared/todo-app-navigation";
import { TodoForm } from "@/components/shared/todo-form";
import { TodoList } from "@/components/shared/todo-list";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_CATEGORY_ID } from "@/constants/categories";
import { MESSAGES } from "@/constants/messages";
import { useAppStorage } from "@/hooks/use-app-storage";
import {
  deleteCategory,
  getNextTodoOrder,
  reorderTodos,
} from "@/lib/todo-utils";
import { Category } from "@/schemas/category-schema";
import { TodoFormValues } from "@/schemas/todo-form-schema";
import { Todo } from "@/schemas/todo-schema";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export function TodoApp() {
  const {
    appStorage,
    corruptedStorage,
    isLoaded,
    didMarkAllIncomplete,
    didRepair,
    isStorageCorrupted,
    updateAppStorage,
    importAppStorage,
    resetAppStorage,
  } = useAppStorage();

  const [isEditing, setIsEditing] = useState(false);

  const [categoryDialog, setCategoryDialog] = useState<
    | { mode: "create"; category: null }
    | { mode: "edit"; category: { id: string; name: string } }
    | null
  >(null);

  /** 現在選択されているカテゴリの ID */
  const activeCategoryId = appStorage.data.categories.some(
    // 削除済みカテゴリが最後に選択されていた場合は、デフォルトカテゴリを使用する
    (c) => c.id === appStorage.data.lastSelectedCategoryId,
  )
    ? appStorage.data.lastSelectedCategoryId
    : DEFAULT_CATEGORY_ID;

  /** 現在選択されているカテゴリがデフォルトカテゴリか否か。 */
  const isDefaultCategorySelected = activeCategoryId === DEFAULT_CATEGORY_ID;

  /**
   * AppStorage 読み込み時に、日付変更によって Todo がすべて未完了に戻された場合、
   * その旨をトーストで通知する。
   */
  useEffect(() => {
    if (!isLoaded || !didMarkAllIncomplete) {
      return;
    }

    toast.success(MESSAGES.toast.markedAllIncomplete);
  }, [isLoaded, didMarkAllIncomplete]);

  /**
   * AppStorage 読み込み時に、データ復旧が行なわれていた場合、
   * その旨をトーストで通知する。
   */
  useEffect(() => {
    if (!isLoaded || !didRepair) {
      return;
    }
    toast.success(MESSAGES.toast.repaired, {
      description: MESSAGES.toast.repairedDescription,
    });
  }, [isLoaded, didRepair]);

  // 選択中のカテゴリ内ですべての Todo が完了になったらトーストを表示する
  // カテゴリを切り替えたときに切替先が全完了済みでは表示しない
  const previousCategoryIdRef = useRef<string | null>(null);
  const previousIsAllCompletedRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const categoryTodos = appStorage.data.todos.filter(
      (todo) => todo.categoryId === activeCategoryId,
    );

    const isAllCompleted =
      categoryTodos.length > 0 && categoryTodos.every((todo) => todo.completed);

    const isSameCategory = previousCategoryIdRef.current === activeCategoryId;

    const wasNotAllCompleted = previousIsAllCompletedRef.current === false;

    if (isSameCategory && wasNotAllCompleted && isAllCompleted) {
      toast.success(MESSAGES.toast.markedAllCompletedInCategory);
    }

    previousCategoryIdRef.current = activeCategoryId;
    previousIsAllCompletedRef.current = isAllCompleted;
  }, [isLoaded, activeCategoryId, appStorage.data.todos]);

  /**
   * 現在選択されているカテゴリに属する Todo の一覧。
   *
   * カテゴリ内の並び順に従って表示する。
   */
  const visibleTodos = useMemo(() => {
    return appStorage.data.todos
      .filter((todo) => todo.categoryId === activeCategoryId)
      .toSorted((a, b) => a.order - b.order);
  }, [appStorage.data.todos, activeCategoryId]);

  const handleCreateCategory = (name: string) => {
    const id = crypto.randomUUID();
    // TODO: カテゴリ並び替え機能を実装時に変更必要
    const newCategory: Category = {
      id,
      name,
    };

    updateAppStorage((current) => ({
      ...current,
      data: {
        ...current.data,
        categories: [...current.data.categories, newCategory],
        lastSelectedCategoryId: id,
      },
    }));
  };

  const handleSelectCategory = (categoryId: string) => {
    if (categoryId === activeCategoryId) {
      return;
    }

    updateAppStorage((current) => ({
      ...current,
      data: {
        ...current.data,
        lastSelectedCategoryId: categoryId,
      },
    }));
  };

  const handleCreate = (values: TodoFormValues) => {
    const trimmedName = values.name.trim();

    if (!trimmedName) {
      return;
    }

    updateAppStorage((current) => {
      const currentVisibleTodos = current.data.todos
        .filter((todo) => todo.categoryId === activeCategoryId)
        .toSorted((a, b) => a.order - b.order);
      // 表示されているカテゴリ内の Todo を元に order を割り振る
      // 新規 Todo を末尾に追加するため
      const nextOrder = getNextTodoOrder(currentVisibleTodos);

      const newTodo: Todo = {
        id: crypto.randomUUID(),
        name: trimmedName,
        order: nextOrder,
        memo: values.memo?.trim() || undefined,
        categoryId: activeCategoryId,
        completed: false,
      };

      return {
        ...current,
        data: {
          ...current.data,
          todos: [...current.data.todos, newTodo],
        },
      };
    });
  };

  const handleDelete = (todo: Todo) => {
    updateAppStorage((current) => ({
      ...current,
      data: {
        ...current.data,
        todos: current.data.todos.filter(
          (currentTodo) => currentTodo.id !== todo.id,
        ),
      },
    }));
  };

  const handleUpdate = (todo: Todo) => {
    updateAppStorage((current) => {
      const targetTodo = current.data.todos.find((item) => item.id === todo.id);

      if (!targetTodo) {
        return current;
      }

      // カテゴリ変更がない場合は、既存の order を維持する
      if (targetTodo.categoryId === todo.categoryId) {
        return {
          ...current,
          data: {
            ...current.data,
            todos: current.data.todos.map((item) =>
              item.id === todo.id ? todo : item,
            ),
          },
        };
      }

      // カテゴリを変更した場合は、移動先カテゴリの末尾に追加する
      const destinationTodos = current.data.todos.filter(
        (item) => item.categoryId === todo.categoryId,
      );
      const nextOrder = getNextTodoOrder(destinationTodos);
      return {
        ...current,
        data: {
          ...current.data,
          todos: current.data.todos.map((item) =>
            item.id === todo.id ? { ...todo, order: nextOrder } : item,
          ),
        },
      };
    });
  };

  const handleMarkAllIncomplete = () => {
    updateAppStorage((current) => ({
      ...current,
      data: {
        ...current.data,
        todos: current.data.todos.map((todo) => ({
          ...todo,
          completed: false,
        })),
        lastMarkedAllIncompleteAt: new Date().toISOString(),
      },
    }));

    toast.success(MESSAGES.toast.markedAllIncomplete);
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    if (!isLoaded) {
      return;
    }

    updateAppStorage((current) => {
      const currentVisibleTodos = current.data.todos
        .filter((todo) => todo.categoryId === activeCategoryId)
        .toSorted((a, b) => a.order - b.order);

      const reorderedVisibleTodos = reorderTodos(
        currentVisibleTodos,
        startIndex,
        endIndex,
      );

      const reorderedTodoMap = new Map(
        reorderedVisibleTodos.map((todo) => [todo.id, todo]),
      );

      const reorderedTodos = current.data.todos.map(
        (todo) => reorderedTodoMap.get(todo.id) ?? todo,
      );
      return {
        ...current,
        data: {
          ...current.data,
          todos: reorderedTodos,
        },
      };
    });
  };

  const handleImport = (data: string) => {
    try {
      importAppStorage(data);

      toast.success(MESSAGES.toast.imported);
      return true;
    } catch {
      return false;
    }
  };

  const handleToggleTodoPosition = () => {
    const nextPosition =
      appStorage.data.settings.todoTogglePosition === "left" ? "right" : "left";

    updateAppStorage((current) => ({
      ...current,
      data: {
        ...current.data,
        settings: {
          ...current.data.settings,
          todoTogglePosition: nextPosition,
        },
      },
    }));

    toast.success(MESSAGES.toast.changedTodoPosition(nextPosition));
  };

  const handleOpenCategoryEditDialog = () => {
    const selectedCategory = appStorage.data.categories.find(
      (category) => category.id === activeCategoryId,
    );

    if (!selectedCategory) {
      return;
    }

    setCategoryDialog({
      mode: "edit",
      category: {
        id: activeCategoryId,
        name: selectedCategory.name,
      },
    });
  };

  const handleRenameCategory = (
    category: { id: string; name: string },
    name: string,
  ) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    updateAppStorage((current) => ({
      ...current,
      data: {
        ...current.data,
        categories: current.data.categories.map((item) =>
          item.id === category.id ? { ...item, name: trimmedName } : item,
        ),
      },
    }));
  };

  const handleDeleteCategory = (category: { id: string; name: string }) => {
    const categoryId = category.id;

    // デフォルトカテゴリは削除できない
    if (categoryId === DEFAULT_CATEGORY_ID) {
      toast.error(MESSAGES.toast.error, {
        description: "デフォルトカテゴリは削除できません",
      });
      return;
    }

    updateAppStorage((current) => {
      const data = deleteCategory(current.data, categoryId);

      return {
        ...current,
        data: {
          ...data,
          lastSelectedCategoryId:
            // 削除されたカテゴリが選択中だった場合、デフォルトカテゴリに切り替える
            current.data.lastSelectedCategoryId === categoryId
              ? DEFAULT_CATEGORY_ID
              : current.data.lastSelectedCategoryId,
        },
      };
    });
  };

  const handleReset = () => {
    resetAppStorage();
    toast.success("登録内容を初期化しました");
  };

  return (
    /* 1. 最外枠：スクロールを完全に禁止して画面枠を固定 */
    <div className="bg-background mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden">
      {/* 2. 上部ヘッダー (スクロールせず固定) */}
      <header className="pt-[env(safe-area-inset-top)]">
        <TodoAppHeader>
          <TodoAppHeaderMenu
            appStorage={appStorage}
            onMarkAllIncomplete={handleMarkAllIncomplete}
            onImport={handleImport}
          ></TodoAppHeaderMenu>
        </TodoAppHeader>

        <TodoForm onSubmit={handleCreate} className="max-w-3xl p-4" />

        <Separator />
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <TodoList
          todos={visibleTodos}
          categories={appStorage.data.categories}
          todoTogglePosition={appStorage.data.settings.todoTogglePosition}
          isLoaded={isLoaded}
          isEditing={isEditing}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onReorder={handleReorder}
          className="px-4 pb-4"
        />
      </main>

      <footer className="bg-background shrink-0 pb-[env(safe-area-inset-bottom)]">
        <Separator />
        <div className="px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="w-full min-w-0">
              <CategoryList
                categories={appStorage.data.categories}
                activeCategoryId={activeCategoryId}
                isLoaded={isLoaded}
                onSelect={handleSelectCategory}
                onCreate={() =>
                  setCategoryDialog({
                    mode: "create",
                    category: null,
                  })
                }
              />
            </div>

            <TodoAppNavigation
              isEditing={isEditing}
              onToggleEditing={() => setIsEditing((prev) => !prev)}
              onToggleTodoPosition={handleToggleTodoPosition}
              onOpenCategorySetting={handleOpenCategoryEditDialog}
            />
          </div>
        </div>
      </footer>

      {/* ダイアログ類 */}
      <CategorySettingDialog
        key={
          categoryDialog
            ? `${categoryDialog.mode}-${categoryDialog.category?.id ?? "new"}`
            : "category-setting-closed"
        }
        open={!!categoryDialog}
        mode={categoryDialog?.mode ?? "create"}
        category={
          categoryDialog?.mode === "edit" ? categoryDialog.category : null
        }
        isDefaultCategory={isDefaultCategorySelected}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryDialog(null);
          }
        }}
        onCreate={handleCreateCategory}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategory}
      />

      <StorageRecoveryDialog
        open={isStorageCorrupted}
        storage={corruptedStorage}
        mode="corrupted"
        onReset={handleReset}
      />
    </div>
  );
}
