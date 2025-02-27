import { UserRole } from "@/app/(admin)/SessionProvider";
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

// User Message attachment
export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  messageId: string;
}

// Conversation type
export interface Conversation {
  id: string;
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface TechTeamMessageResponse {
  success?: boolean;
  messageId?: string;
  conversationId?: string;
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
    message: string;
    category: TechTeamMessageCategory;
    messageType: TechTeamMessageType;
    priority: Priority;
    createdAt: Date;
    attachments: TechTeamMessageAttachment[];
    conversationId: string;
  }[];
  error?: string;
}

export interface GetConversationsResponse {
  conversations?: {
    id: string;
    subject: string;
    createdAt: Date;
    updatedAt: Date;
    userMessages: UserMessage[];
    techTeamMessages: TechTeamMessage[];
  }[];
  error?: string;
}

// User Message types
export interface UserMessage {
  id: string;
  sender: string;
  preview: string;
  message: string;
  category: MessageCategory;
  isUnread: boolean;
  hasAttachment: boolean;
  createdAt: Date;
  isInitial: boolean;
  conversationId: string;
  attachments?: MessageAttachment[];
  userId: string;
  user?: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  displayName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string;
}

export interface TechTeamMessage {
  id: string;
  message: string;
  category: string;
  messageType: string;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  conversationId: string;
  attachments?: TechTeamMessageAttachment[];
  userId: string;
  user?: UserInfo;
}

export type MessageCategory = "DESIGN" | "SUPPORT" | "MEETING";

// Combined message type for displaying in the UI
export interface MessageWithUser {
  id: string;
  type: "techTeam" | "user";
  message: string;
  subject?: string;
  category: TechTeamMessageCategory | string;
  messageType?: TechTeamMessageType;
  priority?: Priority;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  isUnread?: boolean;
  conversationId: string;
  attachments: TechTeamMessageAttachment[] | MessageAttachment[];
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
    role?: UserRole; // Add role property
  };
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
  preview: string;
  message?: string;
  category: string;
  createdAt: Date;
  attachments: ThreadResponseAttachment[];
  conversationId: string;
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
