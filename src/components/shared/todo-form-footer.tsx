import { TodoForm } from "@/components/shared/todo-form";
import { cn } from "@/lib/utils";
import { TodoFormValues } from "@/schemas/todo-form-schema";

type TodoFormFooterProps = {
  onSubmit: (values: TodoFormValues) => void;
  className?: string;
};

export function TodoFormFooter({ onSubmit, className }: TodoFormFooterProps) {
  return (
    <footer
      className={cn(
        'bg-background pb-[calc(1rem+env(safe-area-inset-bottom))]" mx-auto w-full max-w-3xl border-t p-4',
        className,
      )}
    >
      <TodoForm onSubmit={onSubmit} />
    </footer>
  );
}
