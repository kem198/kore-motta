import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="bg-muted h-dvh">
      <main
        className="bg-background mx-auto h-full w-full max-w-3xl"
        data-testid="todo"
      >
        <TodoApp />
      </main>
    </div>
  );
}
