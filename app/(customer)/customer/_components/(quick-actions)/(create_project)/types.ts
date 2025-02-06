// types.ts
import { Priority } from "@prisma/client";

export interface ProjectFormValues {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: Priority;
  preferredMeeting: string;
  customerId: string;
}
