import React from "react";
import { Filter, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TechTeamMessageCategory } from "@/app/(customer)/customer/_components/(quick-actions)/(message_tech_team)/types";
import { Priority } from "@/app/(customer)/customer/tasks/types";
import { MessageWithUser } from "./CustomerMessageCard";

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

interface MessageListProps {
  messages: MessageWithUser[];
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
  currentFilter: Priority | null;
  onClearFilter: () => void;
}

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
                  <PriorityBadge priority={msg.priority} />
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {msg.message}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2">
                    <CategoryBadge
                      category={msg.category as TechTeamMessageCategory}
                    />
                    {msg.attachments.length > 0 && (
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3 mr-1" />
                        {msg.attachments.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-accent">
                    {formatDate(msg.createdAt)}
                  </span>
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
