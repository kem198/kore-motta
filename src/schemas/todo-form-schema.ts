import { MESSAGES } from "@/constants/messages";
import * as z from "zod";

export const todoFormSchema = z.object({
  name: z
    .string()
    .min(1, MESSAGES.validation.minName)
    .max(50, MESSAGES.validation.maxName),
  memo: z.string().max(100, MESSAGES.validation.maxMemo).optional(),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;
