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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { MESSAGES } from "@/constants/messages";
import { Todo } from "@/types/todo";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { Fragment } from "react";

function TodoListSkeleton() {
  return (
    <Item className="px-0">
      <ItemMedia>
        <Skeleton className="relative flex aspect-square h-10 w-10 shrink-0 overflow-hidden rounded-full" />
      </ItemMedia>

      <ItemContent className="flex flex-col gap-1">
        <Skeleton className="h-4 max-w-40" />
        <Skeleton className="h-4 max-w-[16rem]" />
      </ItemContent>
    </Item>
  );
}

type TodoItemActionsProps = {
  todo: Todo;
  index: number;
  length: number;
  isEditing: boolean;
  onDelete: (todo: Todo) => void;
  onUpdate: (todo: Todo) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
};

function TodoItemActions({
  todo,
  index,
  length,
  isEditing,
  onDelete,
  onUpdate,
  onReorder,
}: TodoItemActionsProps) {
  return (
    <ItemActions className="flex shrink-0 items-center justify-end gap-2">
      {isEditing && (
        <>
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
                  `アイテム「${todo.name}」を削除しますか？`
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
            <TodoEditDialog todo={todo} onSave={onUpdate}>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                aria-label={`${MESSAGES.actions.edit}: ${todo.name}`}
              >
                <Pencil />
              </Button>
            </TodoEditDialog>
          </ButtonGroup>
        </>
      )}
      {!isEditing && (
        <TodoEditDialog todo={todo} onSave={onUpdate}>
          <Button
            variant="secondary"
            size="icon"
            aria-label={`${MESSAGES.actions.edit}: ${todo.name}`}
          >
            <Pencil />
          </Button>
        </TodoEditDialog>
      )}
    </ItemActions>
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
    <Item className="justify-end px-0 md:flex-row">
      <ItemMedia>
        <TodoToggle aria-label="Toggle todo" todo={todo} onChange={onUpdate} />
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="flex flex-col items-start gap-0">
          {todo.name}
        </ItemTitle>

        {todo.memo ? <ItemDescription>{todo.memo}</ItemDescription> : null}
      </ItemContent>

      <TodoItemActions
        todo={todo}
        index={index}
        length={length}
        isEditing={isEditing}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onReorder={onReorder}
      />
    </Item>
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

function TodoListLoading() {
  return (
    <ItemGroup>
      <TodoListSkeleton />
      <TodoListSkeleton />
      <TodoListSkeleton />
    </ItemGroup>
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
    <ItemGroup>
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
          {index !== todos.length - 1 && <ItemSeparator />}
        </Fragment>
      ))}
    </ItemGroup>
  );
}

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
    return <ItemGroup />;
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
