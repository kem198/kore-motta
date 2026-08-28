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
import { cn } from "@/lib/utils";
import { Category } from "@/schemas/category-schema";
import { Todo } from "@/schemas/todo-schema";
import { ChevronDown, ChevronUp, PencilIcon, Trash2 } from "lucide-react";
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
  categories: Category[];
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
  categories,
  length,
  isEditing,
  onDelete,
  onUpdate,
  onReorder,
}: TodoItemProps) {
  const handleToggle = () => {
    onUpdate({
      ...todo,
      completed: !todo.completed,
    });
  };

  return (
    <div
      role="listitem"
      aria-label={`Todo: ${todo.name}`}
      className="flex w-full items-center gap-2"
    >
      <TodoToggle
        completed={todo.completed}
        aria-label={`完了状態を切り替え: ${todo.name}`}
        onPressedChange={handleToggle}
      />

      <TodoEditDialog todo={todo} categories={categories} onSave={onUpdate}>
        <button
          type="button"
          className="group flex min-w-0 flex-1 cursor-pointer flex-col justify-center gap-1 self-stretch rounded-md border border-transparent text-left text-sm transition-colors duration-100 hover:bg-accent"
          aria-label={`編集: ${todo.name}`}
        >
          <span className="line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium wrap-break-word">
            {todo.name}
          </span>

          {todo.memo ? (
            <span className="text-muted-foreground group-hover:text-accent-foreground line-clamp-2 text-left text-sm leading-normal font-normal wrap-break-word">
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
  categories: Category[];
  isEditing: boolean;
  onDelete: (todo: Todo) => void;
  onUpdate: (todo: Todo) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  className?: string;
};

function TodoListContent({
  todos,
  categories,
  isEditing,
  onDelete,
  onUpdate,
  onReorder,
  className,
}: TodoListContentProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div>{/* 上部の隙間用 */}</div>
      {todos.map((todo, index) => (
        <Fragment key={todo.id}>
          <TodoItem
            todo={todo}
            categories={categories}
            index={index}
            length={todos.length}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onReorder={onReorder}
          />

          {index !== todos.length - 1 && <Separator />}
        </Fragment>
      ))}
    </div>
  );
}

type TodoListProps = {
  todos: Todo[];
  categories: Category[];
  isLoaded: boolean;
  isEditing: boolean;
  onDelete: (todo: Todo) => void;
  onUpdate: (todo: Todo) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  className?: string;
};

export function TodoList({
  todos,
  categories,
  isLoaded,
  isEditing,
  onDelete,
  onUpdate,
  onReorder,
  className,
}: TodoListProps) {
  if (!isLoaded) {
    return (
      <div className={className}>
        <TodoListLoading />
      </div>
    );
  }

  return (
    <TodoListContent
      todos={todos}
      categories={categories}
      isEditing={isEditing}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onReorder={onReorder}
      className={className}
    />
  );
}
