import React, { useState, ReactNode, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Filter, Loader2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MessageList from "./MessageList";
import MessageDetail from "./MessageDetail";
import { MessageCategory } from "@prisma/client";
import { getUserMessages } from "./get-admin-messages";

// Define types based on the data returned from the server
interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  messageId: string;
}

interface TechTeamResponse {
  id: string;
  subject: string;
  priority: string;
}

interface UserMessage {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  category: MessageCategory;
  isUnread: boolean;
  hasAttachment: boolean;
  createdAt: Date;
  userId: string;
  attachments: Attachment[];
  techTeamResponse: TechTeamResponse | null;
}

interface ViewMessagesModalProps {
  children: ReactNode;
}

// Priority options for filter buttons
const PRIORITY_OPTIONS = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

// Helper function to format a date for display in the message list
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now.getTime() - messageDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return `Today at ${messageDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return messageDate.toLocaleDateString(undefined, { weekday: "long" });
  } else {
    return messageDate.toLocaleDateString();
  }
};

// Convert user messages to the format expected by MessageList
const convertToMessageListFormat = (messages: UserMessage[]) => {
  return messages.map((msg) => ({
    id: msg.id,
    subject: msg.subject,
    message: msg.preview || "No preview available", // Use the admin's preview text for the list
    category: msg.category as string,
    // For priority, use the admin's priority if available, otherwise medium
    priority: msg.techTeamResponse?.priority || "MEDIUM",
    timestamp: formatTimestamp(msg.createdAt),
    attachments: msg.attachments,
    // Add sender information to clarify it's from admin
    sender: msg.sender || "Support Team",
  }));
};

// Create a detailed message object for MessageDetail component
const createDetailedMessage = (message: UserMessage) => {
  // This message IS the admin's response - display it directly
  return {
    id: message.id,
    subject: message.subject,
    message: message.preview || "",
    category: message.category as string,
    messageType: "RESPONSE", // This is always a response from admin
    priority: message.techTeamResponse?.priority || "MEDIUM",
    createdAt: message.createdAt,
    attachments:
      message.attachments?.map((att) => ({
        id: att.id,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
      })) || [], // Return empty array if attachments is undefined
    user: {
      id: "admin",
      displayName: message.sender || "Support Team",
      email: "admin@example.com", // Placeholder
    },
  };
};

const ViewMessagesModal: React.FC<ViewMessagesModalProps> = ({ children }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<UserMessage[]>([]);

  // Set up filter functions
  const handleFilterChange = (newFilter: string): void => {
    setFilter(filter === newFilter ? null : newFilter);
  };

  const clearAllFilters = (): void => {
    setFilter(null);
  };

  // Fetch messages from the server
  const fetchMessages = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await getUserMessages();

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.success && response.messages) {
        setMessages(response.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchMessages();
    }
  }, [dialogOpen]);

  // Filter messages based on selected priority
  const filteredMessages = messages.filter((msg) => {
    if (!filter) return true;

    // Check priority from tech team response (original message)
    return msg.techTeamResponse && msg.techTeamResponse.priority === filter;
  });

  // Convert messages to the format expected by the components
  const displayMessages = convertToMessageListFormat(filteredMessages);

  // Get the current selected message object
  const currentMessage = selectedMessage
    ? messages.find((msg) => msg.id === selectedMessage)
    : null;

  // Convert the current message to the format expected by MessageDetail
  const detailedMessage = currentMessage
    ? createDetailedMessage(currentMessage)
    : null;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">My Messages</DialogTitle>
          <DialogDescription>
            View messages from the support team
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-2">Loading messages...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Messages</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchMessages}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end mb-4">
              {/* Active filter display */}
              {filter && (
                <div className="flex items-center">
                  <span className="text-sm mr-2">Active filter:</span>
                  <Badge variant="secondary" className="mr-2">
                    Priority: {filter}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs flex items-center"
                    onClick={clearAllFilters}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear filter
                  </Button>
                </div>
              )}
            </div>

            <div className="flex h-[500px] gap-4">
              {/* Message List Panel */}
              <MessageList
                messages={displayMessages}
                selectedMessageId={selectedMessage}
                onSelectMessage={setSelectedMessage}
                currentFilter={filter}
                onClearFilter={clearAllFilters}
              />

              {/* Message Detail Panel */}
              <MessageDetail
                message={detailedMessage}
                onClose={() => setSelectedMessage(null)}
              />
            </div>
          </>
        )}

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{filteredMessages.length} messages</span>
            <span>•</span>
            <span>
              {
                filteredMessages.filter(
                  (m) =>
                    m.techTeamResponse &&
                    (m.techTeamResponse.priority === "URGENT" ||
                      m.techTeamResponse.priority === "HIGH"),
                ).length
              }{" "}
              high priority
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={filter === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange(option.value)}
                    className="text-xs px-2"
                  >
                    {option.value}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={fetchMessages} variant="outline" className="gap-2">
              <Loader2 className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMessagesModal;
