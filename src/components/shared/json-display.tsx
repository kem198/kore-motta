import { Item, ItemContent } from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export type JsonDisplayProps = {
  data?: unknown;
  jsonString?: string;
  scrollAreaProps?: ComponentProps<typeof ScrollArea>;
  itemProps?: ComponentProps<typeof Item>;
  itemContentProps?: ComponentProps<typeof ItemContent>;
  preProps?: ComponentProps<"pre">;
};

export function JsonDisplay({
  data,
  jsonString,
  scrollAreaProps,
  itemProps,
  itemContentProps,
  preProps,
}: JsonDisplayProps) {
  const displayText =
    jsonString ?? (data ? JSON.stringify(data, undefined, 2) : " ");

  return (
    <ScrollArea
      {...scrollAreaProps}
      className={cn(
        "border-border rounded-md border",
        scrollAreaProps?.className,
      )}
    >
      <Item
        {...itemProps}
        className={cn("bg-muted/50 w-full", itemProps?.className)}
      >
        <ItemContent {...itemContentProps}>
          <pre
            {...preProps}
            className={cn(
              "cursor-text text-xs wrap-break-word whitespace-pre-wrap select-text",
              preProps?.className,
            )}
          >
            {displayText}
          </pre>
        </ItemContent>
      </Item>
    </ScrollArea>
  );
}
