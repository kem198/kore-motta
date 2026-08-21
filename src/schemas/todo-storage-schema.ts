import { CURRENT_TODO_STORAGE_VERSION } from "@/constants/version";
import { TodoStorage } from "@/types/todo";
import * as z from "zod";

const todoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    order: z.number(),
    memo: z.string().optional(),
  })
  .strict();

const todoStorageSchema = z
  .object({
    version: z.literal(CURRENT_TODO_STORAGE_VERSION),
    todos: z.array(todoSchema),
  })
  .strict();

export function parseTodoStorage(data: unknown): TodoStorage {
  return todoStorageSchema.parse(data);
}
