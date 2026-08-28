import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="relative h-dvh bg-gray-200">
      <main
        className="bg-background mx-auto h-full w-full max-w-3xl"
        data-testid="todo"
      >
        <TodoApp />
      </main>
    </div>
  );
}
