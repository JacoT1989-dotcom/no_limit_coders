import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reply, X, RefreshCw, Paperclip } from "lucide-react";

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
}

const MessageDetail: React.FC<MessageDetailProps> = ({ message, onClose }) => {
  const [replyDialogOpen, setReplyDialogOpen] = useState<boolean>(false);

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
    <div className="w-3/5 border rounded-lg overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{message.subject}</h3>
            <div className="flex items-center gap-2">
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

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          <p>{message.message}</p>
        </div>

        {message.attachments.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Attachments</h4>
            <div className="flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-1 bg-muted p-2 rounded-md text-sm"
                >
                  <Paperclip className="h-4 w-4" />
                  <span>{attachment.fileName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message thread/history section */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium">Message History</h4>
            <Button variant="ghost" size="sm" className="h-7 gap-1">
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>
          <div className="text-sm text-muted-foreground italic">
            No previous messages in this thread.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
