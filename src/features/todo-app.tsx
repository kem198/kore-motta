"use client";

import { CategoryDeleteDialog } from "@/components/shared/dialog/category-delete-dialog";
import { CategorySettingDialog } from "@/components/shared/dialog/category-setting-dialog";
import { ConfirmDialog } from "@/components/shared/dialog/confirm-dialog";
import { ExportDialog } from "@/components/shared/dialog/export-dialog";
import { ImportDialog } from "@/components/shared/dialog/import-dialog";
import { TodoForm } from "@/components/shared/todo-form";
import { TodoList } from "@/components/shared/todo-list";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
} from "@/constants/categories";
import { MESSAGES } from "@/constants/messages";
import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";
import { TODO_STORAGE_KEY, useTodos } from "@/hooks/use-todos";
import { TodoFormValues } from "@/schemas/todo-form-schema";
import { Category } from "@/types/category";
import { Todo } from "@/types/todo";
import {
  AlertCircleIcon,
  DownloadIcon,
  FolderPenIcon,
  PencilIcon,
  PlusIcon,
  UploadIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function TodoApp() {
  const {
    todos,
    isLoaded,
    addTodo,
    updateTodo,
    updateTodos,
    deleteTodoById,
    resetTodos,
    importTodoStorage,
  } = useTodos();

  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      if (typeof window === "undefined") return DEFAULT_CATEGORIES_STORAGE;
      const raw = window.localStorage.getItem(TODO_STORAGE_KEY);
      if (!raw) return DEFAULT_CATEGORIES_STORAGE;

      const parsed = JSON.parse(raw) as { categories?: unknown };
      const value = parsed.categories;
      if (!Array.isArray(value)) {
        return DEFAULT_CATEGORIES_STORAGE;
      }
      return value as Category[];
    } catch {
      return DEFAULT_CATEGORIES_STORAGE;
    }
  });

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

  // 初回ロード時にストレージに categories がなければ初期値を保存する
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const raw = window.localStorage.getItem(TODO_STORAGE_KEY);
      if (!raw) {
        const initialStorage = {
          version: CURRENT_TODO_STORAGE_VERSION,
          todos: [],
          categories: DEFAULT_CATEGORIES_STORAGE,
        };
        window.localStorage.setItem(
          TODO_STORAGE_KEY,
          JSON.stringify(initialStorage),
        );
        return;
      }

      const parsed = JSON.parse(raw);
      if (!parsed.categories || Object.keys(parsed.categories).length === 0) {
        const nextStorage = {
          ...parsed,
          version: CURRENT_TODO_STORAGE_VERSION,
          categories: DEFAULT_CATEGORIES_STORAGE,
        };
        window.localStorage.setItem(
          TODO_STORAGE_KEY,
          JSON.stringify(nextStorage),
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const handleCreateCategory = useCallback((name: string) => {
    const id = crypto.randomUUID();

    const newCategory: Category = {
      id,
      name,
      resetTime: "00:00",
    };

    setCategories((prev) => {
      const next = [...prev, newCategory];

      try {
        const raw = window.localStorage.getItem(TODO_STORAGE_KEY);
        const currentStorage = raw ? JSON.parse(raw) : {};

        currentStorage.categories = next;

        window.localStorage.setItem(
          TODO_STORAGE_KEY,
          JSON.stringify(currentStorage),
        );
      } catch {
        // ignore
      }

      return next;
    });

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

      setCategories((prev) => {
        const currentCategory = prev.find((item) => item.id === category.id);

        if (!currentCategory) return prev;

        const next = prev.map((item) =>
          item.id === category.id
            ? {
                ...item,
                name: trimmedName,
              }
            : item,
        );

        try {
          const raw = window.localStorage.getItem(TODO_STORAGE_KEY);
          const currentStorage = raw ? JSON.parse(raw) : {};

          currentStorage.categories = next;

          window.localStorage.setItem(
            TODO_STORAGE_KEY,
            JSON.stringify(currentStorage),
          );
        } catch {
          // ignore
        }

        return next;
      });

      toast.add({
        title: MESSAGES.toast.categoryUpdated,
        description: trimmedName,
        type: "success",
      });
    },
    [],
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
    setCategories((prev) => {
      const next = prev.filter((category) => category.id !== categoryId);

      try {
        const raw = window.localStorage.getItem(TODO_STORAGE_KEY);
        const currentStorage = raw ? JSON.parse(raw) : {};
        currentStorage.categories = next;
        window.localStorage.setItem(
          TODO_STORAGE_KEY,
          JSON.stringify(currentStorage),
        );
      } catch {
        // ignore
      }

      return next;
    });

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
            <div
              className="flex flex-wrap gap-2"
              aria-label={MESSAGES.labels.categoryList}
            >
              {categories.map((category) => {
                const isSelected = category.id === activeCategoryId;

                return (
                  <Button
                    key={category.id}
                    type="button"
                    variant={isSelected ? "default" : "secondary"}
                    size="sm"
                    aria-label={category.name}
                    aria-pressed={isSelected}
                    onClick={() => setActiveCategoryId(category.id)}
                  >
                    {category.name}
                  </Button>
                );
              })}

              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label={MESSAGES.actions.createCategory}
                onClick={() =>
                  setCategoryDialog({ mode: "create", category: null })
                }
                className="border-border/60 bg-background rounded-full border"
              >
                <PlusIcon />
              </Button>
            </div>
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

        <div className="bg-background/70 sticky bottom-0 z-50 flex justify-between gap-2 border-t py-4">
          <div className="flex gap-2">
            {isEditing && (
              <>
                <ConfirmDialog
                  title={MESSAGES.dialogs.reset.title}
                  description={MESSAGES.dialogs.reset.description}
                  content={
                    <Alert variant="destructive">
                      <AlertCircleIcon size={16} />
                      <AlertTitle>{MESSAGES.warnings.overwrite}</AlertTitle>
                    </Alert>
                  }
                  confirmButtonLabel={MESSAGES.actions.reset}
                  confirmButtonVariant="destructive"
                  onConfirm={handleReset}
                  className="w-fit"
                >
                  <Button
                    variant="destructive"
                    aria-label={MESSAGES.actions.reset}
                  >
                    {MESSAGES.actions.reset}
                  </Button>
                </ConfirmDialog>

                <ExportDialog
                  todoStorage={{
                    version: CURRENT_TODO_STORAGE_VERSION,
                    todos,
                    categories,
                  }}
                  className="w-fit"
                >
                  <Button
                    variant="secondary"
                    aria-label={MESSAGES.actions.export}
                    className="inline-flex items-center gap-2"
                  >
                    <UploadIcon className="sm:hidden" />
                    <span className="hidden sm:inline">
                      {MESSAGES.actions.export}
                    </span>
                  </Button>
                </ExportDialog>

                <ImportDialog onImport={handleImport}>
                  <Button
                    variant="secondary"
                    aria-label={MESSAGES.actions.import}
                    className="inline-flex items-center gap-2"
                  >
                    <DownloadIcon className="sm:hidden" />
                    <span className="hidden sm:inline">
                      {MESSAGES.actions.import}
                    </span>
                  </Button>
                </ImportDialog>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              aria-label="カテゴリ設定"
              onClick={handleOpenCategoryEditDialog}
              className="inline-flex items-center gap-2"
            >
              <FolderPenIcon />
              <span>カテゴリ設定</span>
            </Button>

            <Button
              variant={isEditing ? "default" : "secondary"}
              onClick={() => setIsEditing((prev) => !prev)}
              aria-label={
                isEditing
                  ? MESSAGES.actions.done
                  : `${MESSAGES.actions.editStart}`
              }
            >
              <PencilIcon />
              {isEditing ? MESSAGES.actions.done : MESSAGES.actions.edit}
            </Button>
          </div>
        </div>
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
