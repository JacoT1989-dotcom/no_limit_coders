// validations.ts
import { z } from "zod";
import { countries } from "./types";

export const messageSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(1, "Mobile number is required"),
  country: z
    .string()
    .min(1, "Country is required")
    .refine((val) => countries.some((country) => country.value === val), {
      message: "Please select a valid country code",
    }),
  message: z.string().min(1, "Message is required"),
});
