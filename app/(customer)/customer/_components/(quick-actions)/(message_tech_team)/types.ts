// types.ts
import { Priority } from "@prisma/client";

export type TechTeamMessageCategory =
  | "bug"
  | "feature"
  | "support"
  | "access"
  | "performance"
  | "security"
  | "other";

export type TechTeamMessageType =
  | "design"
  | "support"
  | "meeting"
  | "development"
  | "documentation"
  | "question";

export interface TechTeamMessageFormValues {
  subject: string;
  message: string;
  category: TechTeamMessageCategory;
  messageType: TechTeamMessageType;
  priority: Priority;
  attachments?: File[];
}

export interface TechTeamMessageAttachment {
  fileName: string;
  fileUrl: string;
}

export interface TechTeamMessageResponse {
  success?: boolean;
  messageId?: string;
  error?: string;
  attachments?: TechTeamMessageAttachment[];
}

export interface DeleteTechTeamMessageResponse {
  success?: boolean;
  error?: string;
}

export interface GetTechTeamMessagesResponse {
  messages?: {
    id: string;
    subject: string;
    message: string;
    category: TechTeamMessageCategory;
    messageType: TechTeamMessageType;
    priority: Priority;
    createdAt: Date;
    attachments: TechTeamMessageAttachment[];
  }[];
  error?: string;
}

// Constants for form options
export const CATEGORY_OPTIONS = [
  { value: "bug", display: "Bug Report" },
  { value: "feature", display: "Feature Request" },
  { value: "support", display: "Technical Support" },
  { value: "access", display: "Access Issue" },
  { value: "performance", display: "Performance Issue" },
  { value: "security", display: "Security Concern" },
  { value: "other", display: "Other" },
] as const;

export const MESSAGE_TYPE_OPTIONS = [
  { value: "design", display: "Design Feedback" },
  { value: "support", display: "Support Request" },
  { value: "meeting", display: "Meeting Related" },
  { value: "development", display: "Development Issue" },
  { value: "documentation", display: "Documentation" },
  { value: "question", display: "General Question" },
] as const;

export const PRIORITY_OPTIONS = [
  { value: "LOW", display: "Low - Not time sensitive" },
  { value: "MEDIUM", display: "Medium - Needs attention soon" },
  { value: "HIGH", display: "High - Urgent issue" },
  { value: "URGENT", display: "Critical - System down/blocking work" },
] as const;
