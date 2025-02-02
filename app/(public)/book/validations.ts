import { z } from "zod";

export const bookingSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(1, "Mobile number is required"),
  country: z.string().min(1, "Country is required"),
  package: z.enum(["NONE", "STARTUPTEAM", "PROFESSIONALTEAM", "ENTERPRISE"]),
  message: z.string().min(1, "Message is required"),
  userId: z.string().optional(),
});
