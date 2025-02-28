"use client";

import React, { useState, useEffect } from "react";
import { Paperclip, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCategory } from "@prisma/client";
import { replyToConversation } from "./customer-message-actions";
import { MessageWithUser } from "../CustomerMessageCard";

interface CustomerMessageReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: MessageWithUser;
  onMessageResponded?: () => void;
}

const CustomerMessageReplyDialog: React.FC<CustomerMessageReplyDialogProps> = ({
  open,
  onOpenChange,
  message,
  onMessageResponded,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [messageText, setMessageText] = useState("");
  const [category, setCategory] = useState<MessageCategory>(
    MessageCategory.SUPPORT,
  );

  // Reset form when message changes or dialog opens/closes
  useEffect(() => {
    if (message) {
      setMessageText("");
      setCategory(MessageCategory.SUPPORT);
      setFiles([]);
    }
  }, [message, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Check file size limits before adding
      const newFiles = Array.from(e.target.files).filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          toast.error(`File ${file.name} exceeds 5MB limit`);
          return false;
        }
        return true;
      });

      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText || !category) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append("message", messageText);
      formData.append("category", category);

      // Append files
      files.forEach((file) => {
        formData.append("attachments", file);
      });

      // Call the server action to add message to conversation
      const result = await replyToConversation(
        message.conversationId,
        formData,
      );

      if ("error" in result && result.error) {
        throw new Error(result.error);
      }

      // Success!
      toast.success("Your message has been sent");

      // Close the dialog and reset the form
      onOpenChange(false);
      setMessageText("");
      setCategory(MessageCategory.SUPPORT);
      setFiles([]);

      // Notify parent component that a response was sent
      if (onMessageResponded) {
        onMessageResponded();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Reply to Support</DialogTitle>
          <DialogDescription>
            Send a follow-up message about &quot;{message?.subject}&quot;
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={6}
              placeholder="Provide any additional details or questions..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as MessageCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MessageCategory.DESIGN}>Design</SelectItem>
                <SelectItem value={MessageCategory.SUPPORT}>Support</SelectItem>
                <SelectItem value={MessageCategory.MEETING}>Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Attachments</Label>
            <div className="border border-dashed border-border rounded-md p-4 text-center hover:bg-accent/5 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-accent"
              >
                <Paperclip className="h-4 w-4 inline mr-2" />
                Attach files (images, PDFs, documents)
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 5MB per file
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-2 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-background dark:bg-card border border-border p-2 rounded"
                  >
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 mr-2 text-accent" />
                      <span className="text-sm truncate max-w-[300px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-border"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerMessageReplyDialog;
