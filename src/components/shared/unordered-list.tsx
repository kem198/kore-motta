import { cn } from "@/lib/utils";
import { ListItem } from "@/types/help";

type UnorderedListProps = {
  items: ListItem[];
  className?: string;
  codeStyle?: boolean;
};

export function UnorderedList({ items, className }: UnorderedListProps) {
  return (
    <ul className={cn("flex list-disc flex-col gap-1 pl-5", className)}>
      {items.map((item) => (
        <li key={item.text} className="leading-relaxed">
          {item.text}
          {item.children && (
            <ul className={cn("mt-1 flex list-[circle] flex-col gap-1 pl-5")}>
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
