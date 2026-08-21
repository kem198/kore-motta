import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="flex flex-col gap-2">
      <main className="max-w-2xl p-8">
        <section data-testid="todo">
          <TodoApp />
        </section>
      </main>
    </div>
  );
}
