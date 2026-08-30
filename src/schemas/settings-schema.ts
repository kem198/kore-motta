import * as z from "zod";

export const settingsSchema = z
  .object({
    todoTogglePosition: z.enum(["left", "right"]),
  })
  .strict();

export type Settings = z.infer<typeof settingsSchema>;
