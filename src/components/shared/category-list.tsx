import { Button } from "@/components/ui/button";
import { DEFAULT_CATEGORY_ID } from "@/constants/categories";
import { MESSAGES } from "@/constants/messages";
import { Category } from "@/types/category";
import { PlusIcon } from "lucide-react";

const sortCategories = (categories: Category[]) =>
  [...categories].sort((a, b) => {
    if (a.id === DEFAULT_CATEGORY_ID) return 1;
    if (b.id === DEFAULT_CATEGORY_ID) return -1;

    return a.name.localeCompare(b.name);
  });

type CategoryListProps = {
  categories: Category[];
  activeCategoryId: string;
  onSelect: (categoryId: string) => void;
  onCreate: () => void;
};

export function CategoryList({
  categories,
  activeCategoryId,
  onSelect,
  onCreate,
}: CategoryListProps) {
  const sortedCategories = sortCategories(categories);

  return (
    <div
      className="flex flex-wrap gap-2"
      aria-label={MESSAGES.labels.categoryList}
    >
      {sortedCategories.map((category) => {
        const isSelected = category.id === activeCategoryId;

        return (
          <Button
            key={category.id}
            type="button"
            variant={isSelected ? "default" : "secondary"}
            size="sm"
            className="rounded-full"
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
        size="icon"
        aria-label={MESSAGES.actions.createCategory}
        onClick={onCreate}
        className="border-border/60 bg-background rounded-full border"
      >
        <PlusIcon />
      </Button>
    </div>
  );
}
