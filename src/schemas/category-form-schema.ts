import { MESSAGES } from "@/constants/messages";
import * as z from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, MESSAGES.validation.minName)
    .max(50, MESSAGES.validation.maxName),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
