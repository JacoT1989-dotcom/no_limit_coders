import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reply, X, MessageSquare, Calendar, Paperclip } from "lucide-react";
import { MessageWithUser } from "../(reply_to_subject)/(message_card)/CustomerMessageCard";
import AttachmentsModal from "@/app/(customer)/customer/tasks/_components/(table)/(attachment)/AttachmentModal";
import MessageReplyDialog from "../(reply_to_subject)/(admin_reply)/MessageReplyDialog";
import { toast } from "sonner";
import {
  formatSubject,
  PriorityBadge,
  CategoryBadge,
  formatDate,
  convertAttachments,
} from "./MessageDetailHelpers";
import { TechTeamMessageCategory } from "@/app/(customer)/customer/_components/(quick-actions)/(message_tech_team)/types";
import { markMessagesAsRead } from "../(reply_to_subject)/(admin_reply)/reply-message-actions";

// Format date for message groups
const formatDateForGroup = (date: Date): string => {
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

// Format time for messages
const formatMessageTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface MessageDetailProps {
  message: MessageWithUser | undefined;
  onClose: () => void;
  onMessageResponded?: () => void;
  allMessages?: MessageWithUser[]; // All available messages to find related ones
}

interface MessageGroup {
  date: string;
  messages: MessageWithUser[];
}

const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onClose,
  onMessageResponded,
  allMessages = [],
}) => {
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  // Mark messages as read when they're viewed
  useEffect(() => {
    if (message && message.conversationId) {
      // Only mark as read if there are any unread messages
      const hasUnreadMessages = allMessages.some(
        (msg) => msg.type === "user" && "isUnread" in msg && msg.isUnread,
      );

      if (hasUnreadMessages) {
        markMessagesAsRead(message.conversationId).catch((err) => {
          console.error("Error marking messages as read:", err);
        });
      }
    }
  }, [message, allMessages]);

  // Sort messages chronologically
  const relatedMessages = useMemo(() => {
    if (!message || allMessages.length === 0)
      return [message].filter(Boolean) as MessageWithUser[];

    // Get all messages from the same conversation
    return allMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [message, allMessages]);

  // Group messages by date
  const messageGroups = useMemo(() => {
    const groups: MessageGroup[] = [];

    relatedMessages.forEach((msg) => {
      const dateStr = formatDateForGroup(msg.createdAt);

      // Find existing group or create new one
      let group = groups.find((g) => g.date === dateStr);
      if (!group) {
        group = { date: dateStr, messages: [] };
        groups.push(group);
      }

      group.messages.push(msg);
    });

    return groups;
  }, [relatedMessages]);

  const handleMessageResponded = () => {
    // Call parent callback if provided
    if (onMessageResponded) {
      onMessageResponded();
    }
  };

  if (!message) {
    return (
      <div className="w-3/5 border rounded-lg overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a message to view details
        </div>
      </div>
    );
  }

  // Get a unique customer ID to use for comparison (the original message sender)
  // We'll find the earliest message and use that user as our customer reference
  const firstMessage = relatedMessages.length > 0 ? relatedMessages[0] : null;
  const customerId = firstMessage?.user.id || null;

  // Helper function to determine if message is from admin or customer
  const isCustomerMessage = (msg: MessageWithUser) => {
    // If first message was from a customer and the current message has the same user ID
    // OR if the message is of type 'user' (indicates a message sent by a customer)
    return (
      (firstMessage?.type === "user" && msg.user.id === customerId) ||
      msg.type === "user"
    );
  };

  return (
    <div className="w-3/5 border rounded-lg overflow-hidden flex flex-col min-h-0">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center shrink-0">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="max-w-[85%]">
              <h3 className="font-semibold text-lg">
                {message.subject || "No Subject"}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {message.type === "techTeam" && message.messageType && (
                <Badge variant="outline">{message.messageType}</Badge>
              )}
              {message.type === "techTeam" && message.priority && (
                <PriorityBadge priority={message.priority} />
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{relatedMessages.length} messages</span>
            </div>
            <span>•</span>
            {message.type === "techTeam" && (
              <CategoryBadge
                category={message.category as TechTeamMessageCategory}
              />
            )}
            {message.type === "user" && (
              <Badge variant="outline">{message.category}</Badge>
            )}
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(message.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setReplyDialogOpen(true)}
            variant="outline"
            size="sm"
            className="h-8"
            title="Reply to conversation"
          >
            <Reply className="h-4 w-4 mr-1" />
            Reply
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Close conversation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat-style message view */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {/* Date header */}
            <div className="flex justify-center mb-4">
              <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                {group.date}
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-4">
              {group.messages.map((msg) => {
                const isCustomer = isCustomerMessage(msg);

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                        isCustomer
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {/* Message header with user info */}
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-sm">
                          {msg.user.displayName}
                          <span
                            className={`ml-2 text-xs ${isCustomer ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                          >
                            {isCustomer ? "Customer" : "Admin"}
                          </span>
                        </div>
                        <div
                          className={`text-xs ${isCustomer ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>

                      {/* Message content */}
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.message}
                      </div>

                      {/* Attachments if any */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div
                          className={`mt-2 pt-2 border-t ${isCustomer ? "border-primary-foreground/20" : "border-muted-foreground/20"}`}
                        >
                          <div className="flex items-center gap-1 text-xs mb-1">
                            <Paperclip className="h-3 w-3" />
                            <span>
                              {msg.attachments.length} Attachment
                              {msg.attachments.length > 1 ? "s" : ""}
                            </span>
                          </div>
                          <AttachmentsModal
                            attachments={convertAttachments(msg.attachments)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Dialog */}
      <MessageReplyDialog
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        message={message}
        onMessageResponded={handleMessageResponded}
      />
    </div>
  );
};

export default MessageDetail;
