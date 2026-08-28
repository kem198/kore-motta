import { TodoForm } from "@/components/shared/todo-form";
import { cn } from "@/lib/utils";
import { TodoFormValues } from "@/schemas/todo-form-schema";
import { ComponentPropsWithoutRef } from "react";

type TodoFormFooterProps = {
  onSubmit: (values: TodoFormValues) => void;
} & Omit<ComponentPropsWithoutRef<"footer">, "onSubmit">;

export function TodoFormFooter({
  onSubmit,
  className,
  ...props
}: TodoFormFooterProps) {
  return (
    <footer
      className={cn(
        "bg-background mx-auto w-full max-w-3xl border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    >
      <TodoForm onSubmit={onSubmit} />
    </footer>
  );
}
