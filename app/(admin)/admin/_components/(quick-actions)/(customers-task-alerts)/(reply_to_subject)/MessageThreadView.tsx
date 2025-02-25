import React from "react";
import { Paperclip, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MessageThreadViewProps {
  responses: Array<{
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
  }>;
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
  React.useEffect(() => {
    console.log("MessageThreadView rendered with responses:", responses);
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
                  <div className="font-medium text-sm">{response.subject}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>From: {response.sender}</span>
                    <span>•</span>
                    <span>{formatDate(response.createdAt)}</span>
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
                <p className="mb-3">{response.preview}</p>

                {response.attachments && response.attachments.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs font-medium mb-2">Attachments</div>
                    <div className="space-y-2">
                      {response.attachments.map((attachment, i) => (
                        <a
                          key={attachment.id || `attachment-${i}`}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center p-2 border rounded hover:bg-muted/20 transition-colors"
                        >
                          <Paperclip className="h-3 w-3 mr-2" />
                          {attachment.fileName}
                        </a>
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

export default MessageThreadView;
