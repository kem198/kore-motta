import { TodoForm } from "@/components/shared/todo-form";
import { TodoFormValues } from "@/schemas/todo-form-schema";

type TodoFormFooterProps = {
  isEditing: boolean;
  onSubmit: (values: TodoFormValues) => void;
};

export function TodoFormFooter({ isEditing, onSubmit }: TodoFormFooterProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="bg-background mx-auto w-full max-w-2xl border-t px-8 py-4">
        <TodoForm onSubmit={onSubmit} isEditing={isEditing} />
      </div>
    </div>
  );
}
