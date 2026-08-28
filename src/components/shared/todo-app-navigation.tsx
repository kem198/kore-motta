import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { SquarePenIcon } from "lucide-react";

type TodoAppNavigationProps = {
  categoryCount: number;
  isEditing: boolean;
  onToggleEditing: () => void;
};

export function TodoAppNavigation({
  categoryCount,
  isEditing,
  onToggleEditing,
}: TodoAppNavigationProps) {
  const shouldHideLabel = categoryCount >= 4;

  return (
    <div className="sticky bottom-0 z-50 flex justify-end gap-2">
      <Button
        variant={isEditing ? "default" : "secondary"}
        onClick={onToggleEditing}
        aria-label={
          isEditing ? MESSAGES.actions.editDone : MESSAGES.actions.editStart
        }
      >
        <SquarePenIcon />
        {isEditing
          ? MESSAGES.actions.done
          : !shouldHideLabel
            ? MESSAGES.actions.edit
            : null}
      </Button>
    </div>
  );
}
