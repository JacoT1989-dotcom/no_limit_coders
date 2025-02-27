// validations.ts
import { z } from "zod";
import { Priority } from "@prisma/client";
import { CATEGORY_OPTIONS, MESSAGE_TYPE_OPTIONS } from "./types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

// Extract valid category values from options
const validCategories = CATEGORY_OPTIONS.map((opt) => opt.value);
const validMessageTypes = MESSAGE_TYPE_OPTIONS.map((opt) => opt.value);

// Schema for conversation
export const conversationSchema = z.object({
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject cannot exceed 100 characters")
    .trim(),
});

// Schema for tech team message
export const techTeamMessageSchema = z.object({
  // No subject field as it's now in the conversation
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message cannot exceed 2000 characters")
    .trim(),

  category: z.enum(validCategories as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),

  messageType: z.enum(validMessageTypes as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a valid message type" }),
  }),

  priority: z.nativeEnum(Priority, {
    errorMap: () => ({ message: "Please select a valid priority level" }),
  }),

  attachments: z
    .array(
      z
        .instanceof(File, { message: "Invalid file" })
        .refine(
          (file) => file.size <= MAX_FILE_SIZE,
          `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        )
        .refine(
          (file) => ACCEPTED_FILE_TYPES.includes(file.type),
          "Invalid file type. Accepted types: images, PDF, Word documents, and text files",
        ),
    )
    .optional()
    .default([]),
});

// Combined schema for creating a new conversation with a tech team message
export const newConversationWithMessageSchema = techTeamMessageSchema.extend({
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject cannot exceed 100 characters")
    .trim(),
});

// Type inference
export type TechTeamMessageSchemaType = z.infer<typeof techTeamMessageSchema>;
export type NewConversationWithMessageSchemaType = z.infer<
  typeof newConversationWithMessageSchema
>;
export type ConversationSchemaType = z.infer<typeof conversationSchema>;
