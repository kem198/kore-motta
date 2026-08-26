"use client";

import { CategoryList } from "@/components/shared/category-list";
import { CategorySettingDialog } from "@/components/shared/dialog/category-setting-dialog";
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
} from "@/lib/app-storage";
import { Category } from "@/schemas/category-schema";
import { TodoFormValues } from "@/schemas/todo-form-schema";
import { Todo } from "@/schemas/todo-schema";
import { useState } from "react";
import { toast } from "sonner";

export function TodoApp() {
  const { appStorage, isLoaded, updateAppStorage, importAppStorage } =
    useAppStorage();

  const [isEditing, setIsEditing] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    () => DEFAULT_CATEGORY_ID,
  );

  const [categoryDialog, setCategoryDialog] = useState<
    | { mode: "create"; category: null }
    | { mode: "edit"; category: { id: string; name: string } }
    | null
  >(null);

  const visibleTodos = appStorage.data.todos
    .filter((todo) => todo.categoryId === activeCategoryId)
    .toSorted((a, b) => a.order - b.order);

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
      },
    }));

    setActiveCategoryId(id);
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
      },
    }));

    setIsEditing(false);

    toast.success(MESSAGES.toast.markAllIncomplete);
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    if (!isLoaded) {
      return;
    }

    const reorderedVisibleTodos = reorderTodos(
      visibleTodos,
      startIndex,
      endIndex,
    );

    const reorderedTodoMap = new Map(
      reorderedVisibleTodos.map((todo) => [todo.id, todo]),
    );

    updateAppStorage((current) => {
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

    updateAppStorage((current) => ({
      ...current,
      data: deleteCategory(current.data, categoryId),
    }));

    // 削除されたカテゴリが選択中だった場合、デフォルトカテゴリに切り替え
    if (activeCategoryId === categoryId) {
      setActiveCategoryId(DEFAULT_CATEGORY_ID);
    }

    toast.success(MESSAGES.toast.categoryDeleted, {
      description: category.name,
    });
  };

  return (
    <div className="not-prose flex w-full flex-col">
      <div className="bg-background sticky top-0 z-50">
        <TodoAppHeader appStorage={appStorage} onImport={handleImport} />

        <div className="flex flex-col gap-3 p-4">
          <CategoryList
            categories={appStorage.data.categories}
            activeCategoryId={activeCategoryId}
            isLoaded={isLoaded}
            onSelect={setActiveCategoryId}
            onCreate={() =>
              setCategoryDialog({
                mode: "create",
                category: null,
              })
            }
          />

          <TodoAppNavigation
            isEditing={isEditing}
            appStorage={appStorage}
            onMarkAllIncomplete={handleMarkAllIncomplete}
            onImport={handleImport}
            onOpenCategorySettings={handleOpenCategoryEditDialog}
            onToggleEditing={() => setIsEditing((prev) => !prev)}
          />
        </div>
        <Separator />
      </div>

      <div className="px-4">
        <TodoList
          todos={visibleTodos}
          isLoaded={isLoaded}
          isEditing={isEditing}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onReorder={handleReorder}
        />
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
    </div>
  );
}
