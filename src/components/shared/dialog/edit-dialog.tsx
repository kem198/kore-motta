"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundCheck } from "lucide-react";
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import { MESSAGES } from "@/constants/messages";
import { TodoFormValues, todoFormSchema } from "@/schemas/todo-form-schema";
import { Todo } from "@/types/todo";

type EditDialogProps = {
  todo: Todo;
  onSave: (updated: Todo) => void;
  children: ReactNode;
} & ComponentProps<typeof DialogTrigger>;

export function EditDialog({
  todo: todo,
  onSave,
  children,
  ...props
}: EditDialogProps) {
  const [open, setOpen] = useState(false);

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
  }, [todo, form]);

  useEffect(() => {
    if (!open) {
      return;
    }

    resetFormValues();
  }, [open, resetFormValues]);

  const handleSubmit = (data: TodoFormValues) => {
    const updatedTodo: Todo = {
      ...todo,
      name: data.name.trim(),
      memo: data.memo?.trim() || undefined,
    };

    onSave(updatedTodo);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
