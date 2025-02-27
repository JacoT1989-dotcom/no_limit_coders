"use client";

import React from "react";

// Define types for our message structures
type CustomerMessage = {
  id: number;
  customer: string;
  subject: string;
  content: string;
  date: string;
  unread: boolean;
};

interface MessageListProps {
  messages: CustomerMessage[];
  selectedMessage: CustomerMessage | null;
  onSelectMessage: (message: CustomerMessage) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedMessage,
  onSelectMessage,
}) => {
  return (
    <div className="w-1/3 border-r pr-3 overflow-y-auto">
      <h3 className="font-semibold mb-3">Messages</h3>
      <div className="space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/5 ${
              selectedMessage?.id === message.id
                ? "border-accent/50 bg-accent/5"
                : ""
            } ${message.unread ? "border-accent/40" : ""}`}
            onClick={() => onSelectMessage(message)}
          >
            <div className="flex justify-between mb-1">
              <span className="font-medium">{message.customer}</span>
              <span className="text-xs text-muted-foreground">
                {message.date}
              </span>
            </div>
            <p className="text-sm font-medium truncate">{message.subject}</p>
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
  );
};

export default MessageList;
