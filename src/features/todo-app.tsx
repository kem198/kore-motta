"use client";

import { ConfirmDialog } from "@/components/shared/dialog/confirm-dialog";
import { ExportDialog } from "@/components/shared/dialog/export-dialog";
import { ImportDialog } from "@/components/shared/dialog/import-dialog";
import { TodoForm } from "@/components/shared/todo-form";
import { TodoList } from "@/components/shared/todo-list";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { sampleTodos } from "@/constants/sample";
import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";
import { useTodos } from "@/hooks/use-todos";
import { TodoFormValues } from "@/schemas/todo-form-schema";
import { Todo } from "@/types/todo";
import {
  AlertCircleIcon,
  DownloadIcon,
  UploadIcon,
  UserPen,
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
      };

      addTodo(newTodo);

      toast.add({
        title: "Todo を登録しました",
        description: "登録しました",
        type: "success",
      });
    },
    [addTodo],
  );

  const handleDelete = useCallback(
    (todo: Todo) => {
      deleteTodoById(todo.id);

      toast.add({
        title: "Todo を削除しました",
        description: "削除しました",
        type: "success",
      });
    },
    [deleteTodoById],
  );

  const handleUpdate = useCallback(
    (todo: Todo) => {
      updateTodo(todo);

      toast.add({
        title: "Todo を更新しました",
        description: "更新しました",
        type: "success",
      });
    },
    [updateTodo],
  );

  const handleReset = useCallback(() => {
    resetTodos();
    localStorage.removeItem("todoSampleInitialized");
    setIsEditing(false);

    toast.add({
      title: "登録内容を初期化しました",
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
        title: "並び順を更新しました",
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
          title: "Todo をインポートしました",
          type: "success",
        });

        return true;
      } catch {
        toast.add({
          title: "Todo 情報の形式が不正なため、インポートを中止しました。",
          type: "error",
        });

        return false;
      }
    },
    [importTodoStorage],
  );

  // サンプルデータ投入
  useEffect(() => {
    const hasInitialized = localStorage.getItem("todoSampleInitialized");

    if (!hasInitialized && isLoaded && todos.length === 0) {
      const sortedSamples = [...sampleTodos]
        .sort((a, b) => a.order - b.order)
        .reverse();

      sortedSamples.forEach(addTodo);

      // 初期化しない限りサンプルデータが投入されないようにする
      localStorage.setItem("todoSampleInitialized", "true");
    }
  }, [isLoaded, todos, addTodo]);

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
                  title="登録内容の初期化"
                  description="登録内容を初期状態に戻します。"
                  content={
                    <Alert variant="destructive">
                      <AlertCircleIcon size={16} />
                      <AlertTitle>この操作は元に戻せません。</AlertTitle>
                    </Alert>
                  }
                  confirmButtonLabel="初期化"
                  confirmButtonVariant="destructive"
                  onConfirm={handleReset}
                  className="w-fit"
                >
                  <Button variant="destructive" aria-label="初期化">
                    初期化
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
                    aria-label="エクスポート"
                    className="inline-flex items-center gap-2"
                  >
                    <UploadIcon className="sm:hidden" />
                    <span className="hidden sm:inline">エクスポート</span>
                  </Button>
                </ExportDialog>

                <ImportDialog onImport={handleImport}>
                  <Button
                    variant="secondary"
                    aria-label="インポート"
                    className="inline-flex items-center gap-2"
                  >
                    <DownloadIcon className="sm:hidden" />
                    <span className="hidden sm:inline">インポート</span>
                  </Button>
                </ImportDialog>
              </>
            )}
          </div>

          <Button
            variant={isEditing ? "default" : "secondary"}
            onClick={() => setIsEditing((prev) => !prev)}
            aria-label={isEditing ? "編集完了" : "編集開始"}
          >
            <UserPen />
            {isEditing ? "完了" : "編集"}
          </Button>
        </div>
      </div>
    </div>
  );
}
