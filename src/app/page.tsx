import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="md:bg-muted min-h-screen">
      <main
        className="bg-background mx-auto min-h-screen w-full max-w-2xl"
        data-testid="todo"
      >
        <TodoApp />
      </main>
    </div>
  );
}
