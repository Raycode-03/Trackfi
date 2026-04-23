import { z } from "zod";

export const alertCreateSchema = z.object({
  type: z.string().min(1, "Alert Type is required"),
  value: z.number().positive("Alert amount must be a positive number"),
});

export type AlertCreateInput = z.infer<typeof alertCreateSchema>;
