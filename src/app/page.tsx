import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="flex flex-col gap-2">
      <main className="w-full p-8">
        <section data-testid="todo" className="mx-auto w-full max-w-2xl">
          <TodoApp />
        </section>
      </main>
    </div>
  );
}
