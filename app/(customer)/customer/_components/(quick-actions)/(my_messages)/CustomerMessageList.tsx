"use client";

import React, { useMemo } from "react";
import { MessageSquare, Calendar, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TechTeamMessageCategory } from "@/app/(customer)/customer/_components/(quick-actions)/(message_tech_team)/types";
import { MessageWithUser } from "./CustomerMessageCard";

interface CustomerMessageListProps {
  messages: MessageWithUser[];
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
}

const CategoryBadge = ({
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

const formatDate = (date: Date) => {
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

// Function to format date in a more readable format
const formatDateFull = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface ConversationGroup {
  conversationId: string;
  subject: string;
  messages: MessageWithUser[];
  latestDate: Date;
  oldestDate: Date;
  totalAttachments: number;
  categories: Set<string>;
  latestMessage: string;
  totalMessages: number;
  hasUnreadMessages: boolean;
}

const CustomerMessageList: React.FC<CustomerMessageListProps> = ({
  messages,
  selectedMessageId,
  onSelectMessage,
}) => {
  // Add a reference to the messages container
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Group messages by conversation
  const conversationGroups = useMemo(() => {
    const groups: Record<string, ConversationGroup> = {};

    messages.forEach((msg) => {
      const conversationId = msg.conversationId;
      const subject = msg.subject || "No Subject";

      if (!groups[conversationId]) {
        groups[conversationId] = {
          conversationId,
          subject,
          messages: [],
          latestDate: msg.createdAt,
          oldestDate: msg.createdAt,
          totalAttachments: 0,
          categories: new Set<string>(),
          latestMessage: msg.message,
          totalMessages: 0,
          hasUnreadMessages: false,
        };
      }

      // Add message to group
      groups[conversationId].messages.push(msg);
      groups[conversationId].totalMessages++;

      // Check for unread messages from admin
      if (
        msg.type === "user" &&
        "isUnread" in msg &&
        msg.isUnread === true &&
        msg.user.id !== msg.userId
      ) {
        groups[conversationId].hasUnreadMessages = true;
      }

      // Update group metadata
      const group = groups[conversationId];

      // Update latest date and message
      if (new Date(msg.createdAt) > new Date(group.latestDate)) {
        group.latestDate = msg.createdAt;
        group.latestMessage = msg.message;
      }

      // Update oldest date (to find the original message)
      if (new Date(msg.createdAt) < new Date(group.oldestDate)) {
        group.oldestDate = msg.createdAt;
      }

      // Update total attachments
      group.totalAttachments += msg.attachments?.length || 0;

      // Add category
      group.categories.add(
        msg.type === "techTeam"
          ? (msg.category as string)
          : msg.category || "other",
      );
    });

    // Convert to array and sort by latest date
    return Object.values(groups).sort(
      (a, b) =>
        new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime(),
    );
  }, [messages]);

  // Function to scroll to bottom when needed
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Find which group contains the selected message
  const isGroupSelected = (group: ConversationGroup) => {
    if (!selectedMessageId) return false;
    return group.messages.some((msg) => msg.id === selectedMessageId);
  };

  return (
    <div className="w-1/3 border-r pr-3 overflow-y-auto">
      <h3 className="font-semibold mb-3">Your Conversations</h3>
      <div className="space-y-2">
        {conversationGroups.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          conversationGroups.map((group) => (
            <div
              key={group.conversationId}
              className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/5 transition-colors ${
                isGroupSelected(group) ? "border-accent/50 bg-accent/5" : ""
              } ${group.hasUnreadMessages ? "border-accent/40" : ""}`}
              onClick={() => onSelectMessage(group.messages[0].id)}
            >
              <div className="flex justify-between mb-1">
                <h4 className="font-medium">{group.subject}</h4>
                <span className="text-xs text-muted-foreground">
                  {formatDate(group.latestDate)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-1">
                {group.latestMessage}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1 flex-wrap">
                  {Array.from(group.categories)
                    .slice(0, 1)
                    .map((category) => (
                      <CategoryBadge
                        key={category}
                        category={category as TechTeamMessageCategory}
                      />
                    ))}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span>{group.totalMessages}</span>
                  </div>

                  {group.totalAttachments > 0 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Paperclip className="h-3 w-3 ml-1 mr-1" />
                      <span>{group.totalAttachments}</span>
                    </div>
                  )}
                </div>

                {group.hasUnreadMessages && (
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-accent"></div>
                    <span className="text-xs text-accent">Unread</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {/* Add an empty div at the end to scroll into view */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default CustomerMessageList;
