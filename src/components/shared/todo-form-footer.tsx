import { TodoForm } from "@/components/shared/todo-form";
import { TodoFormValues } from "@/schemas/todo-form-schema";

type TodoFormFooterProps = {
  isEditing: boolean;
  onSubmit: (values: TodoFormValues) => void;
};

export function TodoFormFooter({ isEditing, onSubmit }: TodoFormFooterProps) {
  return (
    <div className="bg-background/70 fixed bottom-0 left-0 z-50 w-full border-t py-4">
      <div className="mx-auto w-full max-w-3xl px-4">
        <TodoForm onSubmit={onSubmit} isEditing={isEditing} />
      </div>
    </div>
  );
}
