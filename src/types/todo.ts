import { todoSchema } from "@/schemas/todo-schema";
import * as z from "zod";

export type Todo = z.infer<typeof todoSchema>;
