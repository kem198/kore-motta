import { TodoApp } from "@/features/todo-app";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="bg-muted relative h-dvh">
      <div
        className={cn(
          "bg-primary wco-titlebar-height absolute inset-x-0 top-0",
          // PWA のタイトルバーをドラッグ可能にする場合
          "wco-drag",
        )}
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
