"use client";

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
import { FolderPlus, Send, MessageSquare, User, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for our message structures
type CustomerMessage = {
  id: number;
  customer: string;
  subject: string;
  content: string;
  date: string;
  unread: boolean;
};

type MessageReply = {
  messageId: number;
  content: string;
  date: string;
  from: string;
};

const CustomerMessageReplyCard = () => {
  const [replyText, setReplyText] = useState<string>("");
  const [selectedMessage, setSelectedMessage] =
    useState<CustomerMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<CustomerMessage[]>([
    {
      id: 1,
      customer: "Jane Smith",
      subject: "Website Feedback",
      content:
        "I've been reviewing the new website design and I have some feedback about the navigation menu. It seems a bit confusing for new users. Can we schedule a call to discuss potential improvements?",
      date: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      customer: "Michael Brown",
      subject: "Project Timeline",
      content:
        "I'm concerned about meeting the current deadline for the marketing campaign. We need to adjust our timeline or allocate more resources to the project. Please let me know your thoughts on this matter.",
      date: "Yesterday",
      unread: true,
    },
    {
      id: 3,
      customer: "Sarah Johnson",
      subject: "Feature Request",
      content:
        "Our team has been using the dashboard extensively, and we think adding a data export feature would greatly improve our workflow. Is this something you could implement in the next update?",
      date: "3 days ago",
      unread: false,
    },
  ]);

  const [replies, setReplies] = useState<MessageReply[]>([
    {
      messageId: 3,
      content:
        "Hi Sarah, thank you for your suggestion. We're actually working on a data export feature right now and it should be included in our next update scheduled for next month. I'll keep you posted on the progress!",
      date: "2 days ago",
      from: "Admin",
    },
  ]);

  const handleSubmitReply = () => {
    if (!replyText.trim() || !selectedMessage) return;

    const newReply: MessageReply = {
      messageId: selectedMessage.id,
      content: replyText,
      date: "Just now",
      from: "Admin",
    };

    setReplies([...replies, newReply]);
    setReplyText("");

    // Mark message as read
    setMessageHistory(
      messageHistory.map((msg) =>
        msg.id === selectedMessage.id ? { ...msg, unread: false } : msg,
      ),
    );
  };

  const getMessageReplies = (messageId: number): MessageReply[] => {
    return replies.filter((reply) => reply.messageId === messageId);
  };

  const unreadCount = messageHistory.filter((msg) => msg.unread).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <div className="flex flex-col">
                <span>Reply to customer</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-accent font-normal">
                    {unreadCount} unread messages
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Reply to customer Messages</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Customer Message Center
          </DialogTitle>
          <DialogDescription>
            View and respond to customer inquiries
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[500px] overflow-hidden">
          {/* Messages list */}
          <div className="w-1/3 border-r pr-3 overflow-y-auto">
            <h3 className="font-semibold mb-3">Messages</h3>
            <div className="space-y-2">
              {messageHistory.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/5 ${
                    selectedMessage?.id === message.id
                      ? "border-accent/50 bg-accent/5"
                      : ""
                  } ${message.unread ? "border-accent/40" : ""}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{message.customer}</span>
                    <span className="text-xs text-muted-foreground">
                      {message.date}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {message.subject}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {message.content}
                  </p>
                  {message.unread && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-accent"></div>
                      <span className="text-xs text-accent">Unread</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Message content and reply area */}
          <div className="flex-1 pl-3 flex flex-col">
            {selectedMessage ? (
              <>
                <div className="mb-4 pb-3 border-b">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold">{selectedMessage.subject}</h3>
                    <span className="text-xs text-muted-foreground">
                      {selectedMessage.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedMessage.customer}</span>
                  </div>
                  <p className="text-sm mt-2">{selectedMessage.content}</p>
                </div>

                {/* Message history */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {getMessageReplies(selectedMessage.id).map((reply, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="rounded-full h-8 w-8 bg-accent/20 flex items-center justify-center text-accent font-semibold">
                        {reply.from === "Admin" ? "A" : "C"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{reply.from}</span>
                          <span className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {reply.date}
                          </span>
                        </div>
                        <p className="text-sm p-3 bg-accent/5 rounded-lg">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply form */}
                <div className="mt-auto">
                  <Textarea
                    placeholder="Type your reply here..."
                    className="min-h-[100px] mb-2"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Replying to{" "}
                      <span className="font-medium">
                        {selectedMessage.customer}
                      </span>
                    </div>
                    <Button
                      onClick={handleSubmitReply}
                      disabled={!replyText.trim()}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a message to view and reply
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerMessageReplyCard;
