// customer-validations.ts
import { z } from "zod";
import { MessageCategory } from "@prisma/client";

// Define a schema for the file attachments
const attachmentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Invalid file URL"),
});

// Customer's new message form schema
export const newCustomerMessageSchema = z.object({
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject cannot exceed 100 characters")
    .trim(),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message cannot exceed 2000 characters")
    .trim(),
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

// Reply to an existing conversation schema
export const customerReplySchema = z.object({
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters")
    .trim(),
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

// File upload schema with validation
export const fileValidationSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB",
  )
  .refine(
    (file) =>
      [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ].includes(file.type),
    "Invalid file type. Accepted types: images, PDF, Word documents, and text files",
  );

// Type inference
export type NewCustomerMessageSchemaType = z.infer<
  typeof newCustomerMessageSchema
>;
export type CustomerReplySchemaType = z.infer<typeof customerReplySchema>;

// Type for the server response
export type CustomerMessageResponse = {
  success?: boolean;
  messageId?: string;
  conversationId?: string;
  error?: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
  }>;
};
