import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reply, X, RefreshCw } from "lucide-react";
import { MessageWithUser } from "../(reply_to_subject)/(message_card)/CustomerMessageCard";
import AttachmentsModal from "@/app/(customer)/customer/tasks/_components/(table)/(attachment)/AttachmentModal";
import MessageReplyDialog from "../(reply_to_subject)/(admin_reply)/MessageReplyDialog";
import { toast } from "sonner";
import { getMessageThread } from "../(reply_to_subject)/(threads)/getMessageThread";
import MessageThreadView from "../(reply_to_subject)/(threads)/MessageThreadView";
import {
  formatSubject,
  PriorityBadge,
  CategoryBadge,
  formatDate,
  convertAttachments,
} from "./MessageDetailHelpers";
import {
  TechTeamMessageCategory,
  ThreadResponse,
} from "@/app/(customer)/customer/_components/(quick-actions)/(message_tech_team)/types";

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
  const [threadResponses, setThreadResponses] = useState<ThreadResponse[]>([]);
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
        const responses: ThreadResponse[] = [];

        // If there's a userMessage, add it to our thread responses
        if (response.original && response.original.userMessage) {
          const userMessage = response.original.userMessage;
          console.log("Found user message in response:", userMessage);

          // IMPORTANT: Keep attachment's original messageId to maintain association
          responses.push({
            id: userMessage.id,
            sender: userMessage.sender,
            subject: userMessage.subject,
            preview: userMessage.preview || "",
            category: userMessage.category,
            createdAt: new Date(userMessage.createdAt),
            attachments: (userMessage.attachments || []).map((att) => ({
              id: att.id,
              fileName: att.fileName,
              fileUrl: att.fileUrl,
              createdAt: new Date(att.createdAt || new Date()),
              taskId: "message",
              uploaderId: "user",
              messageId: att.messageId || userMessage.id, // Ensure messageId is preserved
            })),
          });
        }

        // Add responses from the responses array
        if (
          Array.isArray(response.responses) &&
          response.responses.length > 0
        ) {
          console.log("Adding responses from array:", response.responses);
          const formattedResponses = response.responses.map((resp) => {
            // Create a clean response object
            const formattedResponse: ThreadResponse = {
              id: resp.id,
              sender: resp.sender,
              subject: resp.subject,
              preview: resp.preview,
              category: resp.category,
              createdAt: new Date(resp.createdAt),
              // IMPORTANT: Map attachments while preserving messageId
              attachments: (resp.attachments || []).map((att) => ({
                id: att.id,
                fileName: att.fileName,
                fileUrl: att.fileUrl,
                createdAt: new Date(att.createdAt || new Date()),
                taskId: "message",
                uploaderId: "user",
                messageId: att.messageId || resp.id, // Critical to preserve association
              })),
            };

            // Add debugging to verify correct attachments
            console.log(
              `Formatted response ${resp.id} with ${formattedResponse.attachments.length} attachments:`,
              formattedResponse.attachments.map((a) => ({
                id: a.id,
                fileName: a.fileName,
                messageId: a.messageId,
              })),
            );

            return formattedResponse;
          });

          responses.push(...formattedResponses);
        }

        console.log("Final thread responses:", responses);
        setThreadResponses(responses);
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
    <div className="w-3/5 border rounded-lg overflow-hidden flex flex-col min-h-0">
      {message ? (
        <>
          <div className="p-4 border-b bg-muted/30 flex justify-between items-center shrink-0">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="max-w-[85%]">
                  <h3 className="font-semibold text-lg">
                    {formatSubject(message.subject).main}
                  </h3>
                  {formatSubject(message.subject).reference && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatSubject(message.subject).reference}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
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

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4">
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
