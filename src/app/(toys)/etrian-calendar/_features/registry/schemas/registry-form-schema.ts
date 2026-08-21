import {
  etrianDayOptions,
  etrianMonthOptions,
  etrianNewYearsEve,
  MONOKA_DAY_OPTION,
} from "@/app/(toys)/etrian-calendar/_common/constants/date";
import { UNSET_SELECT_VALUE } from "@/constants/select";
import * as z from "zod";

export const registryFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "1 文字以上入力してください。")
      .max(20, "20 文字以下で入力してください。"),
    memo: z.string().max(100, "100 文字以下で入力してください。").optional(),
    dateOfBirth: z
      .object({
        month: z.enum([UNSET_SELECT_VALUE, ...etrianMonthOptions]).optional(),
        day: z.enum([UNSET_SELECT_VALUE, ...etrianDayOptions]).optional(),
      })
      .optional(),
    affiliations: z
      .string()
      .max(50, "50 文字以下で入力してください。")
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.dateOfBirth) return true;

      const hasMonth =
        data.dateOfBirth.month !== undefined &&
        data.dateOfBirth.month !== UNSET_SELECT_VALUE;
      const hasDay =
        data.dateOfBirth.day !== undefined &&
        data.dateOfBirth.day !== UNSET_SELECT_VALUE;

      // 両方入力または両方未設定
      return hasMonth === hasDay;
    },
    {
      message: "誕生日を設定する場合、月日両方を入力してください。",
      path: ["dateOfBirth"],
    },
  )
  .refine(
    (data) => {
      if (data.dateOfBirth?.month === etrianNewYearsEve.name) {
        return data.dateOfBirth.day === MONOKA_DAY_OPTION;
      }
      return true;
    },
    {
      message: `${etrianNewYearsEve.name}の場合、日は「${MONOKA_DAY_OPTION}」で登録してください。`,
      path: ["dateOfBirth"],
    },
  );

export type RegistryFormValues = z.infer<typeof registryFormSchema>;
