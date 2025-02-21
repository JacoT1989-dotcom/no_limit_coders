"use client";

import React, { useState } from "react";
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

const CommentsModal = ({
  isOpen,
  onClose,
  comments,
  taskId,
  taskTitle,
  onCommentAdded,
}: CommentsModalProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

      setNewComment("");
      onCommentAdded();
      toast.success("Comment added successfully");
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle>Comments - {taskTitle}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No comments yet
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex space-x-4 p-4 rounded-lg bg-muted/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(comment.author?.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                          {comment.author?.displayName || "Anonymous User"}
                        </p>
                        {comment.updatedAt > comment.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            (edited)
                          </span>
                        )}
                      </div>
                      <time className="text-xs text-muted-foreground">
                        {formatDate(new Date(comment.createdAt))}
                      </time>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 space-y-4">
          <Textarea
            placeholder="Add a comment..."
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
                {isSubmitting ? "Adding..." : "Add Comment"}
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

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="px-2 h-8"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-3 w-3 mr-1" />
        {comments.length}
      </Button>

      <CommentsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        comments={comments}
        taskId={taskId}
        taskTitle={taskTitle}
        onCommentAdded={() => {
          onRefresh();
          setIsOpen(false);
        }}
      />
    </>
  );
};

export default CommentsModal;
