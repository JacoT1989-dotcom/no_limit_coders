import { z } from "zod";
import { MessageCategory } from "@prisma/client";

// Define a schema for the file attachments
const attachmentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Invalid file URL"),
});

// Main response form schema
export const respondToMessageSchema = z.object({
  techTeamMessageId: z.string().uuid("Invalid message ID format"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(100, "Subject must be at most 100 characters"),
  preview: z
    .string()
    .min(5, "Preview must be at least 5 characters")
    .max(150, "Preview must be at most 150 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be at most 5000 characters"),
  category: z.enum(
    [
      MessageCategory.DESIGN,
      MessageCategory.SUPPORT,
      MessageCategory.MEETING,
    ] as const,
    {
      errorMap: () => ({ message: "Please select a valid message category" }),
    },
  ),
  attachments: z.array(attachmentSchema).optional().default([]),
});

// Type for the validation schema
export type RespondToMessageFormValues = z.infer<typeof respondToMessageSchema>;

// Helper function to validate the form data
export function validateRespondToMessageForm(data: unknown) {
  return respondToMessageSchema.safeParse(data);
}

// Type for the server response
export const respondToMessageResponseSchema = z.object({
  success: z.boolean().optional(),
  messageId: z.string().uuid().optional(),
  error: z.string().optional(),
});

export type RespondToMessageResponse = z.infer<
  typeof respondToMessageResponseSchema
>;
