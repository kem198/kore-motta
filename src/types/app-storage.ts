import { appStorageSchema } from "@/schemas/app-storage-schema";
import * as z from "zod";

export type AppStorage = z.infer<typeof appStorageSchema>;
