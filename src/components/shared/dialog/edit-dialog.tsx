"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundCheck } from "lucide-react";
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";

import { Required } from "@/components/shared/required";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  RegistryFormValues,
  registryFormSchema,
} from "@/schemas/registry-form-schema";
import { Etrian } from "@/types/etrian";

type EditDialogProps = {
  etrian: Etrian;
  onSave: (updated: Etrian) => void;
  children: ReactNode;
} & ComponentProps<typeof DialogTrigger>;

export function EditDialog({
  etrian,
  onSave,
  children,
  ...props
}: EditDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<RegistryFormValues>({
    resolver: zodResolver(registryFormSchema),
    defaultValues: {
      name: "",
      memo: "",
    },
  });

  const resetFormValues = useCallback(() => {
    form.reset({
      name: etrian.name,
      memo: etrian.memo,
    });
  }, [etrian, form]);

  useEffect(() => {
    if (!open) {
      return;
    }

    resetFormValues();
  }, [open, resetFormValues]);

  const handleSubmit = (data: RegistryFormValues) => {
    const updatedEtrian: Etrian = {
      ...etrian,
      name: data.name.trim(),
      memo: data.memo?.trim() || undefined,
    };

    onSave(updatedEtrian);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as ReactElement} {...props} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>冒険者情報の編集</DialogTitle>
          <DialogDescription>
            冒険者のプロフィールを設定してください。
            <br />
            <Required /> は必須項目です。
          </DialogDescription>
        </DialogHeader>

        <form id="etrian-edit" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <FieldSet>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="etrian-name-edit">
                      名前
                      <Required />
                    </FieldLabel>
                    <Input
                      {...field}
                      id="etrian-name-edit"
                      aria-invalid={fieldState.invalid}
                      placeholder="ししょー"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="memo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="etrian-memo">メモ</FieldLabel>
                    <Textarea
                      {...field}
                      id="etrian-memo"
                      placeholder="エトリアの冒険者。得意技はフロントガード。"
                      rows={4}
                      className="resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      お好みの内容を入力してください。
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldSet>
          </FieldGroup>
        </form>
        <DialogFooter className="gap-y-2">
          <DialogClose
            render={
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            }
          />
          <Button type="submit" form="etrian-edit">
            <UserRoundCheck />
            更新
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
