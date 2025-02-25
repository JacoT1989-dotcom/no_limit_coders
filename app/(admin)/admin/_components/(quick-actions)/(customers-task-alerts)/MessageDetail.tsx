import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reply, X, RefreshCw } from "lucide-react";
import { MessageWithUser } from "./CustomerMessageCard";
import { TechTeamMessageCategory } from "@/app/(customer)/customer/_components/(quick-actions)/(message_tech_team)/types";
import { Priority } from "@/app/(customer)/customer/tasks/types";
import AttachmentsModal from "@/app/(customer)/customer/tasks/_components/(table)/(attachment)/AttachmentModal";
import MessageReplyDialog from "./(reply_to_subject)/MessageReplyDialog";
import { toast } from "sonner";
import { getMessageThread } from "./(reply_to_subject)/getMessageThread";
import MessageThreadView from "./(reply_to_subject)/MessageThreadView";

// Priority badge component for better visualization
const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles = {
    LOW: "bg-blue-100 text-blue-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const CategoryBadge = ({ category }: { category: TechTeamMessageCategory }) => {
  const categoryMap: Record<
    TechTeamMessageCategory,
    { label: string; style: string }
  > = {
    bug: { label: "Bug", style: "bg-red-50 text-red-600" },
    feature: { label: "Feature", style: "bg-purple-50 text-purple-600" },
    support: { label: "Support", style: "bg-blue-50 text-blue-600" },
    access: { label: "Access", style: "bg-yellow-50 text-yellow-600" },
    performance: {
      label: "Performance",
      style: "bg-orange-50 text-orange-600",
    },
    security: { label: "Security", style: "bg-green-50 text-green-600" },
    other: { label: "Other", style: "bg-gray-50 text-gray-600" },
  };

  const { label, style } = categoryMap[category];

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${style}`}>{label}</span>
  );
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffMins < 24 * 60) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    const days = Math.floor(diffMins / (60 * 24));
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
};

// Define the TechTeamMessageAttachment type if it's not already imported
interface TechTeamMessageAttachment {
  id?: string;
  fileName: string;
  fileUrl: string;
}

// Properly typed function to convert TechTeamMessageAttachment to the format expected by AttachmentsModal
const convertAttachments = (
  attachments: TechTeamMessageAttachment[],
): {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  taskId: string;
  uploaderId: string;
}[] => {
  return attachments.map((att) => ({
    id: att.id || String(Math.random()),
    name: att.fileName,
    url: att.fileUrl,
    createdAt: new Date(),
    taskId: "message",
    uploaderId: "user",
  }));
};

interface MessageDetailProps {
  message: MessageWithUser | undefined;
  onClose: () => void;
  onMessageResponded?: () => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onClose,
  onMessageResponded,
}) => {
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [threadResponses, setThreadResponses] = useState<
    Array<{
      id: string;
      sender: string;
      subject: string;
      preview: string;
      category: string;
      createdAt: Date;
      attachments: Array<{
        id: string;
        fileName: string;
        fileUrl: string;
      }>;
    }>
  >([]);
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  // Using useCallback to memoize the function to avoid ESLint warnings
  const fetchMessageThread = React.useCallback(async () => {
    if (!message) return;

    setIsLoadingThread(true);
    try {
      const response = await getMessageThread(message.id);

      if (response.error) {
        console.error("Error fetching thread:", response.error);
        return;
      }

      // For debugging purposes
      console.log("Thread response:", response);

      // Properly handle the response structure from getMessageThread
      if (response.success) {
        // The server action returns responses within the object, but they're empty
        // Let's check if there's a userMessage in the response and include it
        const threadResponses = [];

        // If there's a userMessage, add it to our thread responses
        if (response.original && response.original.userMessage) {
          const userMessage = response.original.userMessage;
          console.log("Found user message in response:", userMessage);

          // Create a response object in the format expected by MessageThreadView
          threadResponses.push({
            id: userMessage.id,
            sender: userMessage.sender,
            subject: userMessage.subject,
            preview: userMessage.preview || "", // Use preview directly, message isn't available
            category: userMessage.category,
            createdAt: new Date(userMessage.createdAt),
            attachments: userMessage.attachments || [],
          });
        }

        // Also add any responses from the responses array (though it seems empty now)
        if (
          Array.isArray(response.responses) &&
          response.responses.length > 0
        ) {
          console.log("Adding responses from array:", response.responses);
          threadResponses.push(...response.responses);
        }

        console.log("Final thread responses:", threadResponses);
        setThreadResponses(threadResponses);
      } else {
        // If no success or empty array, set empty array
        console.log("No success in response");
        setThreadResponses([]);
      }
    } catch (error) {
      console.error("Error fetching message thread:", error);
      toast("Error", {
        description: "Failed to load message history",
      });
      // Set empty array on error
      setThreadResponses([]);
    } finally {
      setIsLoadingThread(false);
    }
  }, [message]);

  // Fetch message thread when message changes
  useEffect(() => {
    if (message) {
      fetchMessageThread();
    }
  }, [message, fetchMessageThread]);

  const handleMessageResponded = () => {
    // Log that the callback was triggered
    console.log("Message responded callback triggered");

    // Add a small delay before fetching to allow the database to update
    setTimeout(() => {
      console.log("Refreshing thread after response");
      fetchMessageThread();
    }, 500);

    // Call parent callback if provided
    if (onMessageResponded) {
      onMessageResponded();
    }
  };

  return (
    <div className="w-3/5 border rounded-lg overflow-hidden flex flex-col">
      {message ? (
        <>
          <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{message.subject}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{message.messageType}</Badge>
                  <PriorityBadge priority={message.priority} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 mt-1 text-sm text-muted-foreground">
                <span>
                  From:{" "}
                  <span className="font-medium">
                    {message.user.displayName}
                  </span>
                </span>
                <span>•</span>
                <span>{message.user.email}</span>
                <span>•</span>
                <span>Received {formatDate(message.createdAt)}</span>
                <span>•</span>
                <CategoryBadge
                  category={message.category as TechTeamMessageCategory}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setReplyDialogOpen(true)}
                variant="outline"
                size="sm"
                className="h-8"
                title="Reply to message"
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Clear message view"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <p>{message.message}</p>
            </div>

            {message.attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Attachments</h4>
                <AttachmentsModal
                  attachments={convertAttachments(message.attachments)}
                />
              </div>
            )}

            {/* Display message thread */}
            <MessageThreadView
              responses={threadResponses}
              isLoading={isLoadingThread}
              onRefresh={fetchMessageThread}
            />
          </div>

          {/* Reply Dialog */}
          <MessageReplyDialog
            open={replyDialogOpen}
            onOpenChange={setReplyDialogOpen}
            message={message}
            onMessageResponded={handleMessageResponded}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a message to view details
        </div>
      )}
    </div>
  );
};

export default MessageDetail;
