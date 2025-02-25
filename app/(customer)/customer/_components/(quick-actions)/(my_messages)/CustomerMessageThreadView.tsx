import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, MessageSquare, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AttachmentsModal, {
  AttachmentsBadge,
} from "@/app/(customer)/customer/tasks/_components/(table)/(attachment)/AttachmentModal";
import { Priority, MessageCategory } from "@prisma/client";

// Define the types for our responses and attachments
interface ThreadResponseAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  messageId?: string;
}

interface ThreadResponse {
  id: string;
  sender: string;
  subject: string;
  message: string;
  category: MessageCategory;
  priority: string;
  messageType: string;
  createdAt: Date;
  isCustomerMessage: boolean;
  attachments: ThreadResponseAttachment[];
}

interface CustomerMessageThreadViewProps {
  messageId: string;
  initialMessage?: ThreadResponse;
  onRefresh?: () => void;
}

// Function to format dates in a readable way
const formatDate = (date: Date) => {
  // Handle both Date objects and ISO strings
  const dateObj = date instanceof Date ? date : new Date(date);

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffMins < 24 * 60) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    const days = Math.floor(diffMins / (60 * 24));
    if (days < 7) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    } else {
      // For older messages, show the actual date
      return dateObj.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }
};

// Get the appropriate badge color based on priority
const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-blue-100 text-blue-700";
    case "LOW":
      return "bg-green-100 text-green-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
};

const CustomerMessageThreadView: React.FC<CustomerMessageThreadViewProps> = ({
  messageId,
  initialMessage,
  onRefresh,
}) => {
  const [responses, setResponses] = useState<ThreadResponse[]>(
    initialMessage ? [initialMessage] : [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // For debugging: log thread responses when they change
  useEffect(() => {
    if (responses && responses.length > 0) {
      console.log("Thread responses:", responses);
      console.log(
        "Customer messages:",
        responses.filter((r) => r.isCustomerMessage),
      );
      console.log(
        "Admin messages:",
        responses.filter((r) => !r.isCustomerMessage),
      );
    }
  }, [responses]);

  // Function to fetch message thread data - wrapped in useCallback to prevent infinite renders
  const fetchMessageThread = useCallback(async () => {
    if (!messageId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages/${messageId}/thread`);

      if (!response.ok) {
        throw new Error("Failed to fetch message thread");
      }

      const data = await response.json();

      if (data.success && data.messages) {
        setResponses(data.messages);
      } else {
        // If we have an initial message but the API failed, at least show that
        if (initialMessage && responses.length === 0) {
          setResponses([initialMessage]);
        }
        console.error("Error fetching message thread:", data.error);
      }
    } catch (error) {
      console.error("Error fetching message thread:", error);
      // Fallback to initial message if it exists
      if (initialMessage && responses.length === 0) {
        setResponses([initialMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messageId, initialMessage, responses.length]);

  // Fetch thread data on component mount and when messageId changes
  useEffect(() => {
    if (messageId) {
      fetchMessageThread();
    }
  }, [messageId, fetchMessageThread]);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchMessageThread();
    if (onRefresh) {
      onRefresh();
    }
  };

  // Convert attachments format to match what AttachmentsModal expects
  const convertAttachmentsFormat = (
    attachments: ThreadResponseAttachment[] | undefined,
    messageId: string,
  ): Array<{
    id: string;
    name: string;
    url: string;
    createdAt: Date;
    taskId: string;
    uploaderId: string;
  }> => {
    if (!attachments || !Array.isArray(attachments)) return [];

    // Filter attachments to only include those belonging to this message
    const filteredAttachments = attachments.filter((att) => {
      // Ensure the attachment has a valid messageId and it matches the provided messageId
      return !att.messageId || att.messageId === messageId;
    });

    // Map the filtered attachments to the expected format
    return filteredAttachments.map((attachment) => ({
      id: attachment.id,
      name: attachment.fileName,
      url: attachment.fileUrl,
      createdAt: attachment.createdAt || new Date(),
      taskId: "message", // Use placeholder since this isn't a task
      uploaderId: "customer", // Use placeholder for uploader
    }));
  };

  if (responses.length === 0) {
    return (
      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium">Message History</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 px-2 text-muted-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No message history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium">
          Message History ({responses.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="h-8 px-2 text-muted-foreground"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {responses.map((response, index) => (
          <AccordionItem
            key={response.id || index}
            value={response.id || `response-${index}`}
            className={`border px-4 rounded-md ${
              response.isCustomerMessage
                ? "bg-muted/5"
                : "bg-blue-50/30 dark:bg-blue-950/10"
            } overflow-hidden`}
          >
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex flex-1 text-left items-center">
                <div className="flex-1">
                  <div className="font-medium text-sm">{response.subject}</div>
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                    <span
                      className={
                        response.isCustomerMessage
                          ? "font-semibold text-primary"
                          : ""
                      }
                    >
                      {response.isCustomerMessage ? "You" : response.sender}
                    </span>
                    <span>•</span>
                    <span>{formatDate(response.createdAt)}</span>
                    {response.messageType && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {response.messageType}
                        </span>
                      </>
                    )}
                    {response.priority && (
                      <>
                        <span>•</span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${getPriorityBadgeClass(
                            response.priority,
                          )}`}
                        >
                          {response.priority}
                        </span>
                      </>
                    )}
                    {response.attachments &&
                      response.attachments.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <Paperclip className="h-3 w-3 mr-1" />
                            {response.attachments.length}
                          </span>
                        </>
                      )}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 pt-1">
              <div className="text-sm">
                <p className="mb-3 whitespace-pre-wrap">{response.message}</p>

                {response.attachments && response.attachments.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs font-medium mb-2">Attachments</div>
                    <div className="space-y-2">
                      {response.attachments.map((attachment, i) => (
                        <div
                          key={attachment.id || `attachment-${i}`}
                          className="flex items-center justify-between p-2 rounded-lg border bg-card/80 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-primary" />
                            <span className="text-xs truncate max-w-[300px]">
                              {attachment.fileName}
                            </span>
                          </div>
                          <AttachmentsModal
                            attachments={convertAttachmentsFormat(
                              [attachment],
                              response.id,
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default CustomerMessageThreadView;
