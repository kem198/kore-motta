import { cn } from "@/lib/utils";
import { ListItem } from "@/types/help";

type UnorderedListProps = {
  items: ListItem[];
  className?: string;
};

export function UnorderedList({ items, className }: UnorderedListProps) {
  return (
    <ul className={cn("flex list-disc flex-col gap-1 pl-5", className)}>
      {items.map((item) => (
        <li key={item.text} className="leading-relaxed">
          {item.text}
          {item.children && (
            <ul
              className={cn(
                "text-muted-foreground mt-1 flex list-[circle] flex-col gap-1 pl-5 text-sm",
              )}
            >
              {item.children.map((child) => (
                <li key={child}>{child}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
