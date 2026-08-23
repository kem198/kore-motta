"use client";

import { CategoryList } from "@/components/shared/category-list";
import { CategoryDeleteDialog } from "@/components/shared/dialog/category-delete-dialog";
import { CategorySettingDialog } from "@/components/shared/dialog/category-setting-dialog";
import { TodoAppFooter } from "@/components/shared/todo-app-footer";
import { TodoForm } from "@/components/shared/todo-form";
import { TodoList } from "@/components/shared/todo-list";
import { toast } from "@/components/ui/toast";
import {
  DEFAULT_CATEGORY_ID,
  DEFAULT_CATEGORY_RESET_TIME,
} from "@/constants/categories";
import { MESSAGES } from "@/constants/messages";
import { useAppStorage } from "@/hooks/use-app-storage";
import { useCategories } from "@/hooks/use-categories";
import { useTodos } from "@/hooks/use-todos";
import { TodoFormValues } from "@/schemas/todo-form-schema";
import { Category } from "@/types/category";
import { Todo } from "@/types/todo";
import { useCallback, useState } from "react";

export function TodoApp() {
  const { appStorage, isLoaded, updateAppStorage, replaceAppStorage } =
    useAppStorage();

  const {
    todos,
    addTodo,
    updateTodo,
    updateTodos,
    deleteTodoById,
    resetTodos,
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
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [categoryDialog, setCategoryDialog] = useState<
    | { mode: "create"; category: null }
    | { mode: "edit"; category: { id: string; name: string } }
    | null
  >(null);

  const visibleTodos = todos.filter(
    (todo) => todo.categoryId === activeCategoryId,
  );

  const handleCreateCategory = useCallback((name: string) => {
    const id = crypto.randomUUID();

    const newCategory: Category = {
      id,
      name,
      resetTime: DEFAULT_CATEGORY_RESET_TIME,
    };

    addCategory(newCategory);
    setActiveCategoryId(id);

    toast.add({
      title: MESSAGES.toast.categoryCreated,
      description: name,
      type: "success",
    });
  }, []);

  const handleCreate = useCallback(
    (values: TodoFormValues) => {
      const trimmedName = values.name.trim();

      if (!trimmedName) {
        return;
      }

      const newTodo: Todo = {
        id: crypto.randomUUID(),
        name: trimmedName,
        order: 0,
        memo: values.memo?.trim() || undefined,
        categoryId: activeCategoryId,
        completed: false,
      };

      addTodo(newTodo);

      toast.add({
        title: MESSAGES.toast.created,
        description: trimmedName,
        type: "success",
      });
    },
    [activeCategoryId, addTodo],
  );

  const handleDelete = useCallback(
    (todo: Todo) => {
      deleteTodoById(todo.id);

      toast.add({
        title: MESSAGES.toast.deleted,
        description: todo.name,
        type: "success",
      });
    },
    [deleteTodoById],
  );

  const handleUpdate = useCallback(
    (todo: Todo) => {
      updateTodo(todo);

      toast.add({
        title: MESSAGES.toast.updated,
        description: todo.name,
        type: "success",
      });
    },
    [updateTodo],
  );

  const handleReset = useCallback(() => {
    resetTodos();
    setIsEditing(false);

    toast.add({
      title: MESSAGES.toast.reset,
      type: "success",
    });
  }, [resetTodos]);

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

      const reordered = reorderTodos(todos, startIndex, endIndex);

      updateTodos(reordered);

      toast.add({
        title: MESSAGES.toast.reordered,
        type: "success",
      });
    },
    [isLoaded, todos, updateTodos],
  );

  const handleImport = useCallback(
    (data: string) => {
      try {
        importTodoStorage(data);

        toast.add({
          title: MESSAGES.toast.imported,
          type: "success",
        });

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
    if (!selectedCategory) return;

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
      if (!trimmedName) return;

      const currentCategory = categories.find(
        (item) => item.id === category.id,
      );

      if (!currentCategory) return;

      updateCategory({
        ...currentCategory,
        name: trimmedName,
      });

      toast.add({
        title: MESSAGES.toast.categoryUpdated,
        description: trimmedName,
        type: "success",
      });
    },
    [categories, updateCategory],
  );

  const isDefaultCategorySelected = activeCategoryId === DEFAULT_CATEGORY_ID;

  const handleDeleteCategory = useCallback(() => {
    if (!categoryToDelete) return;
    const categoryId = categoryToDelete.id;

    // デフォルトカテゴリは削除できない
    if (categoryId === DEFAULT_CATEGORY_ID) {
      toast.add({
        title: MESSAGES.toast.error,
        description: "デフォルトカテゴリは削除できません",
        type: "error",
      });
      setCategoryToDelete(null);
      return;
    }

    // 削除されたカテゴリに属する Todo をデフォルトカテゴリに移行
    const migratedTodos = todos.map((todo) =>
      todo.categoryId === categoryId
        ? { ...todo, categoryId: DEFAULT_CATEGORY_ID }
        : todo,
    );

    updateTodos(migratedTodos);

    // カテゴリを削除
    deleteCategoryById(categoryId);

    // 削除されたカテゴリが選択中だった場合、デフォルトカテゴリに切り替え
    if (activeCategoryId === categoryId) {
      setActiveCategoryId(DEFAULT_CATEGORY_ID);
    }

    toast.add({
      title: MESSAGES.toast.categoryDeleted,
      description: categoryToDelete.name,
      type: "success",
    });

    setCategoryToDelete(null);
  }, [categoryToDelete, todos, updateTodos, activeCategoryId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="not-prose flex w-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          {isLoaded && (
            <CategoryList
              categories={categories}
              activeCategoryId={activeCategoryId}
              onSelect={setActiveCategoryId}
              onCreate={() =>
                setCategoryDialog({ mode: "create", category: null })
              }
            />
          )}
        </div>

        <TodoForm onSubmit={handleCreate} isEditing={isEditing} />

        <TodoList
          todos={visibleTodos}
          isLoaded={isLoaded}
          isEditing={isEditing}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onReorder={handleReorder}
        />

        <TodoAppFooter
          isEditing={isEditing}
          appStorage={appStorage}
          onReset={handleReset}
          onImport={handleImport}
          onOpenCategorySettings={handleOpenCategoryEditDialog}
          onToggleEditing={() => setIsEditing((prev) => !prev)}
        />
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
        onDelete={(selectedCategory) => {
          setCategoryToDelete(selectedCategory);
          setCategoryDialog(null);
        }}
      />

      <CategoryDeleteDialog
        open={!!categoryToDelete}
        category={categoryToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
}
