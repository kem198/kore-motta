import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { SquarePenIcon } from "lucide-react";

type TodoAppActionsProps = {
  categoryCount: number;
  isEditing: boolean;
  onToggleEditing: () => void;
};

export function TodoAppActions({
  categoryCount,
  isEditing,
  onToggleEditing,
}: TodoAppActionsProps) {
  const shouldHideLabel = categoryCount >= 3;

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
        {!shouldHideLabel &&
          (isEditing ? MESSAGES.actions.done : MESSAGES.actions.edit)}
      </Button>
    </div>
  );
}
