"use client";

import { Required } from "@/components/shared/required";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGES } from "@/constants/messages";
import { Category } from "@/schemas/category-schema";
import { TodoFormValues, todoFormSchema } from "@/schemas/todo-form-schema";
import { Todo } from "@/schemas/todo-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ComponentProps, ReactElement, ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type TodoEditDialogProps = {
  todo: Todo;
  categories: Category[];
  onSave: (updated: Todo) => void;
  children: ReactNode;
} & ComponentProps<typeof DialogTrigger>;

export function TodoEditDialog({
  todo,
  categories,
  onSave,
  children,
  ...props
}: TodoEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(todo.categoryId);

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      name: "",
      memo: "",
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      form.reset({
        name: todo.name,
        memo: todo.memo,
      });
      setCategoryId(todo.categoryId);
    }
  };

  const handleSubmit = (data: TodoFormValues) => {
    const updatedTodo: Todo = {
      ...todo,
      name: data.name.trim(),
      memo: data.memo?.trim() || undefined,
      completed: todo.completed,
      categoryId,
    };

    onSave(updatedTodo);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} {...props}>
      <DialogTrigger render={children as ReactElement} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{MESSAGES.dialogs.editItem}</DialogTitle>

          <DialogDescription>
            <Required /> {MESSAGES.validation.requiredNote}
          </DialogDescription>
        </DialogHeader>

        <form id="todo-edit" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field orientation="horizontal">
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="todo-category">カテゴリ:</FieldLabel>

                  <Select
                    id="todo-category"
                    items={categories.map((category) => ({
                      label: category.name,
                      value: category.id,
                    }))}
                    value={categoryId}
                    onValueChange={(value) => {
                      if (value) {
                        setCategoryId(value);
                      }
                    }}
                  >
                    <SelectTrigger aria-label="カテゴリ">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
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
                  <Field data-invalid={fieldState.invalid}>
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
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                {MESSAGES.actions.cancel}
              </Button>
            }
          />

          <Button type="submit" form="todo-edit">
            {MESSAGES.actions.update}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
