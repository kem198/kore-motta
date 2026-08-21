import * as z from "zod";

export const todoFormSchema = z.object({
  name: z
    .string()
    .min(1, "1 文字以上入力してください。")
    .max(20, "20 文字以下で入力してください。"),
  memo: z.string().max(100, "100 文字以下で入力してください。").optional(),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;
