import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { ComponentProps } from "react";

type TodoToggleProps = {
  completed: boolean;
} & Omit<ComponentProps<typeof Toggle>, "pressed">;

export function TodoToggle({ completed, className, ...rest }: TodoToggleProps) {
  return (
    <Toggle
      pressed={completed}
      variant="outline"
      className={cn(
        "aria-pressed:bg-primary group size-9 cursor-pointer rounded-full transition-colors",
        className,
      )}
      {...rest}
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
