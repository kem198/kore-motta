import { ConfirmDialog } from "@/components/shared/dialog/confirm-dialog";
import { EditDialog } from "@/components/shared/dialog/edit-dialog";
import { TodoToggle } from "@/components/shared/todo-toggle";
import { Alert, AlertTitle } from "@/components/ui/alert";
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
import {
  AlertCircleIcon,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { Fragment } from "react";

function TodoListSkeleton() {
  return (
    <Item className="px-0">
      <ItemMedia>
        <Skeleton className="relative flex aspect-square h-10 w-10 shrink-0 overflow-hidden rounded-full" />
      </ItemMedia>

      <ItemContent className="flex flex-col gap-1">
        <Skeleton className="h-4 max-w-[10rem] rounded-full" />
        <Skeleton className="h-4 max-w-[16rem] rounded-full" />
      </ItemContent>
    </Item>
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
        {/* <Avatar>
          <AvatarImage className="grayscale" />
          <AvatarFallback>{todo.name.charAt(0)}</AvatarFallback>
        </Avatar> */}
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="flex flex-col items-start gap-0">
          {todo.name}
        </ItemTitle>

        {todo.memo ? <ItemDescription>{todo.memo}</ItemDescription> : null}
      </ItemContent>

      <ItemActions className="flex w-full items-center justify-end gap-2 md:w-auto">
        {isEditing && (
          <>
            <ConfirmDialog
              title={MESSAGES.dialogs.deleteItem.title}
              description={MESSAGES.dialogs.deleteItem.description}
              content={
                <>
                  <p>
                    アイテム: <span className="font-semibold">{todo.name}</span>
                  </p>
                  <Alert variant="destructive">
                    <AlertCircleIcon size={16} />
                    <AlertTitle>{MESSAGES.warnings.irreversible}</AlertTitle>
                  </Alert>
                </>
              }
              confirmButtonLabel={MESSAGES.actions.delete}
              confirmButtonVariant="destructive"
              onConfirm={() => onDelete(todo)}
            >
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full"
                aria-label={`${MESSAGES.actions.delete}: ${todo.name}`}
              >
                <Trash2 />
              </Button>
            </ConfirmDialog>

            <ButtonGroup>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                onClick={() => onReorder(index, index - 1)}
                disabled={index === 0}
                aria-label={`${MESSAGES.aria.moveUp}: ${todo.name}`}
              >
                <ChevronUp />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                onClick={() => onReorder(index, index + 1)}
                disabled={index === length - 1}
                aria-label={`${MESSAGES.aria.moveDown}: ${todo.name}`}
              >
                <ChevronDown />
              </Button>

              <EditDialog todo={todo} onSave={onUpdate}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                  aria-label={`${MESSAGES.actions.edit}: ${todo.name}`}
                >
                  <Pencil />
                </Button>
              </EditDialog>
            </ButtonGroup>
          </>
        )}

        {!isEditing && (
          <EditDialog todo={todo} onSave={onUpdate}>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              aria-label={`${MESSAGES.actions.edit}: ${todo.name}`}
            >
              <Pencil />
            </Button>
          </EditDialog>
        )}
      </ItemActions>
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

export function TodoList({
  todos,
  isLoaded,
  isEditing,
  onDelete,
  onUpdate,
  onReorder,
}: TodoListProps) {
  if (!isLoaded) {
    return (
      <ItemGroup>
        <TodoListSkeleton />
        <TodoListSkeleton />
        <TodoListSkeleton />
      </ItemGroup>
    );
  }

  if (todos.length === 0) {
    return <ItemGroup />;
  }

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
