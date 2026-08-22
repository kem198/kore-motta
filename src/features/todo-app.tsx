"use client";

import { ConfirmDialog } from "@/components/shared/dialog/confirm-dialog";
import { ExportDialog } from "@/components/shared/dialog/export-dialog";
import { ImportDialog } from "@/components/shared/dialog/import-dialog";
import { TodoForm } from "@/components/shared/todo-form";
import { TodoList } from "@/components/shared/todo-list";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  DEFAULT_CATEGORIES_STORAGE,
  DEFAULT_CATEGORY_ID,
} from "@/constants/categories";
import { MESSAGES } from "@/constants/messages";
import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";
import { TODO_STORAGE_KEY, useTodos } from "@/hooks/use-todos";
import { TodoFormValues } from "@/schemas/todo-form-schema";
import { Todo } from "@/types/todo";
import {
  AlertCircleIcon,
  DownloadIcon,
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
  const [categories, setCategories] = useState<
    Record<string, { name: string }>
  >(() => {
    try {
      if (typeof window === "undefined") return DEFAULT_CATEGORIES_STORAGE;
      const raw = window.localStorage.getItem(TODO_STORAGE_KEY);
      if (!raw) return DEFAULT_CATEGORIES_STORAGE;

      const parsed = JSON.parse(raw) as { categories?: unknown };
      const value = parsed.categories;
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return DEFAULT_CATEGORIES_STORAGE;
      }

      return value as Record<string, { name: string }>;
    } catch {
      return DEFAULT_CATEGORIES_STORAGE;
    }
  });

  const [categoryName, setCategoryName] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    () => DEFAULT_CATEGORY_ID,
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
  const handleAddCategory = useCallback(() => {
    const name = categoryName.trim();
    if (!name) return;

    const id = crypto.randomUUID();

    setCategories((prev) => {
      const next = { [id]: { name }, ...prev };
      try {
        const raw = window.localStorage.getItem(TODO_STORAGE_KEY);
        const currentStorage = raw
          ? JSON.parse(raw)
          : {
              version: CURRENT_TODO_STORAGE_VERSION,
              todos: [],
              categories: DEFAULT_CATEGORIES_STORAGE,
            };

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
    setCategoryName("");
    toast.add({
      title: "カテゴリを追加しました",
      description: name,
      type: "success",
    });
  }, [categoryName]);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="not-prose flex w-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-1">
              <Input
                aria-label="カテゴリ名"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="出かける前"
              />
            </label>

            <Button
              type="button"
              onClick={handleAddCategory}
              disabled={!categoryName.trim()}
            >
              <PlusIcon />
              カテゴリ作成
            </Button>
          </div>

          {isLoaded && (
            <div className="flex flex-wrap gap-2" aria-label="カテゴリ一覧">
              {Object.entries(categories).map(([id, c]) => {
                const isSelected = id === activeCategoryId;

                return (
                  <Button
                    key={id}
                    type="button"
                    variant={isSelected ? "default" : "secondary"}
                    size="sm"
                    aria-label={c.name}
                    aria-pressed={isSelected}
                    onClick={() => setActiveCategoryId(id)}
                    className={
                      isSelected
                        ? "rounded-full"
                        : "border-border/60 bg-background rounded-full border"
                    }
                  >
                    {c.name}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <TodoForm onSubmit={handleCreate} isEditing={isEditing} />

        <TodoList
          todos={todos}
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

          <Button
            variant={isEditing ? "default" : "secondary"}
            onClick={() => setIsEditing((prev) => !prev)}
            aria-label={
              isEditing ? MESSAGES.actions.done : `${MESSAGES.actions.edit}開始`
            }
          >
            <PencilIcon />
            {isEditing ? MESSAGES.actions.done : MESSAGES.actions.edit}
          </Button>
        </div>
      </div>
    </div>
  );
}
