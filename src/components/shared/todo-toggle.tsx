import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { ComponentProps } from "react";

type TodoToggleProps = {
  completed: boolean;
} & Omit<ComponentProps<typeof Toggle>, "pressed" | "onPressedChange">;

export function TodoToggle({ completed, className, ...rest }: TodoToggleProps) {
  return (
    <Toggle
      pressed={completed}
      variant="outline"
      className={cn(
        "aria-pressed:bg-primary pointer-events-none size-9 rounded-full transition-colors",
        className,
      )}
      {...rest}
      tabIndex={-1}
      aria-hidden="true"
    >
      <CheckIcon
        className={cn(
          "transition-opacity",
          completed
            ? "text-primary-foreground opacity-100"
            : "text-muted-foreground opacity-0 group-hover:opacity-75",
        )}
      />
    </Toggle>
  );
}
