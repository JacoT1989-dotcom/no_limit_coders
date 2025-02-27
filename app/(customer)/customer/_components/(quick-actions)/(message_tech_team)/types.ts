import { Priority } from "@prisma/client";

// Message categories and types
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

// Form values
export interface TechTeamMessageFormValues {
  subject: string;
  message: string;
  category: TechTeamMessageCategory;
  messageType: TechTeamMessageType;
  priority: Priority;
  attachments?: File[];
}

// Message attachment
export interface TechTeamMessageAttachment {
  id?: string;
  fileName: string;
  fileUrl: string;
  createdAt?: Date;
  messageId?: string;
}

// API response types
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

// Thread response types
export interface ThreadResponseAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  messageId?: string;
  taskId: string;
  uploaderId: string;
}

export interface ThreadResponse {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  message?: string; // Add full message content
  category: string;
  createdAt: Date;
  attachments: ThreadResponseAttachment[];
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
