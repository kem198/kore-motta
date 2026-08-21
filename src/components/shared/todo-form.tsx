"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MESSAGES } from "@/constants/messages";
import { TodoFormValues, todoFormSchema } from "@/schemas/todo-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

type TodoFormProps = {
  onSubmit: (values: TodoFormValues) => void;
  isEditing: boolean;
};

export function TodoForm({ onSubmit, isEditing }: TodoFormProps) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      name: "",
      memo: "",
    },
  });

  const handleSubmit = (values: TodoFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <form id="todoadd" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="flex gap-2">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                id="todoname"
                aria-invalid={fieldState.invalid}
                placeholder={MESSAGES.placeholders.newItem}
                autoComplete="off"
                disabled={isEditing}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" form="todoadd" disabled={isEditing}>
          <UserRoundPlus />
          {MESSAGES.actions.add}
        </Button>
      </div>
    </form>
  );
}
