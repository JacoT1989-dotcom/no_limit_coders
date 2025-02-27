import React, { useMemo } from "react";
import { Filter, Paperclip, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TechTeamMessageCategory } from "@/app/(customer)/customer/_components/(quick-actions)/(message_tech_team)/types";
import { Priority } from "@/app/(customer)/customer/tasks/types";
import { MessageWithUser } from "./(reply_to_subject)/(message_card)/CustomerMessageCard";

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

  const { label, style } = categoryMap[category] || {
    label: category,
    style: "bg-gray-50 text-gray-600",
  };

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

// Function to format date in a more readable format
const formatDateFull = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface ConversationGroup {
  conversationId: string;
  subject: string;
  messages: MessageWithUser[];
  latestDate: Date;
  oldestDate: Date;
  highestPriority: Priority;
  totalAttachments: number;
  categories: Set<string>;
  originalSender: {
    id: string;
    displayName: string;
    email: string;
  };
  totalMessages: number;
  uniqueUsers: Set<string>;
  hasUnreadMessages: boolean;
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

  // Group messages by conversation
  const conversationGroups = useMemo(() => {
    const groups: Record<string, ConversationGroup> = {};

    messages.forEach((msg) => {
      const conversationId = msg.conversationId;
      const subject = msg.subject || "No Subject";

      if (!groups[conversationId]) {
        groups[conversationId] = {
          conversationId,
          subject,
          messages: [],
          latestDate: msg.createdAt,
          oldestDate: msg.createdAt,
          highestPriority:
            msg.type === "techTeam" && msg.priority ? msg.priority : "LOW",
          totalAttachments: 0,
          categories: new Set<string>(),
          originalSender: {
            id: msg.user.id,
            displayName: msg.user.displayName,
            email: msg.user.email,
          },
          totalMessages: 0,
          uniqueUsers: new Set<string>(),
          hasUnreadMessages: false,
        };
      }

      // Add message to group
      groups[conversationId].messages.push(msg);
      groups[conversationId].totalMessages++;
      groups[conversationId].uniqueUsers.add(msg.user.id);

      // Check for unread messages
      if (msg.type === "user" && "isUnread" in msg && msg.isUnread === true) {
        groups[conversationId].hasUnreadMessages = true;
      }

      // Update group metadata
      const group = groups[conversationId];

      // Update latest date
      if (new Date(msg.createdAt) > new Date(group.latestDate)) {
        group.latestDate = msg.createdAt;
      }

      // Update oldest date (to find the original message)
      if (new Date(msg.createdAt) < new Date(group.oldestDate)) {
        group.oldestDate = msg.createdAt;
        // Update original sender to the earliest message sender
        group.originalSender = {
          id: msg.user.id,
          displayName: msg.user.displayName,
          email: msg.user.email,
        };
      }

      // Update highest priority (URGENT > HIGH > MEDIUM > LOW)
      const priorityRank = {
        URGENT: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };

      if (
        msg.type === "techTeam" &&
        msg.priority &&
        priorityRank[msg.priority] > priorityRank[group.highestPriority]
      ) {
        group.highestPriority = msg.priority;
      }

      // Update total attachments
      group.totalAttachments += msg.attachments?.length || 0;

      // Add category
      group.categories.add(
        msg.type === "techTeam"
          ? (msg.category as string)
          : msg.category || "other",
      );
    });

    // Convert to array and sort by latest date
    return Object.values(groups).sort(
      (a, b) =>
        new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime(),
    );
  }, [messages]);

  // Function to scroll to bottom when needed
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Find which group contains the selected message
  const isGroupSelected = (group: ConversationGroup) => {
    if (!selectedMessageId) return false;
    return group.messages.some((msg) => msg.id === selectedMessageId);
  };

  return (
    <div className="w-2/5 border rounded-lg overflow-hidden flex flex-col min-h-0">
      <div className="p-3 border-b bg-muted/30 flex justify-between items-center shrink-0">
        <h3 className="font-medium">Conversations</h3>
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
        {conversationGroups.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No messages found
          </div>
        ) : (
          <div className="divide-y">
            {conversationGroups.map((group) => (
              <div
                key={group.conversationId}
                className={`p-3 cursor-pointer hover:bg-accent/5 transition-colors ${
                  isGroupSelected(group) ? "bg-accent/10" : ""
                } ${group.hasUnreadMessages ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                onClick={() => onSelectMessage(group.messages[0].id)}
              >
                <div className="flex justify-between items-start">
                  <div className="max-w-[80%]">
                    <h4 className="font-medium flex items-center">
                      <span>{group.subject}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {group.messages.length}
                      </Badge>
                      {group.hasUnreadMessages && (
                        <Badge
                          variant="default"
                          className="ml-2 text-xs bg-blue-500"
                        >
                          New
                        </Badge>
                      )}
                    </h4>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Started by:</span>{" "}
                      {group.originalSender.displayName}
                    </div>
                  </div>
                  <PriorityBadge priority={group.highestPriority} />
                </div>

                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {group.messages[group.messages.length - 1].message}
                </p>

                <div className="flex flex-col gap-1 mt-2">
                  {/* Messages count and date range */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>
                        {group.totalMessages} messages •{" "}
                        {group.uniqueUsers.size} participants
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDateFull(group.oldestDate)} -{" "}
                        {formatDateFull(group.latestDate)}
                      </span>
                    </div>
                  </div>

                  {/* Categories and attachment count */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      {Array.from(group.categories)
                        .slice(0, 2)
                        .map((category) => (
                          <CategoryBadge
                            key={category}
                            category={category as TechTeamMessageCategory}
                          />
                        ))}
                      {group.categories.size > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.categories.size - 2} more
                        </Badge>
                      )}
                      {group.totalAttachments > 0 && (
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {group.totalAttachments}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-accent">
                      Updated {formatDate(group.latestDate)}
                    </span>
                  </div>
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
