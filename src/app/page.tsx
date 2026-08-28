import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="bg-gray-200" data-testid="todo">
      <TodoApp />
    </div>
  );
}
