import { TodoAppActions } from "@/components/shared/todo-app-actions";
import { AppStorage } from "@/schemas/app-storage-schema";

type TodoAppNavigationProps = {
  isEditing: boolean;
  appStorage: AppStorage;
  onOpenCategorySettings: () => void;
  onToggleEditing: () => void;
};

export function TodoAppNavigation({
  isEditing,
  onOpenCategorySettings,
  onToggleEditing,
}: TodoAppNavigationProps) {
  return (
    <div className="sticky bottom-0 z-50 flex justify-end gap-2">
      <TodoAppActions
        isEditing={isEditing}
        onOpenCategorySettings={onOpenCategorySettings}
        onToggleEditing={onToggleEditing}
      />
    </div>
  );
}
