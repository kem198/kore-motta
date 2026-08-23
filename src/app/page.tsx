import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="md:bg-muted min-h-screen">
      <main className="bg-background mx-auto min-h-screen w-full max-w-2xl p-8">
        <section data-testid="todo">
          <TodoApp />
        </section>
      </main>
    </div>
  );
}
