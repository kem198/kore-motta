"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MESSAGES } from "@/constants/messages";
import {
  CategoryFormValues,
  categoryFormSchema,
} from "@/schemas/category-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

export type CategoryDialogMode = "create" | "edit";

export type CategorySettingDialogProps = {
  open: boolean;
  mode: CategoryDialogMode;
  category: { id: string; name: string } | null;
  isDefaultCategory: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
  onRename: (category: { id: string; name: string }, name: string) => void;
  onDelete: (category: { id: string; name: string }) => void;
};

export function CategorySettingDialog({
  open,
  mode,
  category,
  isDefaultCategory,
  onOpenChange,
  onCreate,
  onRename,
  onDelete,
}: CategorySettingDialogProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isCreateMode = mode === "create";

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
      });
    }
  }, [open, category, form]);

  const handleSubmit = (data: CategoryFormValues) => {
    if (isCreateMode) {
      onCreate(data.name);
      onOpenChange(false);
      return;
    }

    if (!category || isDefaultCategory) {
      return;
    }

    onRename(category, data.name);
    onOpenChange(false);
  };

  const handleDeleteConfirm = () => {
    if (!category) return;

    onDelete(category);
    setIsDeleteConfirmOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="min-w-0 break-all">
              {isCreateMode
                ? "新規カテゴリの追加"
                : `カテゴリ設定: ${category?.name ?? ""}`}
            </DialogTitle>
          </DialogHeader>

          {(isCreateMode || category) && (
            <form
              id="category-setting"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FieldSet>
                <FieldGroup>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="category-name">
                          {MESSAGES.labels.categoryName}
                        </FieldLabel>

                        <Input
                          {...field}
                          id="category-name"
                          aria-label={MESSAGES.labels.categoryName}
                          aria-invalid={fieldState.invalid}
                          placeholder={
                            isCreateMode
                              ? MESSAGES.placeholders.categoryName
                              : (category?.name ?? "")
                          }
                          disabled={!isCreateMode && isDefaultCategory}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Field>
                    <FieldLabel htmlFor="category-reset-time">
                      未完了に戻す時刻
                    </FieldLabel>
                    <Input
                      // {...field}
                      id="category-reset-time"
                      // aria-label={MESSAGES.labels.categoryName}
                      // aria-invalid={fieldState.invalid}
                      placeholder={
                        "将来対応"
                        // isCreateMode
                        //   ? MESSAGES.placeholders.categoryName
                        //   : (category?.name ?? "")
                      }
                      disabled={!isCreateMode && isDefaultCategory}
                    />
                  </Field>

                  {!isCreateMode && category && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      disabled={isDefaultCategory}
                    >
                      カテゴリを削除
                    </Button>
                  )}

                  {!isCreateMode && isDefaultCategory && (
                    <Field>
                      <Alert variant="default">
                        <AlertCircleIcon size={16} />

                        <AlertTitle>
                          未分類カテゴリはタイトル変更・削除できません。
                        </AlertTitle>
                      </Alert>
                    </Field>
                  )}
                </FieldGroup>
              </FieldSet>
            </form>
          )}

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  {MESSAGES.actions.cancel}
                </Button>
              }
            />

            <Button
              type="submit"
              form="category-setting"
              disabled={!isCreateMode && isDefaultCategory}
            >
              {isCreateMode ? MESSAGES.actions.add : MESSAGES.actions.update}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              カテゴリ「{category?.name ?? ""}」を削除しますか？
            </AlertDialogTitle>

            <AlertDialogDescription>
              このカテゴリに属するアイテムは「未分類」カテゴリに移動します。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{MESSAGES.actions.cancel}</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              {MESSAGES.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
