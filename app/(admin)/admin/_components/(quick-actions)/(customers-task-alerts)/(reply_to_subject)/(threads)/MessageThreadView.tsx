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
import {
  formatSubject,
  formatDate,
  convertAttachmentsFormat,
  MessageThreadViewProps,
} from "./MessageThreadHelpers";

const MessageThreadView: React.FC<MessageThreadViewProps> = ({
  responses,
  isLoading,
  onRefresh,
}) => {
  // Debug logging - Log when the component renders
  useEffect(() => {
    console.log("MessageThreadView rendered with responses:", responses);
  }, [responses]);

  // Debug logging - Log detailed information about each response
  useEffect(() => {
    console.log("=== DETAILED RESPONSE DEBUGGING ===");
    if (Array.isArray(responses)) {
      responses.forEach((response, index) => {
        console.log(`Response ${index} (ID: ${response.id}):`);
        console.log(`  Subject: ${response.subject}`);
        console.log(`  Sender: ${response.sender}`);
        console.log(
          `  Preview: ${response.preview ? `"${response.preview.substring(0, 50)}..."` : "undefined"}`,
        );
        console.log(
          `  Message: ${response.message ? `"${response.message.substring(0, 50)}..."` : "undefined"}`,
        );
        console.log(`  Category: ${response.category}`);
        console.log(`  Created: ${response.createdAt}`);
        console.log(`  Attachments: ${response.attachments?.length || 0}`);

        // Log the full message for comparison
        if (response.message) {
          console.log("  FULL MESSAGE:");
          console.log(response.message);
        }

        console.log("  -----------------");
      });
    } else {
      console.log("Responses is not an array:", responses);
    }
    console.log("=== END DEBUGGING ===");
  }, [responses]);

  // Handle empty or undefined responses
  const validResponses = Array.isArray(responses) ? responses : [];

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
          {validResponses.map((response, index) => {
            // Debug: Log when rendering each response
            console.log(`Rendering response ${index} (${response.id})`);
            console.log(`Message available: ${!!response.message}`);

            return (
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
                    {/* Debug: Add a note showing what content we're using */}
                    <div className="text-xs text-muted-foreground mb-1">
                      {response.message
                        ? "Showing full message"
                        : "Showing preview only"}
                    </div>

                    <p className="mb-3 whitespace-pre-wrap break-words">
                      {/* Use message if available, otherwise fall back to preview */}
                      {response.message || response.preview}
                    </p>

                    {response.attachments &&
                      response.attachments.length > 0 &&
                      response.attachments.some(
                        (att) =>
                          !att.messageId || att.messageId === response.id,
                      ) && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs font-medium mb-2">
                            Attachments
                          </div>
                          <div className="space-y-2">
                            {response.attachments
                              .filter(
                                (att) =>
                                  !att.messageId ||
                                  att.messageId === response.id,
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
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default MessageThreadView;
