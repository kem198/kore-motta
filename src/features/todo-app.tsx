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
  DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
  DEFAULT_CATEGORY_ORDER,
} from "@/constants/categories";
import { MESSAGES } from "@/constants/messages";
import { useAppStorage } from "@/hooks/use-app-storage";
import { useCategories } from "@/hooks/use-categories";
import { useTodos } from "@/hooks/use-todos";
import { Category } from "@/schemas/category-schema";
import { TodoFormValues } from "@/schemas/todo-form-schema";
import { Todo } from "@/schemas/todo-schema";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function TodoApp() {
  const { appStorage, isLoaded, updateAppStorage } = useAppStorage();

  const {
    todos,
    addTodo,
    updateTodo,
    updateTodos,
    deleteTodoById,
    markAllIncompleteTodos: markAllIncomplete,
    importTodoStorage,
  } = useTodos({
    appStorage,
    updateAppStorage,
  });

  const { categories, addCategory, updateCategory, deleteCategoryById } =
    useCategories({
      appStorage,
      updateAppStorage,
    });

  const [isEditing, setIsEditing] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    () => DEFAULT_CATEGORY_ID,
  );

  const [categoryDialog, setCategoryDialog] = useState<
    | { mode: "create"; category: null }
    | { mode: "edit"; category: { id: string; name: string } }
    | null
  >(null);

  const visibleTodos = todos
    .filter((todo) => todo.categoryId === activeCategoryId)
    .toSorted((a, b) => a.order - b.order);

  const handleCreateCategory = useCallback(
    (name: string) => {
      const id = crypto.randomUUID();
      // TODO: カテゴリ並び替え機能を実装時に変更必要
      const order = DEFAULT_CATEGORY_ORDER;

      const newCategory: Category = {
        id,
        name,
        order,
        markAllIncompleteAt: DEFAULT_CATEGORY_MARK_ALL_INCOMPLETE_AT,
      };

      addCategory(newCategory);
      setActiveCategoryId(id);

      // toast.add({
      //   title: MESSAGES.toast.categoryCreated,
      //   description: name,
      //   type: "success",
      // });
    },
    [addCategory],
  );

  const handleCreate = useCallback(
    (values: TodoFormValues) => {
      const trimmedName = values.name.trim();

      if (!trimmedName) {
        return;
      }

      // 表示されているカテゴリ内の Todo を元に order を割り振る
      // 新規 Todo を末尾に追加するため
      const order =
        visibleTodos.length === 0
          ? 0
          : Math.max(...visibleTodos.map((todo) => todo.order)) + 1;

      const newTodo: Todo = {
        id: crypto.randomUUID(),
        name: trimmedName,
        order: order,
        memo: values.memo?.trim() || undefined,
        categoryId: activeCategoryId,
        completed: false,
      };

      addTodo(newTodo);
    },
    [activeCategoryId, addTodo, visibleTodos],
  );

  const handleDelete = useCallback(
    (todo: Todo) => {
      deleteTodoById(todo.id);

      // toast.add({
      //   title: MESSAGES.toast.deleted,
      //   description: todo.name,
      //   type: "success",
      // });
    },
    [deleteTodoById],
  );

  const handleUpdate = useCallback(
    (todo: Todo) => {
      updateTodo(todo);

      // toast.add({
      //   title: MESSAGES.toast.updated,
      //   description: todo.name,
      //   type: "success",
      // });
    },
    [updateTodo],
  );

  const handleMarkAllIncomplete = useCallback(() => {
    markAllIncomplete();
    setIsEditing(false);

    toast.success(MESSAGES.toast.markAllIncomplete);
    // toast.add({
    //   title: MESSAGES.toast.markAllIncomplete,
    //   type: "success",
    // });
  }, [markAllIncomplete]);

  function reorderTodos(
    todos: Todo[],
    startIndex: number,
    endIndex: number,
  ): Todo[] {
    const newTodos = [...todos];
    const [removed] = newTodos.splice(startIndex, 1);

    newTodos.splice(endIndex, 0, removed);

    return newTodos.map((todo, index) => ({
      ...todo,
      order: index,
    }));
  }

  const handleReorder = useCallback(
    (startIndex: number, endIndex: number) => {
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

      const reorderedTodos = todos.map(
        (todo) => reorderedTodoMap.get(todo.id) ?? todo,
      );

      updateTodos(reorderedTodos);
    },
    [isLoaded, todos, visibleTodos, updateTodos],
  );

  const handleImport = useCallback(
    (data: string) => {
      try {
        importTodoStorage(data);

        toast.success(MESSAGES.toast.imported);

        // toast.add({
        //   title: MESSAGES.toast.imported,
        //   type: "success",
        // });

        return true;
      } catch {
        return false;
      }
    },
    [importTodoStorage],
  );

  const handleOpenCategoryEditDialog = useCallback(() => {
    const selectedCategory = categories.find(
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
  }, [activeCategoryId, categories]);

  const handleRenameCategory = useCallback(
    (category: { id: string; name: string }, name: string) => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return;
      }

      const currentCategory = categories.find(
        (item) => item.id === category.id,
      );

      if (!currentCategory) {
        return;
      }

      updateCategory({
        ...currentCategory,
        name: trimmedName,
      });

      // toast.add({
      //   title: MESSAGES.toast.categoryUpdated,
      //   description: trimmedName,
      //   type: "success",
      // });
    },
    [categories, updateCategory],
  );

  const isDefaultCategorySelected = activeCategoryId === DEFAULT_CATEGORY_ID;

  const handleDeleteCategory = useCallback(
    (category: { id: string; name: string }) => {
      const categoryId = category.id;

      // デフォルトカテゴリは削除できない
      if (categoryId === DEFAULT_CATEGORY_ID) {
        toast.error(MESSAGES.toast.error, {
          description: "デフォルトカテゴリは削除できません",
        });
        return;
      }

      // 未分類カテゴリの Todo を取得する
      const defaultCategoryTodos = todos.filter(
        (todo) => todo.categoryId === DEFAULT_CATEGORY_ID,
      );
      // 削除対象カテゴリの Todo を現在の並び順で取得する
      const categoryTodos = todos
        .filter((todo) => todo.categoryId === categoryId)
        .toSorted((a, b) => a.order - b.order);

      // 未分類カテゴリの末尾に追加するための order を決める
      const nextOrder =
        defaultCategoryTodos.length === 0
          ? 0
          : Math.max(...defaultCategoryTodos.map((todo) => todo.order)) + 1;

      // 移行する Todo に未分類カテゴリの末尾から順番に order を割り当てる
      const migratedTodoOrders = new Map(
        categoryTodos.map((todo, index) => [todo.id, nextOrder + index]),
      );

      // 削除対象カテゴリの Todo を未分類カテゴリへ移行する
      const migratedTodos = todos.map((todo) => {
        const order = migratedTodoOrders.get(todo.id);
        if (order === undefined) {
          return todo;
        }

        return {
          ...todo,
          categoryId: DEFAULT_CATEGORY_ID,
          order,
        };
      });

      updateTodos(migratedTodos);

      // カテゴリを削除
      deleteCategoryById(categoryId);

      // 削除されたカテゴリが選択中だった場合、デフォルトカテゴリに切り替え
      if (activeCategoryId === categoryId) {
        setActiveCategoryId(DEFAULT_CATEGORY_ID);
      }

      toast.success(MESSAGES.toast.categoryDeleted, {
        description: category.name,
      });
    },
    [todos, updateTodos, deleteCategoryById, activeCategoryId],
  );

  return (
    <div className="not-prose flex w-full flex-col">
      <div className="bg-background sticky top-0 z-50">
        <TodoAppHeader appStorage={appStorage} onImport={handleImport} />

        <div className="flex flex-col gap-3 p-4">
          <CategoryList
            categories={categories}
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
