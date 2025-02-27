import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Filter, AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TechTeamMessageAttachment,
  TechTeamMessageCategory,
  TechTeamMessageType,
  PRIORITY_OPTIONS,
} from "@/app/(customer)/customer/_components/(quick-actions)/(message_tech_team)/types";
import { Priority } from "@/app/(customer)/customer/tasks/types";
import { getConversations } from "../../get-message-actions";
import MessageList from "../../MessageList";
import MessageDetail from "../../(message_details)/MessageDetail";

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
  subject?: string; // For compatibility with existing components
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

// Customer type for our dropdown
interface Customer {
  id: string;
  displayName: string;
  email: string;
}

const CustomerMessageCard = () => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [filter, setFilter] = useState<Priority | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);

  // Define fetchConversations with useCallback - properly handling selectedCustomer dependency
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getConversations();

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.conversations) {
        const allConversations = response.conversations as Conversation[];
        setConversations(allConversations);

        // Convert conversations to a flattened array of messages for compatibility with existing UI
        const flattenedMessages: MessageWithUser[] = [];

        allConversations.forEach((conversation) => {
          // Add tech team messages
          conversation.techTeamMessages.forEach((msg) => {
            flattenedMessages.push({
              ...msg,
              type: "techTeam",
              subject: conversation.subject, // Add subject from conversation
            });
            console.log(`Added techTeam message from: ${msg.user.displayName}`);
          });

          // Add user messages
          conversation.userMessages.forEach((msg) => {
            flattenedMessages.push({
              ...msg,
              type: "user",
              subject: conversation.subject, // Add subject from conversation
            });
            console.log(`Added user message from: ${msg.user.displayName}`);
          });
        });

        setMessages(flattenedMessages);

        // Extract unique customers - look at user roles and displayNames since message types are inverted
        const uniqueCustomers = new Map<string, Customer>();

        flattenedMessages.forEach((msg) => {
          // Filter by display name to identify real customers (not admins)
          // Exclude anyone with "Admin" in their name or email
          const isAdminName = msg.user.displayName.includes("Admin");
          const isAdminEmail = msg.user.email.toLowerCase().includes("admin");

          // Include users who are real customers (not admins)
          if (
            !uniqueCustomers.has(msg.user.id) &&
            !isAdminName &&
            !isAdminEmail
          ) {
            uniqueCustomers.set(msg.user.id, {
              id: msg.user.id,
              displayName: msg.user.displayName,
              email: msg.user.email,
            });
            console.log(
              `Added customer: ${msg.user.displayName} (${msg.user.id})`,
            );
          }
        });

        setCustomers(Array.from(uniqueCustomers.values()));

        // Set first customer as default if none selected
        if (uniqueCustomers.size > 0 && !selectedCustomer) {
          setSelectedCustomer(Array.from(uniqueCustomers.values())[0].id);
        }

        // Extract unique subjects for dropdown (from conversations)
        const subjects = allConversations.map((conv) => conv.subject);
        const uniqueSubjectList = Array.from(new Set(subjects));
        setUniqueSubjects(uniqueSubjectList);
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
  }, [selectedCustomer]); // Include selectedCustomer in dependency array

  // Fetch conversations when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchConversations();
    }
  }, [dialogOpen, fetchConversations]);

  // Helper function to check if a message matches the subject filter
  const matchesSubjectFilter = (conversationSubject: string) => {
    if (!subjectFilter) return true;
    return conversationSubject === subjectFilter;
  };

  // Handler for subject filter change
  const handleSubjectFilterChange = (value: string): void => {
    setSubjectFilter(value === "all" ? null : value);
    // Clear selected message when changing subjects
    setSelectedMessage(null);
    setSelectedConversation(null);
  };

  // Filter messages by priority, selected customer, and subject
  const filteredMessages = messages.filter((msg) => {
    // When a customer is selected, show messages from that customer AND
    // any messages in the same conversations (including admin messages)
    let customerMatch = true;
    if (selectedCustomer) {
      // Get all conversation IDs that include the selected customer
      const customerConversationIds = messages
        .filter((m) => m.user.id === selectedCustomer)
        .map((m) => m.conversationId);

      // Match if the message is in any of those conversations
      customerMatch = customerConversationIds.includes(msg.conversationId);
    }

    // Filter by priority (only applies to tech team messages)
    const priorityMatch = filter
      ? msg.type === "techTeam" &&
        (msg as TechTeamMessageWithUser).priority === filter
      : true;

    // Filter by subject
    const subjectMatch = matchesSubjectFilter(msg.subject || "");

    return customerMatch && priorityMatch && subjectMatch;
  });

  const currentMessage = selectedMessage
    ? messages.find((msg) => msg.id === selectedMessage)
    : undefined;

  const clearSelectedMessage = () => {
    setSelectedMessage(null);
  };

  const handleFilterChange = (newFilter: Priority | null) => {
    setFilter(filter === newFilter ? null : newFilter);
  };

  const handleCustomerChange = (customerId: string) => {
    // Only update if a valid customer ID is provided
    if (customerId && customerId.trim() !== "") {
      setSelectedCustomer(customerId);
      // Clear selected message when changing customers
      setSelectedMessage(null);
      setSelectedConversation(null);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilter(null);
    setSubjectFilter(null);
  };

  // Handle message selection
  const handleSelectMessage = (messageId: string) => {
    setSelectedMessage(messageId);

    // Also set the selected conversation
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setSelectedConversation(message.conversationId);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <span>Customer Messages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View and respond to incoming customer messages
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-6xl w-[95vw] bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 shrink-0">
          <div>
            <DialogTitle className="text-2xl">Customer Messages</DialogTitle>
            <DialogDescription>
              Review and respond to messages from your customers
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
            <Button onClick={fetchConversations}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between shrink-0">
              {/* Customer Selector */}
              <div className="mb-4">
                <Select
                  value={selectedCustomer || undefined}
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length === 0 ? (
                      <SelectItem value="no-customers">
                        No customers found
                      </SelectItem>
                    ) : (
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.displayName} ({customer.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Active filters display */}
              {(filter || subjectFilter) && (
                <div className="mb-3 flex items-center">
                  <span className="text-sm mr-2">Active filters:</span>
                  {filter && (
                    <Badge variant="secondary" className="mr-2">
                      Priority: {filter}
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

            <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
              {/* Message List Panel */}
              <MessageList
                messages={filteredMessages}
                selectedMessageId={selectedMessage}
                onSelectMessage={handleSelectMessage}
                currentFilter={filter}
                onClearFilter={() => setFilter(null)}
              />

              {/* Message Detail Panel with access to all messages for conversation */}
              <MessageDetail
                message={currentMessage}
                onClose={clearSelectedMessage}
                onMessageResponded={fetchConversations}
                allMessages={filteredMessages.filter(
                  (msg) => msg.conversationId === selectedConversation,
                )}
              />
            </div>
          </>
        )}

        <div className="flex justify-between items-center mt-2 shrink-0">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{filteredMessages.length} messages</span>
            {selectedCustomer &&
              customers.find((c) => c.id === selectedCustomer) && (
                <>
                  <span>•</span>
                  <span>
                    {
                      customers.find((c) => c.id === selectedCustomer)
                        ?.displayName
                    }{" "}
                    ({customers.find((c) => c.id === selectedCustomer)?.email})
                  </span>
                </>
              )}
            <span>•</span>
            <span>
              {
                filteredMessages.filter(
                  (m) =>
                    m.type === "techTeam" &&
                    ((m as TechTeamMessageWithUser).priority === "URGENT" ||
                      (m as TechTeamMessageWithUser).priority === "HIGH"),
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
                    onClick={() => handleFilterChange(option.value as Priority)}
                    className="text-xs px-2"
                  >
                    {option.value}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={fetchConversations}
              variant="outline"
              className="gap-2"
            >
              <Loader2 className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerMessageCard;
