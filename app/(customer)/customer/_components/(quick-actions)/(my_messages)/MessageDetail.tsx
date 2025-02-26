import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reply, X, RefreshCw, Paperclip } from "lucide-react";
import CustomerReplyDialog from "./CustomerReplyDialog";
import AttachmentsModal from "../../../tasks/_components/(table)/(attachment)/AttachmentModal";
import CustomerMessageThreadView from "./CustomerMessageThreadView";

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

interface MessageDetailProps {
  message: Message | null | undefined;
  onClose: () => void;
  onMessageReplied?: () => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onClose,
  onMessageReplied,
}) => {
  const [replyDialogOpen, setReplyDialogOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Helper function to simplify multiple "Re:" prefixes and format reference numbers
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

  const formatDate = (date: Date): string => {
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

  // Convert attachments to the format expected by AttachmentsModal
  const convertAttachments = (attachments: Attachment[]) => {
    if (!attachments || !Array.isArray(attachments)) return [];

    // Ensure each attachment has a unique ID and is correctly mapped
    return attachments.map((att) => ({
      id: att.id || String(Math.random()), // Fallback for missing IDs
      name: att.fileName,
      url: att.fileUrl,
      createdAt: new Date(), // Use current date as fallback if not available
      taskId: "message", // Use placeholder since this isn't a task
      uploaderId: "admin", // Use placeholder for uploader
    }));
  };

  const handleMessageSent = () => {
    if (onMessageReplied) {
      onMessageReplied();
    }
    // Refresh the thread view when a new message is sent
    setRefreshKey((prev) => prev + 1);
  };

  // Handle thread refresh
  const handleThreadRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!message) {
    return (
      <div className="w-3/5 border rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a message to view details
        </div>
      </div>
    );
  }

  return (
    <div className="w-3/5 border rounded-lg overflow-hidden flex flex-col max-h-full">
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
              <span
                className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700`}
              >
                {message.priority}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 mt-1 text-sm text-muted-foreground">
            <span>
              From:{" "}
              <span className="font-medium">{message.user.displayName}</span>
            </span>
            <span>•</span>
            <span>{message.user.email}</span>
            <span>•</span>
            <span>Received {formatDate(message.createdAt)}</span>
            <span>•</span>
            <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600">
              {message.category}
            </span>
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

          {/* Message thread/history section */}
          <CustomerMessageThreadView
            key={`thread-${message.id}-${refreshKey}`}
            messageId={message.id}
            onRefresh={handleThreadRefresh}
          />
        </div>
      </div>

      {/* Reply Dialog */}
      <CustomerReplyDialog
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        message={{
          id: message.id,
          subject: message.subject,
          sender: message.user.displayName,
          message: message.message,
        }}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default MessageDetail;
