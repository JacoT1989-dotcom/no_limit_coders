"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reply, MessageSquare, Calendar, Paperclip } from "lucide-react";
import { MessageWithUser } from "./CustomerMessageCard";
import AttachmentsModal from "@/app/(customer)/customer/tasks/_components/(table)/(attachment)/AttachmentModal";
import CustomerMessageReplyDialog from "./CustomerMessageReplyDialog";
import {
  CategoryBadge,
  convertAttachments,
  formatDate,
  formatDateForGroup,
  formatMessageTime,
} from "./CustomerMessageDetailHelpers";

interface MessageDetailProps {
  message: MessageWithUser | undefined;
  onMessageResponded?: () => void;
  allMessages?: MessageWithUser[]; // All available messages to find related ones
}

interface MessageGroup {
  date: string;
  messages: MessageWithUser[];
}

const CustomerMessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onMessageResponded,
  allMessages = [],
}) => {
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

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
      <div className="w-2/3 overflow-hidden flex flex-col min-h-0 p-4 items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center h-64">
          <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Message Selected</h3>
          <p className="text-muted-foreground max-w-md">
            Select a conversation from the left to view your messages or start a
            new conversation with our support team.
          </p>
        </div>
      </div>
    );
  }

  // Determine current user ID from the first message to identify who is the customer
  const currentUserId = relatedMessages[0]?.userId;

  // Helper function to determine if message is from admin or customer
  const isAdminMessage = (msg: MessageWithUser) => {
    // If the message is from a tech team or the user ID doesn't match the current user
    return msg.type === "techTeam" || msg.userId !== currentUserId;
  };

  return (
    <div className="w-2/3 overflow-hidden flex flex-col min-h-0">
      <div className="p-4 border-b flex justify-between items-center shrink-0">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">
                {message.subject || "No Subject"}
              </h3>
            </div>
            {message.type === "techTeam" && message.messageType && (
              <Badge variant="outline" className="ml-2">
                {message.messageType}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{relatedMessages.length} messages</span>
            </div>
            <span>•</span>
            {message.type === "techTeam" && (
              <CategoryBadge category={message.category as any} />
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
        <div>
          <Button
            onClick={() => setReplyDialogOpen(true)}
            variant="default"
            size="sm"
            className="h-9"
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
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
                const isAdmin = isAdminMessage(msg);

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                        isAdmin
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {/* Message header with user info */}
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-sm">
                          {msg.user.displayName}
                          <span
                            className={`ml-2 text-xs ${isAdmin ? "text-muted-foreground" : "text-primary-foreground/70"}`}
                          >
                            {isAdmin ? "Support Team" : "You"}
                          </span>
                        </div>
                        <div
                          className={`text-xs ${isAdmin ? "text-muted-foreground" : "text-primary-foreground/70"}`}
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
                          className={`mt-2 pt-2 border-t ${isAdmin ? "border-muted-foreground/20" : "border-primary-foreground/20"}`}
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
      <CustomerMessageReplyDialog
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        message={message}
        onMessageResponded={handleMessageResponded}
      />
    </div>
  );
};

export default CustomerMessageDetail;
