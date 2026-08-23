import { TodoAppHeader } from "@/components/shared/todo-app-header";
import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="md:bg-muted min-h-screen">
      <TodoAppHeader />

      <main className="bg-background mx-auto min-h-screen w-full max-w-2xl">
        <section data-testid="todo" className="p-4">
          <TodoApp />
        </section>
      </main>
    </div>
  );
}
