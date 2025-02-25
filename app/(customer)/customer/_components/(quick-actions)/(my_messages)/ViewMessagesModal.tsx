import React, { useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Filter, Loader2, X } from "lucide-react";
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

// Define types
interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
}

interface User {
  id: string;
  displayName: string;
  email: string;
}

interface Message {
  id: string;
  subject: string;
  message: string;
  category: string;
  messageType: string;
  priority: string;
  createdAt: Date;
  attachments: Attachment[];
  user: User;
}

// No longer need Customer interface

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

// Dummy data for the component
const DUMMY_MESSAGES: Message[] = [
  {
    id: "msg1",
    subject: "Login Page Issue",
    message:
      "I'm having trouble with the login page. It keeps showing an error when I enter my credentials.",
    category: "bug",
    messageType: "INQUIRY",
    priority: "HIGH",
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    attachments: [{ id: "att1", fileName: "screenshot.png", fileUrl: "#" }],
    user: {
      id: "user1",
      displayName: "John Doe",
      email: "john.doe@example.com",
    },
  },
  {
    id: "msg2",
    subject: "Feature Request: Dark Mode",
    message:
      "Could you add a dark mode feature to the dashboard? It would be easier on the eyes when working late.",
    category: "feature",
    messageType: "REQUEST",
    priority: "MEDIUM",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    attachments: [],
    user: {
      id: "user1",
      displayName: "John Doe",
      email: "john.doe@example.com",
    },
  },
  {
    id: "msg3",
    subject: "Security Alert",
    message:
      "I noticed that my password is being sent in plain text. This seems like a security concern.",
    category: "security",
    messageType: "ALERT",
    priority: "URGENT",
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    attachments: [
      { id: "att2", fileName: "security_log.txt", fileUrl: "#" },
      { id: "att3", fileName: "network_trace.pcap", fileUrl: "#" },
    ],
    user: {
      id: "user2",
      displayName: "Jane Smith",
      email: "jane.smith@example.com",
    },
  },
];

const ViewMessagesModal: React.FC<ViewMessagesModalProps> = ({ children }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // No longer need customer selection state

  // Set up filter functions
  const handleFilterChange = (newFilter: string): void => {
    setFilter(filter === newFilter ? null : newFilter);
  };

  const clearAllFilters = (): void => {
    setFilter(null);
  };

  // Simulate loading messages
  const fetchMessages = (): void => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Filter messages based on selected priority only
  const filteredMessages = DUMMY_MESSAGES.filter((msg) => {
    return filter ? msg.priority === filter : true;
  });

  // Get the current selected message object
  const currentMessage = selectedMessage
    ? DUMMY_MESSAGES.find((msg) => msg.id === selectedMessage)
    : null;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Messages</DialogTitle>
          <DialogDescription>
            Review and respond to messages from your customers
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-2">Loading messages...</span>
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
                messages={filteredMessages.map((msg) => ({
                  ...msg,
                  timestamp: msg.createdAt.toLocaleDateString(),
                }))}
                selectedMessageId={selectedMessage}
                onSelectMessage={setSelectedMessage}
                currentFilter={filter}
                onClearFilter={clearAllFilters}
              />

              {/* Message Detail Panel */}
              <MessageDetail
                message={currentMessage}
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
                  (m) => m.priority === "URGENT" || m.priority === "HIGH",
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
