import { TodoEditDialog } from "@/components/shared/dialog/todo-edit-dialog";
import { TodoToggle } from "@/components/shared/todo-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MESSAGES } from "@/constants/messages";
import { Todo } from "@/types/todo";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Fragment } from "react";

function TodoListSkeleton() {
  return (
    <div className="flex w-full items-center gap-3.5 rounded-md px-0 py-3.5 text-sm">
      <div className="flex shrink-0 items-center justify-center">
        <Skeleton className="relative flex aspect-square h-10 w-10 shrink-0 overflow-hidden rounded-full" />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-4 max-w-40" />
        <Skeleton className="h-4 max-w-[16rem]" />
      </div>
    </div>
  );
}

type TodoItemActionsProps = {
  todo: Todo;
  index: number;
  length: number;
  isEditing: boolean;
  onDelete: (todo: Todo) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
};

function TodoItemActions({
  todo,
  index,
  length,
  isEditing,
  onDelete,
  onReorder,
}: TodoItemActionsProps) {
  if (!isEditing) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center justify-end gap-2">
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="destructive"
              size="icon"
              aria-label={`${MESSAGES.actions.delete}: ${todo.name}`}
            />
          }
        >
          <Trash2 />
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {`アイテム「${todo.name}」を削除しますか？`}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{MESSAGES.actions.cancel}</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={() => onDelete(todo)}
            >
              {MESSAGES.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ButtonGroup>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onReorder(index, index - 1)}
          disabled={index === 0}
          aria-label={`${MESSAGES.aria.moveUp}: ${todo.name}`}
        >
          <ChevronUp />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={() => onReorder(index, index + 1)}
          disabled={index === length - 1}
          aria-label={`${MESSAGES.aria.moveDown}: ${todo.name}`}
        >
          <ChevronDown />
        </Button>
      </ButtonGroup>
    </div>
  );
}

type TodoItemProps = {
  todo: Todo;
  index: number;
  length: number;
  isEditing: boolean;
  onDelete: (todo: Todo) => void;
  onUpdate: (todo: Todo) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
};

function TodoItem({
  index,
  todo,
  length,
  isEditing,
  onDelete,
  onUpdate,
  onReorder,
}: TodoItemProps) {
  return (
    <div
      role="listitem"
      aria-label={`Todo: ${todo.name}`}
      className="flex w-full items-center gap-4 rounded-md border border-transparent text-sm transition-colors duration-100 outline-none"
    >
      <div className="flex shrink-0 items-center justify-center py-3.5">
        <TodoToggle aria-label="Toggle todo" todo={todo} onChange={onUpdate} />
      </div>

      <TodoEditDialog todo={todo} onSave={onUpdate}>
        <button
          type="button"
          aria-label={`編集: ${todo.name}`}
          className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center gap-1 self-stretch text-left outline-none"
        >
          <span className="line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4">
            {todo.name}
          </span>

          {todo.memo ? (
            <span className="text-muted-foreground line-clamp-2 text-left text-sm leading-normal font-normal">
              {todo.memo}
            </span>
          ) : null}
        </button>
      </TodoEditDialog>

      <TodoItemActions
        todo={todo}
        index={index}
        length={length}
        isEditing={isEditing}
        onDelete={onDelete}
        onReorder={onReorder}
      />
    </div>
  );
}

function TodoListLoading() {
  return (
    <div className="flex w-full flex-col gap-4">
      <TodoListSkeleton />
      <TodoListSkeleton />
      <TodoListSkeleton />
    </div>
  );
}

type TodoListContentProps = {
  todos: Todo[];
  isEditing: boolean;
  onDelete: (todo: Todo) => void;
  onUpdate: (todo: Todo) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
};

function TodoListContent({
  todos,
  isEditing,
  onDelete,
  onUpdate,
  onReorder,
}: TodoListContentProps) {
  return (
    <div className="flex w-full flex-col">
      {todos.map((todo, index) => (
        <Fragment key={todo.id}>
          <TodoItem
            todo={todo}
            index={index}
            length={todos.length}
            isEditing={isEditing}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onReorder={onReorder}
          />

          {index !== todos.length - 1 && <Separator className="my-2" />}
        </Fragment>
      ))}
    </div>
  );
}

type TodoListProps = {
  todos: Todo[];
  isLoaded: boolean;
  isEditing: boolean;
  onDelete: (todo: Todo) => void;
  onUpdate: (todo: Todo) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
};

export function TodoList({
  todos,
  isLoaded,
  isEditing,
  onDelete,
  onUpdate,
  onReorder,
}: TodoListProps) {
  if (!isLoaded) {
    return <TodoListLoading />;
  }

  if (todos.length === 0) {
    return <div />;
  }

  return (
    <TodoListContent
      todos={todos}
      isEditing={isEditing}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onReorder={onReorder}
    />
  );
}
