import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { FolderEditIcon, ListTodoIcon, SquarePenIcon } from "lucide-react";

type TodoAppNavigationProps = {
  isEditing: boolean;
  onToggleEditing: () => void;
  onToggleTodoPosition: () => void;
  onOpenCategorySetting: () => void;
};

export function TodoAppNavigation({
  isEditing,
  onToggleEditing,
  onOpenCategorySetting,
  onToggleTodoPosition,
}: TodoAppNavigationProps) {
  return (
    <div className="flex justify-between gap-2">
      <Button
        variant="secondary"
        onClick={onToggleTodoPosition}
        aria-label={"チェックボタンの位置切替"}
      >
        <ListTodoIcon /> 位置切替
      </Button>
      <div className="flex gap-2">
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
    </div>
  );
}
