"use client";

import { CategoryList } from "@/components/shared/category-list";
import { CategorySettingDialog } from "@/components/shared/dialog/category-setting-dialog";
import { StorageRecoveryDialog } from "@/components/shared/dialog/storage-recovery-dialog";
import { TodoAppHeader } from "@/components/shared/todo-app-header";
import { TodoAppNavigation } from "@/components/shared/todo-app-navigation";
import { TodoFormFooter } from "@/components/shared/todo-form-footer";
import { TodoList } from "@/components/shared/todo-list";
import { Separator } from "@/components/ui/separator";
import {
  DEFAULT_CATEGORY_ID,
  DEFAULT_CATEGORY_ORDER,
} from "@/constants/categories";
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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function TodoApp() {
  const {
    appStorage,
    corruptedStorage,
    isLoaded,
    didMarkAllIncomplete,
    isStorageCorrupted,
    updateAppStorage,
    importAppStorage,
    resetAppStorage,
  } = useAppStorage();

  // 削除済みカテゴリが最後に選択されていた場合は、デフォルトカテゴリを使用する
  const activeCategoryId = appStorage.data.categories.some(
    (c) => c.id === appStorage.data.lastSelectedCategoryId,
  )
    ? appStorage.data.lastSelectedCategoryId
    : DEFAULT_CATEGORY_ID;

  const [isEditing, setIsEditing] = useState(false);

  const [categoryDialog, setCategoryDialog] = useState<
    | { mode: "create"; category: null }
    | { mode: "edit"; category: { id: string; name: string } }
    | null
  >(null);

  useEffect(() => {
    if (!isLoaded || !didMarkAllIncomplete) {
      return;
    }

    toast.success(MESSAGES.toast.markedAllIncomplete);
  }, [isLoaded, didMarkAllIncomplete]);

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
      order: DEFAULT_CATEGORY_ORDER,
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
      if (isEditing) {
        handleOpenCategoryEditDialog();
      }

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
    updateAppStorage((current) => ({
      ...current,
      data: {
        ...current.data,
        todos: current.data.todos.map((currentTodo) =>
          currentTodo.id === todo.id ? todo : currentTodo,
        ),
      },
    }));
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

  const isDefaultCategorySelected = activeCategoryId === DEFAULT_CATEGORY_ID;

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
    <>
      <div className="not-prose flex h-full w-full flex-col">
        <div className="bg-background shrink-0">
          <TodoAppHeader
            appStorage={appStorage}
            onMarkAllIncomplete={handleMarkAllIncomplete}
            onImport={handleImport}
          />

          {/* CategoryList の内部でリスト表示に p-1 を指定しているので pl-3 を付けて幅を揃えている */}
          <div className="flex items-center gap-3 p-4 pl-3">
            <div className="min-w-0 flex-1">
              <CategoryList
                categories={appStorage.data.categories}
                activeCategoryId={activeCategoryId}
                isLoaded={isLoaded}
                isEditing={isEditing}
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
              appStorage={appStorage}
              onToggleEditing={() => setIsEditing((prev) => !prev)}
            />
          </div>

          <Separator />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28">
          <TodoList
            todos={visibleTodos}
            categories={appStorage.data.categories}
            isLoaded={isLoaded}
            isEditing={isEditing}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onReorder={handleReorder}
          />
        </div>

        <TodoFormFooter onSubmit={handleCreate} />
      </div>

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
    </>
  );
}
