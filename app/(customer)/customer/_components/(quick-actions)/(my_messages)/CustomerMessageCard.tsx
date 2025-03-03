"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Mail, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TechTeamMessageAttachment,
  TechTeamMessageCategory,
  TechTeamMessageType,
} from "@/app/(customer)/customer/_components/(quick-actions)/(message_tech_team)/types";
import { Priority } from "@/app/(customer)/customer/tasks/types";

import CustomerMessageList from "./CustomerMessageList";
import {
  getCustomerConversations,
  getCustomerUnreadCount,
  markCustomerMessagesAsRead,
} from "./get-customer-message-actions";
import CustomerMessageDetail from "./CustomerMessageDetail";

// Types for our conversation and message structure
export interface Conversation {
  id: string;
  subject: string;
  createdAt: Date;
  updatedAt: Date;
  techTeamMessages: TechTeamMessageWithUser[];
  userMessages: UserMessageWithUser[];
}

export interface TechTeamMessageWithUser {
  id: string;
  message: string;
  category: TechTeamMessageCategory;
  messageType: TechTeamMessageType;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  conversationId: string;
  attachments: TechTeamMessageAttachment[];
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
    role?: string;
  };
}

export interface UserMessageWithUser {
  id: string;
  sender: string;
  preview: string;
  message: string;
  category: string;
  isUnread: boolean;
  hasAttachment: boolean;
  createdAt: Date;
  isInitial: boolean;
  userId: string;
  conversationId: string;
  attachments: MessageAttachment[];
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
    role?: string;
  };
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  messageId: string;
}

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
  conversationId: string;
  attachments: TechTeamMessageAttachment[] | MessageAttachment[];
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
    role?: string;
  };
}

const CustomerMessageCard = () => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Define fetchConversations with useCallback
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCustomerConversations();

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.conversations) {
        const allConversations = response.conversations as Conversation[];
        setConversations(allConversations);

        // Convert conversations to a flattened array of messages for compatibility with UI
        const flattenedMessages: MessageWithUser[] = [];

        allConversations.forEach((conversation) => {
          // Add tech team messages
          conversation.techTeamMessages.forEach((msg) => {
            flattenedMessages.push({
              ...msg,
              type: "techTeam",
              subject: conversation.subject, // Add subject from conversation
            });
          });

          // Add user messages
          conversation.userMessages.forEach((msg) => {
            flattenedMessages.push({
              ...msg,
              type: "user",
              subject: conversation.subject, // Add subject from conversation
            });
          });
        });

        setMessages(flattenedMessages);
      } else {
        setConversations([]);
        setMessages([]);
      }
    } catch (err) {
      setError("Failed to load messages. Please try again.");
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getCustomerUnreadCount();
      if (response.success && typeof response.unreadCount === "number") {
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  // Fetch conversations when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchConversations();
    }
  }, [dialogOpen, fetchConversations]);

  // Fetch unread count on initial load and periodically
  useEffect(() => {
    fetchUnreadCount();

    // Set up periodic checking for new messages (every 30 seconds)
    const intervalId = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(intervalId);
  }, [fetchUnreadCount]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (selectedConversation) {
      markCustomerMessagesAsRead(selectedConversation)
        .then(() => {
          // Refresh unread count after marking messages as read
          fetchUnreadCount();
        })
        .catch((error) => {
          console.error("Error marking messages as read:", error);
        });
    }
  }, [selectedConversation, fetchUnreadCount]);

  const currentMessage = selectedMessage
    ? messages.find((msg) => msg.id === selectedMessage)
    : undefined;

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessage(messageId);

    // Also set the selected conversation
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setSelectedConversation(message.conversationId);
    }
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300"
        onClick={() => setDialogOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="rounded-lg bg-accent/10 p-2 relative">
              <MessageSquare className="h-6 w-6 text-accent" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </div>
            <span>Support Messages</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread message${unreadCount > 1 ? "s" : ""} from our team`
              : "View and respond to support conversations"}
          </p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-6xl w-[95vw] bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 shrink-0">
            <div>
              <DialogTitle className="text-2xl">Support Messages</DialogTitle>
              <DialogDescription>
                View and respond to messages from our support team
              </DialogDescription>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center h-[500px]">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2">Loading messages...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Error Loading Messages
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchConversations}>Try Again</Button>
            </div>
          ) : (
            <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
              {/* Message List Panel */}
              <CustomerMessageList
                messages={messages}
                selectedMessageId={selectedMessage}
                onSelectMessage={handleSelectMessage}
              />

              {/* Message Detail Panel */}
              <CustomerMessageDetail
                message={currentMessage}
                onMessageResponded={fetchConversations}
                allMessages={
                  selectedConversation
                    ? messages.filter(
                        (msg) => msg.conversationId === selectedConversation,
                      )
                    : []
                }
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-2 shrink-0">
            <div className="text-sm text-muted-foreground">
              {messages.length > 0
                ? `${messages.length} messages in ${conversations.length} conversations`
                : "No messages yet"}
            </div>
            <Button onClick={fetchConversations} variant="outline" size="sm">
              <Loader2 className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerMessageCard;
