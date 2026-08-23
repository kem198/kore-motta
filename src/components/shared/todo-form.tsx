"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MESSAGES } from "@/constants/messages";
import { TodoFormValues, todoFormSchema } from "@/schemas/todo-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

type TodoFormProps = {
  onSubmit: (values: TodoFormValues) => void;
} & Omit<React.ComponentProps<"form">, "onSubmit">;

export function TodoForm({ onSubmit, ...props }: TodoFormProps) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    mode: "onChange",
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
    <form id="todoadd" onSubmit={form.handleSubmit(handleSubmit)} {...props}>
      <div className="flex items-end gap-2">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <Input
                {...field}
                id="todoname"
                aria-invalid={fieldState.invalid}
                placeholder={MESSAGES.placeholders.newItem}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <Button type="submit" form="todoadd" disabled={!form.formState.isValid}>
          <PlusIcon />
          {MESSAGES.actions.add}
        </Button>
      </div>
    </form>
  );
}
