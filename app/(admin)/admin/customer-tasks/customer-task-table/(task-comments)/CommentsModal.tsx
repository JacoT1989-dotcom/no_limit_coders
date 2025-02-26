"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { createTaskComment } from "./comment-actions";
import { useSession } from "@/app/(admin)/SessionProvider";

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
  comments: initialComments,
  taskId,
  taskTitle,
  onCommentAdded,
}: CommentsModalProps) => {
  const { user } = useSession();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  // Update local comments when props change
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Reference to the scroll area container
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Scroll to bottom when comments change or dialog opens
  useEffect(() => {
    // Small delay to ensure the DOM has updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [comments, isOpen]);

  // Generate a consistent color based on user ID
  const generateUserColor = (authorId: string = "") => {
    if (!authorId) return "bg-gray-600";

    const colors = [
      "bg-blue-600",
      "bg-purple-600",
      "bg-green-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-teal-600",
      "bg-orange-600",
      "bg-cyan-600",
    ];

    const charCodes = authorId.split("").map((char) => char.charCodeAt(0));
    const sum = charCodes.reduce((acc, code) => acc + code, 0);
    return colors[sum % colors.length];
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

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await createTaskComment(taskId, newComment);

      if (!response.success) {
        toast.error(response.error || "Failed to add comment");
        return;
      }

      // Add the new comment to the local state
      if (response.data) {
        setComments((prevComments) => [
          ...prevComments,
          response.data as Comment,
        ]);
      }

      setNewComment("");
      onCommentAdded(); // This will refresh the comments in the parent component
      toast.success("Comment added successfully");

      // Scroll to bottom after adding a new comment
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle>Comments - {taskTitle}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No comments yet
              </p>
            ) : (
              Object.entries(groupedComments).map(([date, dateComments]) => (
                <div key={date} className="space-y-4">
                  <div className="flex justify-center">
                    <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {date}
                    </span>
                  </div>
                  {dateComments.map((comment) => {
                    const isCurrentUser = comment.authorId === user.id;
                    const userColor = generateUserColor(comment.authorId);

                    return (
                      <div
                        key={comment.id}
                        className={`flex space-x-2 ${
                          isCurrentUser ? "justify-start" : "justify-end"
                        }`}
                      >
                        {isCurrentUser && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback
                              className={`text-white ${userColor}`}
                            >
                              {getInitials(comment.author?.displayName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback
                              className={`text-white ${userColor}`}
                            >
                              {getInitials(comment.author?.displayName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] space-y-1 p-3 rounded-lg text-white ${userColor}`}
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
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 space-y-4">
          <Textarea
            placeholder="Type a message..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] resize-none"
          />
          <DialogFooter className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </div>
          </DialogFooter>
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
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  // Update local comments whenever the props change
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleCommentAdded = () => {
    // Call the parent's refresh function
    onRefresh();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="px-2 h-8"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-3 w-3 mr-1" />
        {localComments.length}
      </Button>

      <CommentsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        comments={localComments}
        taskId={taskId}
        taskTitle={taskTitle}
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
};

export default CommentsModal;
