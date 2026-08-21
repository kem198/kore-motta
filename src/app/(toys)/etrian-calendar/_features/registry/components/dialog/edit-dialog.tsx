"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundCheck } from "lucide-react";
import {
  ComponentProps,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";

import {
  etrianDayOptions,
  etrianMonthOptions,
} from "@/app/(toys)/etrian-calendar/_common/constants/date";
import {
  Etrian,
  EtrianDay,
} from "@/app/(toys)/etrian-calendar/_common/types/etrian";
import {
  RegistryFormValues,
  registryFormSchema,
} from "@/app/(toys)/etrian-calendar/_features/registry/schemas/registry-form-schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UNSET_SELECT_VALUE } from "@/constants/select";

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
      affiliations: "",
    },
  });

  const resetFormValues = useCallback(() => {
    form.reset({
      name: etrian.name,
      memo: etrian.memo,
      dateOfBirth: etrian.dateOfBirth
        ? {
            month: etrian.dateOfBirth.month,
            day: String(etrian.dateOfBirth.day),
          }
        : {
            month: UNSET_SELECT_VALUE,
            day: UNSET_SELECT_VALUE,
          },
      affiliations: etrian.affiliations?.join(","),
    });
  }, [etrian, form]);

  const normalizeAffiliations = (
    affiliationsString: string | undefined,
  ): string[] => {
    if (!affiliationsString) return [];
    return affiliationsString
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    resetFormValues();
  }, [open, resetFormValues]);

  const handleSubmit = (data: RegistryFormValues) => {
    const normalizedAffiliations = normalizeAffiliations(data.affiliations);

    const dateOfBirth =
      data.dateOfBirth?.month &&
      data.dateOfBirth?.day &&
      data.dateOfBirth.month !== UNSET_SELECT_VALUE &&
      data.dateOfBirth.day !== UNSET_SELECT_VALUE
        ? {
            month: data.dateOfBirth.month,
            day: Number(data.dateOfBirth.day) as EtrianDay,
          }
        : undefined;

    const updatedEtrian: Etrian = {
      ...etrian,
      name: data.name.trim(),
      affiliations: normalizedAffiliations,
      dateOfBirth,
      memo: data.memo?.trim() || undefined,
    };

    onSave(updatedEtrian);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild {...props}>
        {children}
      </DialogTrigger>

      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
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

              <Field data-invalid={form.formState.errors.dateOfBirth}>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="etrian-birth-month">誕生月</FieldLabel>
                    <Controller
                      name="dateOfBirth.month"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="etrian-birth-month">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UNSET_SELECT_VALUE}>
                              {UNSET_SELECT_VALUE}
                            </SelectItem>
                            {etrianMonthOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="etrian-birth-day">日</FieldLabel>
                    <Controller
                      name="dateOfBirth.day"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="etrian-birth-day">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UNSET_SELECT_VALUE}>
                              {UNSET_SELECT_VALUE}
                            </SelectItem>
                            {etrianDayOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                </div>
                <FieldDescription>
                  設定する場合は月日両方を入力してください。
                </FieldDescription>
                {form.formState.errors.dateOfBirth && (
                  <FieldError errors={[form.formState.errors.dateOfBirth]} />
                )}
              </Field>

              <Controller
                name="affiliations"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="etrian-affiliations">所属</FieldLabel>
                    <Input
                      {...field}
                      id="etrian-affiliations"
                      placeholder="ギルド名,エトリア,etc..."
                      autoComplete="off"
                    />
                    <FieldDescription>
                      所属ギルドや居住地などを入力してください。
                      <br />, で区切ると、複数の所属を登録できます。
                    </FieldDescription>
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
          <DialogClose asChild>
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </DialogClose>
          <Button type="submit" form="etrian-edit">
            <UserRoundCheck />
            更新
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
