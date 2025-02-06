// validations.ts
import { z } from "zod";
import { Priority } from "@prisma/client";

export const projectSchema = z.object({
  name: z.string().min(3, "Project name is required"),
  description: z.string().min(10, "Description is required"),
  startDate: z.string(),
  endDate: z.string(),
  priority: z.enum([
    Priority.LOW,
    Priority.MEDIUM,
    Priority.HIGH,
    Priority.URGENT,
  ]),
  preferredMeeting: z.string(),
  customerId: z.string().uuid(),
});
