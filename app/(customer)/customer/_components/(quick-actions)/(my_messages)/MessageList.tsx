import React from "react";
import { Filter, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  timestamp: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
  }>;
}

interface MessageListProps {
  messages: Message[];
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
  currentFilter: string | null;
  onClearFilter: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedMessageId,
  onSelectMessage,
  currentFilter,
  onClearFilter,
}) => {
  // Add a reference to the messages container
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Function to scroll to bottom when needed
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  return (
    <div className="w-2/5 border rounded-lg overflow-hidden flex flex-col min-h-0">
      <div className="p-3 border-b bg-muted/30 flex justify-between items-center shrink-0">
        <h3 className="font-medium">Recent Messages</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={onClearFilter}
          >
            <Filter className="h-4 w-4 mr-1" />
            {currentFilter || "All"}
          </Button>
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        {messages.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No messages found
          </div>
        ) : (
          <div className="divide-y">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 cursor-pointer hover:bg-accent/5 transition-colors ${
                  selectedMessageId === msg.id ? "bg-accent/10" : ""
                }`}
                onClick={() => onSelectMessage(msg.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="max-w-[80%]">
                    <h4 className="font-medium">
                      {formatSubject(msg.subject).main}
                    </h4>
                    {formatSubject(msg.subject).reference && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatSubject(msg.subject).reference}
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    {msg.priority}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {msg.message}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600">
                      {msg.category}
                    </span>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3 mr-1" />
                        {msg.attachments.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-accent">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {/* Add an empty div at the end to scroll into view */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
