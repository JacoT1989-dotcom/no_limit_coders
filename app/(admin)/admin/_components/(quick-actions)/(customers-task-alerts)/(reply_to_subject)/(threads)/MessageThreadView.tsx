import React, { useEffect } from "react";
import { RefreshCw, MessageSquare, Paperclip } from "lucide-react";
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

// Helper function to format subjects and extract reference numbers
const formatSubject = (
  subject: string,
): { main: string; reference: string | null } => {
  // Check if the subject starts with multiple "Re:" prefixes
  const rePattern = /^(Re:\s*)+/i;
  let mainSubject = subject;

  if (rePattern.test(subject)) {
    // Replace multiple "Re:" with just one "Re:"
    mainSubject = "Re: " + subject.replace(rePattern, "");
  }

  // Extract reference number if present
  const refPattern = /\[Ref:([^\]]+)\]/;
  const refMatch = subject.match(refPattern);

  if (refMatch) {
    // Remove reference from main subject
    mainSubject = mainSubject.replace(refPattern, "").trim();
    return {
      main: mainSubject,
      reference: refMatch[0],
    };
  }

  return {
    main: mainSubject,
    reference: null,
  };
};

// Define the types for our responses and attachments
interface ThreadResponseAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  messageId?: string;
  taskId: string;
  uploaderId: string;
}

interface ThreadResponse {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  category: string;
  createdAt: Date;
  attachments: ThreadResponseAttachment[];
}

interface MessageThreadViewProps {
  responses: ThreadResponse[];
  isLoading: boolean;
  onRefresh: () => void;
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

const MessageThreadView: React.FC<MessageThreadViewProps> = ({
  responses,
  isLoading,
  onRefresh,
}) => {
  // Debug the responses we received
  useEffect(() => {
    console.log("MessageThreadView rendered with responses:", responses);
  }, [responses]);

  // Add debugging useEffect
  useEffect(() => {
    console.log("Each response with its attachments:");
    responses.forEach((response, index) => {
      console.log(`Response ${index} (${response.id}):`, response.subject);
      console.log(
        `Attachments:`,
        response.attachments?.map((att) => ({
          id: att.id,
          fileName: att.fileName,
          messageId: att.messageId || response.id,
        })),
      );
    });
  }, [responses]);

  // Handle empty or undefined responses
  const validResponses = Array.isArray(responses) ? responses : [];

  // Convert attachments format to match what AttachmentsModal expects
  // IMPORTANT: Only include attachments that belong to the current message
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
      return att.messageId && att.messageId === messageId;
    });

    console.log(
      `Filtered ${attachments.length} attachments for message ${messageId}, returned ${filteredAttachments.length}`,
      filteredAttachments,
    );

    // Map the filtered attachments to the expected format
    return filteredAttachments.map((attachment) => ({
      id: attachment.id,
      name: attachment.fileName,
      url: attachment.fileUrl,
      createdAt: attachment.createdAt || new Date(),
      taskId: attachment.taskId || "default-task",
      uploaderId: attachment.uploaderId || "default-uploader",
    }));
  };

  if (validResponses.length === 0) {
    return (
      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium">Response History</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 px-2 text-muted-foreground"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No responses yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium">
          Response History ({validResponses.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 px-2 text-muted-foreground"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <div className="max-h-[350px] overflow-y-auto">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {validResponses.map((response, index) => (
            <AccordionItem
              key={response.id || index}
              value={response.id || `response-${index}`}
              className="border px-4 rounded-md bg-muted/5 overflow-hidden"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex flex-1 text-left items-center">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {formatSubject(response.subject).main}
                    </div>
                    {formatSubject(response.subject).reference && (
                      <div className="text-xs text-muted-foreground">
                        {formatSubject(response.subject).reference}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <span>From: {response.sender}</span>
                      <span>•</span>
                      <span>{formatDate(response.createdAt)}</span>
                      {response.attachments &&
                        response.attachments.length > 0 &&
                        response.attachments.some(
                          (att) =>
                            !att.messageId || att.messageId === response.id,
                        ) && (
                          <>
                            <span>•</span>
                            <AttachmentsBadge
                              attachments={convertAttachmentsFormat(
                                response.attachments,
                                response.id,
                              )}
                            />
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3 pt-1">
                <div className="text-sm">
                  <p className="mb-3 whitespace-pre-wrap break-words">
                    {response.preview}
                  </p>

                  {response.attachments &&
                    response.attachments.length > 0 &&
                    response.attachments.some(
                      (att) => !att.messageId || att.messageId === response.id,
                    ) && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs font-medium mb-2">
                          Attachments
                        </div>
                        <div className="space-y-2">
                          {response.attachments
                            .filter(
                              (att) =>
                                !att.messageId || att.messageId === response.id,
                            )
                            .map((attachment, i) => (
                              <div
                                key={attachment.id || `attachment-${i}`}
                                className="flex items-center justify-between p-2 rounded-lg border bg-card/80 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Paperclip className="h-4 w-4 text-primary" />
                                  <span className="text-xs truncate max-w-[250px]">
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
    </div>
  );
};

export default MessageThreadView;
