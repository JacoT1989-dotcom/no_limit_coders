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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);

  // Set up filter functions
  const handlePriorityFilterChange = (newFilter: string): void => {
    setPriorityFilter(priorityFilter === newFilter ? null : newFilter);
  };

  const handleSubjectFilterChange = (value: string): void => {
    setSubjectFilter(value === "all" ? null : value);
  };

  const clearAllFilters = (): void => {
    setPriorityFilter(null);
    setSubjectFilter(null);
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

        // Extract unique subjects for the dropdown
        const subjects = response.messages.map((msg) => msg.subject);
        // Clean up subjects (remove Re: prefixes and reference numbers for comparison)
        const cleanSubjects = subjects.map((subject) => {
          // Remove Re: prefixes
          const withoutRe = subject.replace(/^(Re:\s*)+/i, "");
          // Remove reference numbers
          return withoutRe.replace(/\[Ref:[^\]]+\]/g, "").trim();
        });
        // Get unique cleaned subjects
        const uniqueCleanSubjects = Array.from(new Set(cleanSubjects));
        setUniqueSubjects(uniqueCleanSubjects);
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

  // Helper function to check if a message matches the subject filter
  const matchesSubjectFilter = (messageSubject: string) => {
    if (!subjectFilter) return true;

    // Clean the message subject (remove Re: and reference numbers)
    const cleanSubject = messageSubject
      .replace(/^(Re:\s*)+/i, "")
      .replace(/\[Ref:[^\]]+\]/g, "")
      .trim();

    return cleanSubject === subjectFilter;
  };

  // Filter messages based on selected priority and subject
  const filteredMessages = messages.filter((msg) => {
    // First check priority filter
    const passedPriorityFilter =
      !priorityFilter ||
      (msg.techTeamResponse &&
        msg.techTeamResponse.priority === priorityFilter);

    // Then check subject filter
    const passedSubjectFilter = matchesSubjectFilter(msg.subject);

    // Message must pass both filters
    return passedPriorityFilter && passedSubjectFilter;
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
      <DialogContent className="sm:max-w-6xl w-[95vw] bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card max-h-[95vh] h-[800px] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="text-2xl">My Messages</DialogTitle>
            <DialogDescription>
              View messages from the support team
            </DialogDescription>
          </div>
          <div className="w-64 mr-6">
            <Select
              value={subjectFilter || "all"}
              onValueChange={handleSubjectFilterChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map((subject, index) => (
                  <SelectItem key={index} value={subject}>
                    {subject.length > 40
                      ? subject.substring(0, 40) + "..."
                      : subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <h3 className="text-lg font-medium mb-2">Error Loading Messages</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchMessages}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end mb-4">
              {/* Active filter display */}
              {(priorityFilter || subjectFilter) && (
                <div className="flex items-center">
                  <span className="text-sm mr-2">Active filters:</span>
                  {priorityFilter && (
                    <Badge variant="secondary" className="mr-2">
                      Priority: {priorityFilter}
                    </Badge>
                  )}
                  {subjectFilter && (
                    <Badge variant="secondary" className="mr-2">
                      Subject:{" "}
                      {subjectFilter.length > 20
                        ? subjectFilter.substring(0, 20) + "..."
                        : subjectFilter}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs flex items-center"
                    onClick={clearAllFilters}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear filters
                  </Button>
                </div>
              )}
            </div>

            <div className="flex h-[650px] gap-4 overflow-hidden">
              {/* Message List Panel */}
              <MessageList
                messages={displayMessages}
                selectedMessageId={selectedMessage}
                onSelectMessage={setSelectedMessage}
                currentFilter={priorityFilter}
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
                    variant={
                      priorityFilter === option.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handlePriorityFilterChange(option.value)}
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
