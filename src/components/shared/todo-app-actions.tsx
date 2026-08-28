import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { SquarePenIcon } from "lucide-react";

type TodoAppActionsProps = {
  isEditing: boolean;
  onOpenCategorySettings: () => void;
  onToggleEditing: () => void;
};

export function TodoAppActions({
  isEditing,
  onToggleEditing,
}: TodoAppActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={isEditing ? "default" : "secondary"}
        onClick={onToggleEditing}
        aria-label={
          isEditing ? MESSAGES.actions.editDone : MESSAGES.actions.editStart
        }
      >
        <SquarePenIcon />
        {isEditing ? MESSAGES.actions.done : null}
      </Button>
    </div>
  );
}
