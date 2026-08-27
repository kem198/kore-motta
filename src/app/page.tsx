import { TodoApp } from "@/features/todo-app";

export default function Home() {
  return (
    <div className="bg-muted relative h-dvh">
      <div
        className="bg-primary wco-drag wco-titlebar-height absolute inset-x-0 top-0"
        aria-hidden
      />

      <main
        className="bg-background wco-titlebar-padding mx-auto h-full w-full max-w-3xl"
        data-testid="todo"
      >
        <TodoApp />
      </main>
    </div>
  );
}
