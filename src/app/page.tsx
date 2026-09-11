import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="bg-muted" data-testid="todo">
      <TodoApp />
    </div>
  );
}
