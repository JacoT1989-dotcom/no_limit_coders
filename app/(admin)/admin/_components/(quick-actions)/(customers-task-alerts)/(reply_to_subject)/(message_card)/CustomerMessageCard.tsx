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
import { getTechTeamMessages } from "../../get-message-actions";
import MessageList from "../../MessageList";
import MessageDetail from "../../(message_details)/MessageDetail";

// Type for our messages with all required fields
export interface MessageWithUser {
  id: string;
  subject: string;
  message: string;
  category: TechTeamMessageCategory;
  messageType: TechTeamMessageType;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  attachments: TechTeamMessageAttachment[];
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
    // Other user fields as needed
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
  const [filter, setFilter] = useState<Priority | null>(null);
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  // State for subject filtering
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);

  // Define fetchMessages with useCallback
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getTechTeamMessages();

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.messages) {
        const allMessages = response.messages as MessageWithUser[];
        setMessages(allMessages);

        // Extract unique customers from messages
        const uniqueCustomers = Array.from(
          new Map(
            allMessages.map((msg) => [
              msg.user.id,
              {
                id: msg.user.id,
                displayName: msg.user.displayName,
                email: msg.user.email,
              },
            ]),
          ).values(),
        );

        setCustomers(uniqueCustomers);

        // Set first customer as default if none selected
        if (uniqueCustomers.length > 0 && !selectedCustomer) {
          setSelectedCustomer(uniqueCustomers[0].id);
        }

        // Extract unique normalized subjects for dropdown
        const subjects = allMessages.map((msg) => msg.subject);
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
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError("Failed to load messages. Please try again.");
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCustomer]);

  // Fetch messages when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchMessages();
    }
  }, [dialogOpen, fetchMessages]);

  // Helper function to normalize subjects for grouping
  const normalizeSubject = (subject: string): string => {
    // Remove Re: prefixes
    const withoutRe = subject.replace(/^(Re:\s*)+/i, "");
    // Remove reference numbers
    const withoutRef = withoutRe.replace(/\[Ref:[^\]]+\]/g, "").trim();
    return withoutRef;
  };

  // Helper function to check if a message matches the subject filter
  const matchesSubjectFilter = (messageSubject: string) => {
    if (!subjectFilter) return true;
    return normalizeSubject(messageSubject) === subjectFilter;
  };

  // Handler for subject filter change
  const handleSubjectFilterChange = (value: string): void => {
    setSubjectFilter(value === "all" ? null : value);
    // Clear selected message when changing subjects
    setSelectedMessage(null);
  };

  // Filter messages by priority, selected customer, and subject
  const filteredMessages = messages.filter((msg) => {
    // Filter by customer
    const customerMatch = selectedCustomer
      ? msg.user.id === selectedCustomer
      : true;
    // Filter by priority
    const priorityMatch = filter ? msg.priority === filter : true;
    // Filter by subject
    const subjectMatch = matchesSubjectFilter(msg.subject);

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
    setSelectedCustomer(customerId);
    // Clear selected message when changing customers
    setSelectedMessage(null);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilter(null);
    setSubjectFilter(null);
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
            <Button onClick={fetchMessages}>Try Again</Button>
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
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.displayName} ({customer.email})
                      </SelectItem>
                    ))}
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
                onSelectMessage={setSelectedMessage}
                currentFilter={filter}
                onClearFilter={() => setFilter(null)}
              />

              {/* Message Detail Panel with access to all messages for grouping */}
              <MessageDetail
                message={currentMessage}
                onClose={clearSelectedMessage}
                onMessageResponded={fetchMessages}
                allMessages={filteredMessages}
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
                    onClick={() => handleFilterChange(option.value as Priority)}
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

export default CustomerMessageCard;
