import { z } from "zod";

// Email validation regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Helper function to validate comma-separated email addresses
const validateEmailList = (value: string) => {
  if (!value.trim()) return false;

  const emails = value.split(",").map((email) => email.trim());
  return emails.every((email) => EMAIL_REGEX.test(email));
};

// Validation schema for scheduling meetings
export const scheduleMeetingSchema = z.object({
  subject: z
    .string()
    .min(3, { message: "Meeting subject must be at least 3 characters long" })
    .max(100, { message: "Meeting subject cannot exceed 100 characters" }),

  date: z.string().refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    { message: "Meeting date cannot be in the past" },
  ),

  time: z
    .string()
    .min(5, { message: "Please select a valid time" })
    .refine(
      (time) => {
        // Validate time format (HH:MM)
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      { message: "Invalid time format" },
    ),

  participants: z
    .string()
    .min(3, { message: "Please add at least one participant" })
    .refine(validateEmailList, {
      message: "Please enter valid email addresses (comma-separated)",
    }),

  // Optional project ID if the meeting is related to a specific project
  projectId: z.string().optional(),
});

// Extended schema for admin scheduling (adds user selection)
export const adminScheduleMeetingSchema = scheduleMeetingSchema.extend({
  userId: z.string().uuid({ message: "Invalid user ID" }),
});

// Validation schema for checking date-time availability
export const availabilityCheckSchema = z.object({
  date: z.string(),
  time: z.string(),
  duration: z.number().min(15).max(240).default(30),
});
