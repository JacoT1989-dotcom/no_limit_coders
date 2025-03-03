"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reply, MessageSquare, Calendar, Paperclip } from "lucide-react";
import { MessageWithUser } from "./CustomerMessageCard";
import AttachmentsModal from "@/app/(customer)/customer/tasks/_components/(table)/(attachment)/AttachmentModal";
import {
  CategoryBadge,
  convertAttachments,
  formatDate,
  formatDateForGroup,
  formatMessageTime,
} from "./CustomerMessageDetailHelpers";
import CustomerMessageReplyDialog from "./(reply_to_admin)/CustomerMessageReplyDialog";

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

    // Skip the initial message when grouping
    const initialMessageId =
      relatedMessages.length > 0 ? relatedMessages[0].id : null;

    relatedMessages.forEach((msg) => {
      // Skip the initial message in the regular groups
      if (msg.id === initialMessageId && msg.type === "user") {
        return;
      }

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
            new conversation. To Start a new conversation-topic to talk about,
            exit this modal and click on Create Subject Message.
          </p>
        </div>
      </div>
    );
  }

  // Get the initial message - will always be the first message
  const initialMessage = relatedMessages[0];
  const isInitialFromCustomer =
    initialMessage && initialMessage.type === "user";

  // Determine current user ID from the messages
  const currentUserId = relatedMessages.find(
    (msg) => msg.type === "user",
  )?.userId;

  // Helper function to determine if message is from admin or customer
  const isAdminMessage = (msg: MessageWithUser) => {
    // If the message is from a tech team or the user ID doesn't match the current user
    return msg.type === "techTeam" || msg.userId !== currentUserId;
  };

  return (
    <div className="w-2/3 overflow-hidden flex flex-col min-h-0">
      <div className="p-5 border-b bg-gradient-to-r from-background to-accent/5 flex justify-between items-center shrink-0 shadow-sm">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-xl text-foreground">
                {message.subject || "No Subject"}
              </h3>
            </div>
            {message.type === "techTeam" && message.messageType && (
              <Badge variant="secondary" className="ml-3 px-2 py-1 capitalize">
                {message.messageType}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded-full">
              <MessageSquare className="h-3.5 w-3.5 text-accent" />
              <span>{relatedMessages.length} messages</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
            {message.type === "techTeam" && (
              <div className="px-2 py-1 bg-background/50 rounded-full">
                <CategoryBadge category={message.category as any} />
              </div>
            )}
            {message.type === "user" && (
              <Badge variant="outline" className="bg-background/50">
                {message.category}
              </Badge>
            )}
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
            <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded-full">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              <span>{formatDate(message.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="ml-4">
          <Button
            onClick={() => setReplyDialogOpen(true)}
            variant="default"
            size="sm"
            className="h-10 px-4 bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm"
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
        </div>
      </div>

      {/* Chat-style message view */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {/* Initial customer message shown as a red block with white text */}
        {isInitialFromCustomer && (
          <div className="flex justify-center mb-8">
            <div className="w-4/5 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg p-6 shadow-lg border border-red-500/20 transform hover:scale-[1.01] transition-transform duration-200">
              <div className="flex items-center justify-center mb-3">
                <Badge className="bg-white/20 text-white text-xs uppercase tracking-wide px-3 py-1 rounded-full">
                  Initial Request
                </Badge>
              </div>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {initialMessage.message}
              </div>

              {/* Attachments if any */}
              {initialMessage.attachments &&
                initialMessage.attachments.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/30">
                    <div className="flex items-center gap-2 text-xs text-white/80 mb-2">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span>
                        {initialMessage.attachments.length} Attachment
                        {initialMessage.attachments.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-md">
                      <AttachmentsModal
                        attachments={convertAttachments(
                          initialMessage.attachments,
                        )}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Regular message groups */}
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {/* Date header */}
            <div className="flex justify-center mb-4">
              <div className="px-4 py-1.5 bg-accent/10 rounded-full text-xs font-medium text-accent shadow-sm border border-accent/10">
                {group.date}
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-6">
              {group.messages.map((msg) => {
                const isAdmin = isAdminMessage(msg);

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow duration-200 ${
                        isAdmin
                          ? "bg-gradient-to-br from-muted/80 to-muted text-foreground rounded-tl-sm"
                          : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm"
                      }`}
                      style={{
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: isAdmin
                          ? "rgba(0,0,0,0.05)"
                          : "rgba(255,255,255,0.1)",
                      }}
                    >
                      {/* Message header with user info */}
                      <div
                        className="flex justify-between items-center mb-2 pb-1 border-b border-opacity-10"
                        style={{
                          borderColor: isAdmin
                            ? "rgba(0,0,0,0.1)"
                            : "rgba(255,255,255,0.2)",
                        }}
                      >
                        <div className="font-medium text-sm flex items-center">
                          {isAdmin && (
                            <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs text-accent">
                                {msg.user.displayName.charAt(0)}
                              </span>
                            </div>
                          )}
                          {msg.user.displayName}
                          <Badge
                            variant={isAdmin ? "outline" : "secondary"}
                            className={`ml-2 text-xs ${isAdmin ? "" : "bg-white/10 text-white"}`}
                          >
                            {isAdmin ? "Support Team" : "You"}
                          </Badge>
                        </div>
                        <div
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isAdmin
                              ? "bg-background/50 text-muted-foreground"
                              : "bg-white/10 text-primary-foreground/90"
                          }`}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>

                      {/* Message content */}
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </div>

                      {/* Attachments if any */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div
                          className={`mt-3 pt-2 border-t ${
                            isAdmin
                              ? "border-foreground/10"
                              : "border-primary-foreground/20"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs mb-2">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span>
                              {msg.attachments.length} Attachment
                              {msg.attachments.length > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div
                            className={`p-2 rounded-md ${
                              isAdmin ? "bg-background/50" : "bg-white/10"
                            }`}
                          >
                            <AttachmentsModal
                              attachments={convertAttachments(msg.attachments)}
                            />
                          </div>
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
