import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_CATEGORY_ID } from "@/constants/categories";
import { MESSAGES } from "@/constants/messages";
import { Category } from "@/schemas/category-schema";
import { PlusIcon } from "lucide-react";

const sortCategories = (categories: Category[]) =>
  [...categories].sort((a, b) => {
    if (a.id === DEFAULT_CATEGORY_ID) return 1;
    if (b.id === DEFAULT_CATEGORY_ID) return -1;

    return a.name.localeCompare(b.name);
  });

/** マウスホイールで横スクロールする */
const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    event.currentTarget.scrollLeft += event.deltaY;
  }
};

function CategoryListSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
      <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
    </div>
  );
}

type CategoryListProps = {
  categories: Category[];
  activeCategoryId: string;
  isLoaded: boolean;
  onSelect: (categoryId: string) => void;
  onCreate: () => void;
};

export function CategoryList({
  categories,
  activeCategoryId,
  isLoaded,
  onSelect,
  onCreate,
}: CategoryListProps) {
  if (!isLoaded) {
    return (
      <ScrollArea aria-label={MESSAGES.labels.categoryList}>
        <CategoryListSkeleton />
      </ScrollArea>
    );
  }

  const sortedCategories = sortCategories(categories);

  return (
    <ScrollArea aria-label={MESSAGES.labels.categoryList} onWheel={handleWheel}>
      <div className="flex gap-2">
        {sortedCategories.map((category) => {
          const isSelected = category.id === activeCategoryId;

          return (
            <Button
              key={category.id}
              type="button"
              variant={isSelected ? "default" : "secondary"}
              size="sm"
              className="shrink-0 rounded-full"
              aria-label={category.name}
              aria-pressed={isSelected}
              onClick={() => onSelect(category.id)}
            >
              {category.name}
            </Button>
          );
        })}

        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label={MESSAGES.actions.createCategory}
          onClick={onCreate}
          className="shrink-0 rounded-full"
        >
          <PlusIcon />
        </Button>
      </div>
    </ScrollArea>
  );
}
