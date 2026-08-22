"use client";

import { Required } from "@/components/shared/required";
import { TodoToggle } from "@/components/shared/todo-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_CATEGORY_NAME } from "@/constants/categories";
import { MESSAGES } from "@/constants/messages";
import { TODO_STORAGE_KEY } from "@/hooks/use-todos";
import { TodoFormValues, todoFormSchema } from "@/schemas/todo-form-schema";
import { Todo } from "@/types/todo";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundCheck } from "lucide-react";
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  useCallback,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";

type EditDialogProps = {
  todo: Todo;
  onSave: (updated: Todo) => void;
  children: ReactNode;
} & ComponentProps<typeof DialogTrigger>;

export function EditDialog({
  todo,
  onSave,
  children,
  ...props
}: EditDialogProps) {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState(todo.completed);
  const [categoryName, setCategoryName] = useState(DEFAULT_CATEGORY_NAME);

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      name: "",
      memo: "",
    },
  });

  const resetFormValues = useCallback(() => {
    form.reset({
      name: todo.name,
      memo: todo.memo,
    });
    setCompleted(todo.completed);
  }, [todo, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      try {
        const raw = window.localStorage.getItem(TODO_STORAGE_KEY);
        if (!raw) {
          setCategoryName(DEFAULT_CATEGORY_NAME);
        } else {
          const parsed = JSON.parse(raw) as {
            categories?: Record<string, { name?: string }>;
          };
          const resolvedCategoryName =
            parsed.categories?.[todo.categoryId]?.name ?? DEFAULT_CATEGORY_NAME;
          setCategoryName(resolvedCategoryName);
        }
      } catch {
        setCategoryName(DEFAULT_CATEGORY_NAME);
      }

      resetFormValues();
    }
  };

  const handleSubmit = (data: TodoFormValues) => {
    const updatedTodo: Todo = {
      ...todo,
      name: data.name.trim(),
      memo: data.memo?.trim() || undefined,
      completed,
    };

    onSave(updatedTodo);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children as ReactElement} {...props} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{MESSAGES.dialogs.editItem}</DialogTitle>
          <DialogDescription>
            <>
              <Required /> {MESSAGES.validation.requiredNote}
            </>
          </DialogDescription>
        </DialogHeader>

        <form id="todo-edit" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <FieldSet>
              <Field>
                {/* TODO: ボタンの見た目を整える */}
                <TodoToggle
                  todo={{ ...todo, completed }}
                  onChange={(updated) => setCompleted(updated.completed)}
                  aria-label={`${todo.name} の完了状態`}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="todo-category-name">カテゴリ</FieldLabel>
                カテゴリ: {categoryName}
              </Field>

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="todo-name-edit">
                      {MESSAGES.labels.title}
                      <Required />
                    </FieldLabel>
                    <Input
                      {...field}
                      id="todo-name-edit"
                      aria-invalid={fieldState.invalid}
                      placeholder={MESSAGES.placeholders.title}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="memo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="todo-memo">
                      {MESSAGES.labels.memo}
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="todo-memo"
                      placeholder={MESSAGES.placeholders.memo}
                      rows={4}
                      className="resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldSet>
          </FieldGroup>
        </form>

        <DialogFooter className="gap-y-2">
          <DialogClose
            render={
              <Button type="button" variant="outline">
                {MESSAGES.actions.cancel}
              </Button>
            }
          />
          <Button type="submit" form="todo-edit">
            <UserRoundCheck />
            {MESSAGES.actions.update}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
