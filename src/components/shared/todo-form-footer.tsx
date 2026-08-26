import { TodoForm } from "@/components/shared/todo-form";
import { TodoFormValues } from "@/schemas/todo-form-schema";

type TodoFormFooterProps = {
  onSubmit: (values: TodoFormValues) => void;
};

export function TodoFormFooter({ onSubmit }: TodoFormFooterProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="bg-background mx-auto w-full max-w-3xl border-t p-4">
        <TodoForm onSubmit={onSubmit} />
      </div>
    </div>
  );
}
