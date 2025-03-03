"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Clock, Users, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { createTaskComment } from "./comment-actions";
import { useSession } from "@/app/(customer)/SessionProvider";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  authorId: string;
  author: {
    id: string;
    displayName: string;
  };
};

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  taskId: string;
  taskTitle: string;
  onCommentAdded: () => void;
}

export const CommentsModal = ({
  isOpen,
  onClose,
  comments,
  taskId,
  taskTitle,
  onCommentAdded,
}: CommentsModalProps) => {
  const { user } = useSession();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Improved auto-scroll to bottom
  const scrollToBottom = () => {
    if (!scrollAreaRef.current) return;

    // Try to find the scroll viewport from Radix UI's ScrollArea
    const scrollViewport = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    );

    if (scrollViewport) {
      // Use a longer timeout to ensure content is rendered
      setTimeout(() => {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }, 300);
    }
  };

  // Scroll when modal opens or comments change
  useEffect(() => {
    if (isOpen) {
      // Multiple attempts to scroll, as content might take time to render
      scrollToBottom();

      // Additional attempts with increasing delays to ensure it works
      const timeouts = [100, 300, 500].map((delay) =>
        setTimeout(scrollToBottom, delay),
      );

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [isOpen, comments]);

  // Animation effect
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  // Generate a gradient background based on user ID
  const generateUserGradient = (authorId: string = "") => {
    if (!authorId) return "bg-gradient-to-r from-gray-400 to-gray-500";

    const gradients = [
      "bg-gradient-to-r from-blue-500 to-indigo-600",
      "bg-gradient-to-r from-purple-500 to-pink-600",
      "bg-gradient-to-r from-green-500 to-emerald-600",
      "bg-gradient-to-r from-pink-500 to-rose-600",
      "bg-gradient-to-r from-indigo-500 to-violet-600",
      "bg-gradient-to-r from-teal-500 to-cyan-600",
      "bg-gradient-to-r from-orange-500 to-amber-600",
      "bg-gradient-to-r from-cyan-500 to-blue-600",
    ];

    const charCodes = authorId.split("").map((char) => char.charCodeAt(0));
    const sum = charCodes.reduce((acc, code) => acc + code, 0);
    return gradients[sum % gradients.length];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const getInitials = (displayName: string = "") => {
    if (!displayName) return "AU";
    return displayName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine if the user is a customer
  const isCustomer = (authorId: string) => {
    // This is a placeholder function. In a real app, you might determine
    // if a user is a customer based on their role, ID pattern, or other data
    // For now, we'll assume the current logged-in user is the customer
    return authorId === user.id;
  };

  // Get unique participants in the conversation
  const getUniqueParticipants = (): string[] => {
    const uniqueAuthors = new Set<string>(); // Explicitly type the Set as containing strings
    comments.forEach((comment) => {
      if (comment.author?.displayName) {
        uniqueAuthors.add(comment.author.displayName);
      }
    });
    return Array.from(uniqueAuthors);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await createTaskComment(taskId, newComment);

      if (!response.success) {
        toast.error(response.error || "Failed to add comment");
        return;
      }

      setNewComment("");
      onCommentAdded(); // This will refresh the comments
      toast.success("Comment added successfully");

      // Scroll to bottom after sending a new comment
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Group comments by date
  const groupedComments = comments.reduce(
    (groups: Record<string, Comment[]>, comment) => {
      const date = formatDate(new Date(comment.createdAt));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(comment);
      return groups;
    },
    {},
  );

  // Calculate conversation insights
  const participants = getUniqueParticipants();
  const firstMessageDate =
    comments.length > 0
      ? formatDate(new Date(comments[0].createdAt))
      : "No messages yet";
  const lastActivity =
    comments.length > 0
      ? formatDate(new Date(comments[comments.length - 1].createdAt))
      : "No activity yet";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[600px] max-h-[90vh] p-0 overflow-hidden rounded-xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-xl transition-all duration-300 ${animateIn ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        {/* Enhanced professional header */}
        <DialogHeader className="border-b border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* Status indicator */}
                <div className="h-3 w-3 rounded-full bg-green-400 ring-2 ring-green-200 animate-pulse"></div>
                {/* Task title */}
                <DialogTitle className="text-lg font-semibold">
                  {taskTitle}
                </DialogTitle>
              </div>
            </div>

            {/* Task/conversation metadata */}
            <div className="flex flex-wrap items-center text-xs text-blue-100 mt-1 gap-x-4 gap-y-1">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {participants.length} participant
                  {participants.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Started: {firstMessageDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                <span>ID: {taskId.substring(0, 8)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>
                  {comments.length} message{comments.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Participants list */}
          <div className="bg-gray-50 p-2 border-b border-gray-200">
            <div className="flex items-center gap-1 overflow-x-auto py-1 px-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Active participants:
              </span>
              <div className="flex -space-x-2">
                {participants.slice(0, 5).map((name, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-white">
                    <AvatarFallback
                      className={`text-white text-xs ${generateUserGradient(name)}`}
                    >
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {participants.length > 5 && (
                  <Avatar className="h-6 w-6 border-2 border-white">
                    <AvatarFallback className="bg-gray-400 text-white text-xs">
                      +{participants.length - 5}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="ml-auto text-xs text-gray-500">
                Last activity: {lastActivity}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[400px] px-4" ref={scrollAreaRef}>
          <div className="space-y-6 py-4" ref={contentRef}>
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">
                  No comments yet. Start the conversation!
                </p>
              </div>
            ) : (
              Object.entries(groupedComments).map(([date, dateComments]) => (
                <div key={date} className="space-y-4">
                  <div className="flex justify-center">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {date}
                    </span>
                  </div>
                  {dateComments.map((comment) => {
                    const customerMessage = isCustomer(comment.authorId);
                    const userGradient = generateUserGradient(comment.authorId);

                    // Position customer on left, others on right
                    return (
                      <div
                        key={comment.id}
                        className={`flex space-x-2 ${
                          customerMessage ? "justify-start" : "justify-end"
                        }`}
                      >
                        {customerMessage && (
                          <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white shadow-sm">
                            <AvatarFallback
                              className={`text-white ${userGradient}`}
                            >
                              {getInitials(comment.author?.displayName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] space-y-1 p-3 rounded-2xl shadow-md ${
                            customerMessage
                              ? `rounded-tl-none ${userGradient} text-white`
                              : "rounded-tr-none bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium leading-none">
                              {comment.author?.displayName || "Anonymous User"}
                            </p>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {comment.content}
                          </p>
                          <div className="flex items-center justify-end gap-2">
                            <time className="text-xs opacity-70">
                              {formatTime(new Date(comment.createdAt))}
                            </time>
                            {comment.updatedAt > comment.createdAt && (
                              <span className="text-xs opacity-70">
                                (edited)
                              </span>
                            )}
                          </div>
                        </div>
                        {!customerMessage && (
                          <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white shadow-sm">
                            <AvatarFallback className="text-white bg-gradient-to-r from-blue-500 to-indigo-600">
                              {getInitials(comment.author?.displayName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            {/* Invisible element at the bottom to scroll to */}
            <div id="scroll-bottom-anchor"></div>
          </div>
        </ScrollArea>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex">
            <Textarea
              placeholder="Type your message..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none bg-white border-gray-300 text-gray-800 rounded-l-lg rounded-r-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-gray-300"
            />
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className={`rounded-l-none rounded-r-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 ${
                isSubmitting ? "opacity-70" : ""
              }`}
            >
              {isSubmitting ? "Sending..." : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const CommentsBadge = ({
  comments,
  taskId,
  taskTitle,
  onRefresh,
}: {
  comments: Comment[];
  taskId: string;
  taskTitle: string;
  onRefresh: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="px-2 h-8 hover:bg-gray-100 hover:text-blue-600 transition-colors flex items-center gap-1"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-3 w-3" />
        <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
          {comments.length}
        </span>
      </Button>

      <CommentsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        comments={comments}
        taskId={taskId}
        taskTitle={taskTitle}
        onCommentAdded={() => {
          onRefresh();
        }}
      />
    </>
  );
};

export default CommentsModal;
