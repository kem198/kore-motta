import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { FolderPenIcon, PencilIcon } from "lucide-react";

type TodoAppActionsProps = {
  isEditing: boolean;
  onOpenCategorySettings: () => void;
  onToggleEditing: () => void;
};

export function TodoAppActions({
  isEditing,
  onOpenCategorySettings,
  onToggleEditing,
}: TodoAppActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="secondary"
        aria-label="カテゴリ設定"
        onClick={onOpenCategorySettings}
        className="inline-flex items-center gap-2"
      >
        <FolderPenIcon />
        <span>カテゴリ設定</span>
      </Button>

      <Button
        variant={isEditing ? "default" : "secondary"}
        onClick={onToggleEditing}
        aria-label={
          isEditing
            ? MESSAGES.actions.editDone
            : `${MESSAGES.actions.editStart}`
        }
      >
        <PencilIcon />
        {isEditing ? MESSAGES.actions.done : MESSAGES.actions.edit}
      </Button>
    </div>
  );
}
