import React, { useState, ReactNode } from "react";
import { MessageSquare, Search, Paperclip, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ViewMessagesModalProps {
  children: ReactNode;
}

interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  isUnread: boolean;
  hasAttachment: boolean;
  category: string;
}

const ViewMessagesModal: React.FC<ViewMessagesModalProps> = ({ children }) => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Sample messages data
  const messages: Message[] = [
    {
      id: "1",
      sender: "Sarah Chen",
      subject: "Website Redesign Feedback",
      preview:
        "I've reviewed the latest design changes and have some suggestions...",
      timestamp: "2 hours ago",
      isUnread: true,
      hasAttachment: true,
      category: "design",
    },
    {
      id: "2",
      sender: "Tech Support",
      subject: "RE: Access Issue Resolution",
      preview: "Your access to the development server has been restored...",
      timestamp: "Yesterday",
      isUnread: false,
      hasAttachment: false,
      category: "support",
    },
    {
      id: "3",
      sender: "Project Manager",
      subject: "Sprint Planning Meeting Notes",
      preview:
        "Here are the key points discussed during today's sprint planning...",
      timestamp: "2 days ago",
      isUnread: true,
      hasAttachment: true,
      category: "meeting",
    },
  ];

  const filteredMessages = messages.filter((message) => {
    if (filter !== "all" && message.category !== filter) return false;
    if (
      searchQuery &&
      !message.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !message.sender.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[600px] p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>My Messages</DialogTitle>
            <DialogDescription>
              View and manage your messages across all projects
            </DialogDescription>
          </DialogHeader>

          {/* Toolbar */}
          <div className="px-6 py-2 flex gap-4 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <Card
                  key={message.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-accent/5 ${
                    selectedMessage?.id === message.id ? "border-accent" : ""
                  }`}
                  onClick={() => setSelectedMessage(message)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {message.sender}
                        </span>
                        {message.isUnread && (
                          <Badge
                            variant="default"
                            className="bg-accent text-accent-foreground"
                          >
                            New
                          </Badge>
                        )}
                        {message.hasAttachment && (
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <h4
                        className={`text-base ${message.isUnread ? "font-medium" : ""}`}
                      >
                        {message.subject}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.preview}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {message.timestamp}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {filteredMessages.length} message
                {filteredMessages.length !== 1 ? "s" : ""}
              </span>
              <Button
                variant="outline"
                onClick={() => setSelectedMessage(null)}
              >
                Mark all as read
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMessagesModal;
