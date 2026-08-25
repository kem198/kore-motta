import { categorySchema } from "@/schemas/category-schema";
import z from "zod";

export type Category = z.infer<typeof categorySchema>;
