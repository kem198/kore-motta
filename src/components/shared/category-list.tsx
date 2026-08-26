import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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

function CategoryListSkeleton() {
  return (
    <div className="flex gap-2 p-1 pb-3">
      <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
      <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
      <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
      <Skeleton className="size-8 shrink-0 rounded-full" />
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
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  const sortedCategories = sortCategories(categories);

  return (
    <ScrollArea aria-label={MESSAGES.labels.categoryList}>
      <div className="flex gap-2 p-1 pb-3">
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

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
