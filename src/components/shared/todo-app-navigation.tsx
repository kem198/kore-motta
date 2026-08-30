import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { CircleCheckIcon, FolderEditIcon, SquarePenIcon } from "lucide-react";

type TodoAppNavigationProps = {
  isEditing: boolean;
  todoTogglePosition: "left" | "right";
  onToggleEditing: () => void;
  onToggleTodoPosition: () => void;
  onOpenCategorySetting: () => void;
};

export function TodoAppNavigation({
  isEditing,
  todoTogglePosition,
  onToggleEditing,
  onOpenCategorySetting,
  onToggleTodoPosition,
}: TodoAppNavigationProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="secondary"
        onClick={onToggleTodoPosition}
        aria-label={todoTogglePosition === "left" ? "右へ" : "左へ"}
      >
        <CircleCheckIcon />
        {todoTogglePosition === "left" ? "右へ" : "左へ"}
      </Button>
      <Button
        variant="secondary"
        aria-label="カテゴリ設定"
        onClick={onOpenCategorySetting}
      >
        <FolderEditIcon />
        カテゴリ設定
      </Button>

      <Button
        variant={isEditing ? "default" : "secondary"}
        onClick={onToggleEditing}
        aria-label={
          isEditing ? MESSAGES.actions.editDone : MESSAGES.actions.editStart
        }
      >
        <SquarePenIcon />
        {isEditing ? MESSAGES.actions.done : MESSAGES.actions.edit}
      </Button>
    </div>
  );
}
