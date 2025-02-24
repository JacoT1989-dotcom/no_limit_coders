import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Layout,
  MessageSquare,
  Filter,
  Download,
  ExternalLink,
  Paperclip,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TechTeamMessageAttachment,
  TechTeamMessageCategory,
  TechTeamMessageType,
} from "@/app/(customer)/customer/_components/(quick-actions)/(message_tech_team)/types";
import { Priority } from "@/app/(customer)/customer/tasks/types";

// Dummy data for demonstration
const customerMessages = [
  {
    id: "msg-001",
    subject: "Website Dashboard Not Loading",
    message:
      "I'm experiencing issues with the dashboard loading on Chrome. It shows a blank screen after login. This is affecting our entire team's productivity.",
    category: "bug" as TechTeamMessageCategory,
    messageType: "support" as TechTeamMessageType,
    priority: "HIGH" as Priority,
    createdAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    attachments: [
      { fileName: "error-screenshot.png", fileUrl: "#" },
    ] as TechTeamMessageAttachment[],
  },
  {
    id: "msg-002",
    subject: "Feature Request: Export Reports to PDF",
    message:
      "Our team would greatly benefit from being able to export our weekly reports directly to PDF format. Currently we have to use screenshots which is time-consuming.",
    category: "feature" as TechTeamMessageCategory,
    messageType: "development" as TechTeamMessageType,
    priority: "MEDIUM" as Priority,
    createdAt: new Date(Date.now() - 3 * 3600000), // 3 hours ago
    attachments: [] as TechTeamMessageAttachment[],
  },
  {
    id: "msg-003",
    subject: "Login Authentication Issues",
    message:
      "Several users in our organization are getting repeatedly logged out every few minutes. This started happening after the latest update.",
    category: "security" as TechTeamMessageCategory,
    messageType: "support" as TechTeamMessageType,
    priority: "URGENT" as Priority,
    createdAt: new Date(Date.now() - 45 * 60000), // 45 minutes ago
    attachments: [
      { fileName: "error-log.txt", fileUrl: "#" },
      { fileName: "browser-console.png", fileUrl: "#" },
    ] as TechTeamMessageAttachment[],
  },
  {
    id: "msg-004",
    subject: "Data Visualization Suggestion",
    message:
      "We'd like to request additional chart types for our analytics dashboard. Bar and line charts are great, but pie and radar charts would help us better visualize certain datasets.",
    category: "feature" as TechTeamMessageCategory,
    messageType: "design" as TechTeamMessageType,
    priority: "LOW" as Priority,
    createdAt: new Date(Date.now() - 2 * 86400000), // 2 days ago
    attachments: [
      { fileName: "mock-design.pdf", fileUrl: "#" },
    ] as TechTeamMessageAttachment[],
  },
];

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
  const diffMs = now.getTime() - date.getTime();
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

const CustomerMessageCard = () => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<Priority | null>(null);

  const filteredMessages = filter
    ? customerMessages.filter((msg) => msg.priority === filter)
    : customerMessages;

  const currentMessage = selectedMessage
    ? customerMessages.find((msg) => msg.id === selectedMessage)
    : null;

  const clearSelectedMessage = () => {
    setSelectedMessage(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <span>Customer Messages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View and respond to incoming customer messages
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Customer Messages</DialogTitle>
          <DialogDescription>
            Review and respond to messages from your customers
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-[500px] gap-4">
          {/* Message List Panel */}
          <div className="w-2/5 border rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
              <h3 className="font-medium">Recent Messages</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-1" />
                  {filter || "All"}
                </Button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredMessages.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No messages found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 cursor-pointer hover:bg-accent/5 transition-colors ${
                        selectedMessage === msg.id ? "bg-accent/10" : ""
                      }`}
                      onClick={() => setSelectedMessage(msg.id)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium truncate">{msg.subject}</h4>
                        <PriorityBadge priority={msg.priority} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {msg.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-2">
                          <CategoryBadge category={msg.category} />
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
                </div>
              )}
            </div>
          </div>

          {/* Message Detail Panel */}
          <div className="w-3/5 border rounded-lg overflow-hidden flex flex-col">
            {currentMessage ? (
              <>
                <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">
                        {currentMessage.subject}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {currentMessage.messageType}
                        </Badge>
                        <PriorityBadge priority={currentMessage.priority} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <span>
                        Received {formatDate(currentMessage.createdAt)}
                      </span>
                      <span>•</span>
                      <CategoryBadge category={currentMessage.category} />
                    </div>
                  </div>
                  <Button
                    onClick={clearSelectedMessage}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 ml-2"
                    title="Clear message view"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <p>{currentMessage.message}</p>
                  </div>

                  {currentMessage.attachments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {currentMessage.attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center p-2 rounded-md border bg-muted/20"
                          >
                            <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm flex-1 truncate">
                              {attachment.fileName}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t bg-muted/10">
                  <Button className="w-full bg-accent text-accent-foreground">
                    Reply to Customer
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a message to view details
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{customerMessages.length} total messages</span>
            <span>•</span>
            <span>
              {
                customerMessages.filter(
                  (m) => m.priority === "URGENT" || m.priority === "HIGH",
                ).length
              }{" "}
              high priority
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter Messages</span>
            </Button>
            <Button className="gap-2 bg-accent text-accent-foreground">
              <ExternalLink className="h-4 w-4" />
              <span>Open Message Center</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerMessageCard;
