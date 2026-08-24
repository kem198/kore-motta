"use client";

import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { Todo } from "@/types/todo";
import { CheckIcon } from "lucide-react";
import { ComponentProps } from "react";

type TodoToggleProps = {
  todo: Todo;
  onChange?: (updated: Todo) => void;
} & Omit<ComponentProps<typeof Toggle>, "onChange">;

export function TodoToggle({
  todo,
  className,
  onChange,
  ...rest
}: TodoToggleProps) {
  const checked = todo.completed;

  const handleChange = (pressed: boolean) => {
    onChange?.({
      ...todo,
      completed: pressed,
    });
  };

  return (
    <Toggle
      pressed={checked}
      onPressedChange={handleChange}
      variant="outline"
      className={cn(
        "group aria-pressed:bg-primary size-9 cursor-pointer rounded-full",
        className,
      )}
      {...rest}
    >
      <CheckIcon
        className={cn(
          "transition-opacity",
          checked
            ? "text-primary-foreground opacity-100"
            : "text-muted-foreground opacity-0 group-hover:opacity-75",
        )}
      />
    </Toggle>
  );
}
