"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, User, Clock } from "lucide-react";

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

interface MessageDetailProps {
  selectedMessage: CustomerMessage | null;
  replies: MessageReply[];
  onSubmitReply: (content: string) => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({
  selectedMessage,
  replies,
  onSubmitReply,
}) => {
  const [replyText, setReplyText] = useState<string>("");

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    onSubmitReply(replyText);
    setReplyText("");
  };

  const messageReplies = selectedMessage
    ? replies.filter((reply) => reply.messageId === selectedMessage.id)
    : [];

  if (!selectedMessage) {
    return (
      <div className="flex-1 pl-3 flex flex-col">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a message to view and reply
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pl-3 flex flex-col">
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
        {messageReplies.map((reply, index) => (
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
            <span className="font-medium">{selectedMessage.customer}</span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!replyText.trim()}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
