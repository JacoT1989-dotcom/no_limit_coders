import React from "react";
import {
  TechTeamMessageAttachment,
  TechTeamMessageCategory,
} from "@/app/(customer)/customer/_components/(quick-actions)/(message_tech_team)/types";
import { Priority } from "@/app/(customer)/customer/tasks/types";
import { MessageAttachment } from "./CustomerMessageCard";

// Helper function to format subjects and extract reference numbers
export const formatSubject = (
  subject: string,
): { main: string; reference: string | null } => {
  if (!subject) return { main: "No Subject", reference: null };

  // Check if the subject starts with multiple "Re:" prefixes
  const rePattern = /^(Re:\s*)+/i;
  let mainSubject = subject;

  if (rePattern.test(subject)) {
    // Replace multiple "Re:" with just one "Re:"
    mainSubject = "Re: " + subject.replace(rePattern, "");
  }

  // Extract reference number if present
  const refPattern = /\[Ref:([^\]]+)\]/;
  const refMatch = subject.match(refPattern);

  if (refMatch) {
    // Remove reference from main subject
    mainSubject = mainSubject.replace(refPattern, "").trim();
    return {
      main: mainSubject,
      reference: refMatch[0],
    };
  }

  return {
    main: mainSubject,
    reference: null,
  };
};

// Priority badge component for better visualization
export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles: Record<Priority, string> = {
    LOW: "bg-blue-100 text-blue-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const CategoryBadge = ({
  category,
}: {
  category: TechTeamMessageCategory | string;
}) => {
  const categoryMap: Record<string, { label: string; style: string }> = {
    bug: { label: "Bug", style: "bg-red-50 text-red-600" },
    feature: { label: "Feature", style: "bg-purple-50 text-purple-600" },
    support: { label: "Support", style: "bg-blue-50 text-blue-600" },
    access: { label: "Access", style: "bg-yellow-50 text-yellow-600" },
    performance: {
      label: "Performance",
      style: "bg-orange-50 text-orange-600",
    },
    security: { label: "Security", style: "bg-green-50 text-green-600" },
    other: { label: "Other", style: "bg-gray-50 text-gray-600" },
    DESIGN: { label: "Design", style: "bg-purple-50 text-purple-600" },
    SUPPORT: { label: "Support", style: "bg-blue-50 text-blue-600" },
    MEETING: { label: "Meeting", style: "bg-green-50 text-green-600" },
  };

  const { label, style } = categoryMap[category] || {
    label: typeof category === "string" ? category : "Other",
    style: "bg-gray-50 text-gray-600",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${style}`}>{label}</span>
  );
};

export const formatDate = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffMins < 24 * 60) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    const days = Math.floor(diffMins / (60 * 24));
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
};

// Generic function to convert any attachment type to the format expected by AttachmentsModal
export const convertAttachments = (
  attachments: TechTeamMessageAttachment[] | MessageAttachment[] | any[],
): {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  taskId: string;
  uploaderId: string;
}[] => {
  return attachments.map((att) => ({
    id: att.id || String(Math.random()),
    name: att.fileName,
    url: att.fileUrl,
    createdAt: att.createdAt || new Date(),
    taskId: "message",
    uploaderId: "user",
  }));
};

// Format time for messages
export const formatMessageTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format date for message groups
export const formatDateForGroup = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(date);

  // Check if it's today
  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  }

  // Check if it's yesterday
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Otherwise return full date
  return messageDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};
