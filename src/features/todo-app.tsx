"use client";

import { ConfirmDialog } from "@/components/shared/dialog/confirm-dialog";
import { ExportDialog } from "@/components/shared/dialog/export-dialog";
import { ImportDialog } from "@/components/shared/dialog/import-dialog";
import { TodoForm } from "@/components/shared/todo-form";
import { TodoList } from "@/components/shared/todo-list";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { MESSAGES } from "@/constants/messages";
import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";
import { useTodos } from "@/hooks/use-todos";
import { TodoFormValues } from "@/schemas/todo-form-schema";
import { Todo } from "@/types/todo";
import {
  AlertCircleIcon,
  DownloadIcon,
  PencilIcon,
  UploadIcon,
} from "lucide-react";
import { useCallback, useState } from "react";

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
        completed: false,
      };

      addTodo(newTodo);

      toast.add({
        title: MESSAGES.toast.created,
        description: trimmedName,
        type: "success",
      });
    },
    [addTodo],
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
