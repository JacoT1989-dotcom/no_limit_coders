"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import our component files
import CustomerMessageCard from "./CustomerMessageCard";
import MessageList from "./MessageList";
import MessageDetail from "./MessageDetail";

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

  const handleSubmitReply = (content: string) => {
    if (!content.trim() || !selectedMessage) return;

    const newReply: MessageReply = {
      messageId: selectedMessage.id,
      content: content,
      date: "Just now",
      from: "Admin",
    };

    setReplies([...replies, newReply]);

    // Mark message as read
    setMessageHistory(
      messageHistory.map((msg) =>
        msg.id === selectedMessage.id ? { ...msg, unread: false } : msg,
      ),
    );
  };

  const unreadCount = messageHistory.filter((msg) => msg.unread).length;

  return (
    <Dialog>
      <CustomerMessageCard unreadCount={unreadCount} />

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
          <MessageList
            messages={messageHistory}
            selectedMessage={selectedMessage}
            onSelectMessage={setSelectedMessage}
          />

          <MessageDetail
            selectedMessage={selectedMessage}
            replies={replies}
            onSubmitReply={handleSubmitReply}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerMessageReplyCard;
