import { TodoAppActions } from "@/components/shared/todo-app-actions";
import { TodoEditActions } from "@/components/shared/todo-edit-actions";
import { AppStorage } from "@/types/app-storage";

type TodoAppNavigationProps = {
  isEditing: boolean;
  appStorage: AppStorage;
  onMarkAllIncomplete: () => void;
  onImport: (data: string) => boolean;
  onOpenCategorySettings: () => void;
  onToggleEditing: () => void;
};

export function TodoAppNavigation({
  isEditing,
  appStorage,
  onImport,
  onOpenCategorySettings,
  onToggleEditing,
}: TodoAppNavigationProps) {
  return (
    <div className="bg-background/70 sticky bottom-0 z-50 flex justify-between gap-2 border-b pb-4">
      <div className="flex gap-2">
        {isEditing && (
          <TodoEditActions appStorage={appStorage} onImport={onImport} />
        )}
      </div>

      <TodoAppActions
        isEditing={isEditing}
        onOpenCategorySettings={onOpenCategorySettings}
        onToggleEditing={onToggleEditing}
      />
    </div>
  );
}
