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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskComment } from "../../types";

// Helper function to format date
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

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: TaskComment[];
  taskTitle: string;
  onAddComment?: (content: string) => Promise<void>;
}

const CommentsModal = ({
  isOpen,
  onClose,
  comments,
  taskTitle,
  onAddComment,
}: CommentsModalProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
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
                    <AvatarFallback>
                      {comment.authorId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{comment.authorId}</p>
                      <time className="text-sm text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="text-sm text-foreground/90">
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
            className="min-h-[100px]"
          />
          <DialogFooter>
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
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Comment Badge Component
export const CommentsBadge = ({
  comments,
  taskTitle,
}: {
  comments: TaskComment[];
  taskTitle: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddComment = async (content: string) => {
    // Implement your comment adding logic here
    console.log("Adding comment:", content);
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
        {comments.length}
      </Button>

      <CommentsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        comments={comments}
        taskTitle={taskTitle}
        onAddComment={handleAddComment}
      />
    </>
  );
};

export default CommentsModal;
