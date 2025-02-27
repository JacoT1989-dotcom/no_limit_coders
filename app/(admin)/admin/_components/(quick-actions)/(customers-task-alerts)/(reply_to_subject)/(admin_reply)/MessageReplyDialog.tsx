import React, { useState, useEffect } from "react";
import { Paperclip, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { MessageWithUser } from "../(message_card)/CustomerMessageCard";
import { respondToMessage } from "./reply-message-actions";

interface MessageReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: MessageWithUser;
  onMessageResponded?: () => void;
}

const MessageReplyDialog: React.FC<MessageReplyDialogProps> = ({
  open,
  onOpenChange,
  message,
  onMessageResponded,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [messageText, setMessageText] = useState("");
  const [category, setCategory] = useState<MessageCategory>(
    MessageCategory.SUPPORT,
  );

  // Reset form when message changes
  useEffect(() => {
    if (message) {
      setSubject(`Re: ${message.subject}`);
      setPreview("");
      setMessageText("");
      setCategory(MessageCategory.SUPPORT);
      setFiles([]);
    }
  }, [message]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !messageText || !category) {
      toast("Error", { description: "Please fill all required fields" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug: Log form data before submission
      console.log("Submitting form with data:", {
        techTeamMessageId: message.id,
        subject,
        preview,
        messageText,
        category,
        filesCount: files.length,
      });

      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append("techTeamMessageId", message.id);
      formData.append("subject", subject);
      formData.append("preview", preview || messageText.substring(0, 150));
      formData.append("message", messageText); // Make sure message is being sent
      formData.append("category", category);

      // Debug: Log the form data
      console.log("FormData keys:");
      for (const key of formData.keys()) {
        console.log(` - ${key}: ${formData.get(key)}`);
      }

      // Append files
      files.forEach((file) => {
        formData.append("attachments", file);
      });

      // Call the server action directly with FormData
      const result = await respondToMessage(formData);

      if ("error" in result && result.error) {
        throw new Error(result.error);
      }

      // Debug: Log the result
      console.log("Response from server:", result);

      // Success!
      toast("Success", {
        description: "Your response has been sent to the customer",
      });

      // Close the dialog and reset the form
      onOpenChange(false);
      setSubject("");
      setPreview("");
      setMessageText("");
      setCategory(MessageCategory.SUPPORT);
      setFiles([]);

      // Notify parent component that a response was sent
      if (onMessageResponded) {
        onMessageResponded();
      }
    } catch (error) {
      console.error("Error sending response:", error);
      toast("Error", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Reply to Customer</DialogTitle>
          <DialogDescription>
            Send a direct response to {message?.user?.displayName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preview">Preview (shows in inbox)</Label>
            <Input
              id="preview"
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              placeholder="Brief summary of your message"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={6}
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
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-accent"
              >
                <Paperclip className="h-4 w-4 inline mr-2" />
                Attach files
              </label>
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
                      <span className="text-sm truncate">{file.name}</span>
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
                  Send Response
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageReplyDialog;
