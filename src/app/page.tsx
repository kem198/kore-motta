import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="flex flex-col gap-2">
      {/* TODO: 表示崩れするので prose-pre:whitespace-pre-wrap を指定している */}
      <main className="max-w-2xl p-8">
        <TodoApp />
      </main>
    </div>
  );
}
