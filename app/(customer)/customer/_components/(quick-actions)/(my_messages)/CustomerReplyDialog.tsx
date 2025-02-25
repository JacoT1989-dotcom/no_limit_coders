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
import { Priority } from "@prisma/client";
import { replyToUserMessage } from "./reply-admin-message";
// Message categories for tech team messages
const MESSAGE_CATEGORIES = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "support", label: "Support" },
  { value: "access", label: "Access Request" },
  { value: "performance", label: "Performance Issue" },
  { value: "security", label: "Security Concern" },
  { value: "other", label: "Other" },
];

// Message types
const MESSAGE_TYPES = [
  { value: "INQUIRY", label: "Inquiry" },
  { value: "REQUEST", label: "Request" },
  { value: "ALERT", label: "Alert" },
  { value: "UPDATE", label: "Update" },
  { value: "RESPONSE", label: "Response" },
];

interface Message {
  id: string;
  subject: string;
  sender: string;
  message?: string;
  preview?: string;
}

interface CustomerReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message | null;
  onMessageSent?: () => void;
}

const CustomerReplyDialog: React.FC<CustomerReplyDialogProps> = ({
  open,
  onOpenChange,
  message,
  onMessageSent,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [category, setCategory] = useState("support");
  const [messageType, setMessageType] = useState("RESPONSE");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);

  // Reset form when message changes
  useEffect(() => {
    if (message) {
      setSubject(`Re: ${message.subject}`);
      setMessageText("");
      setCategory("support");
      setMessageType("RESPONSE");
      setPriority(Priority.MEDIUM);
      setFiles([]);
    }
  }, [message]);

  // For debugging: log state changes when files change
  useEffect(() => {
    console.log(`Files state updated. Current files: ${files.length}`);
    files.forEach((file, index) => {
      console.log(`File ${index + 1}: ${file.name} (${file.size} bytes)`);
    });
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change event triggered");

    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array and append to existing files
      const newFiles = Array.from(e.target.files);
      console.log(
        "Selected files:",
        newFiles.map((f) => `${f.name} (${f.size} bytes)`),
      );

      // Add new files to state
      setFiles((prev) => [...prev, ...newFiles]);

      // Alert for debugging
      alert(
        `Selected ${newFiles.length} files: ${newFiles.map((f) => f.name).join(", ")}`,
      );

      // Reset the input value so the same file can be selected again if needed
      e.target.value = "";
    } else {
      console.log(
        "No files selected or file input event triggered without files",
      );
    }
  };

  const removeFile = (index: number) => {
    console.log(`Removing file at index ${index}`);
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      console.log(`Files after removal: ${newFiles.length}`);
      return newFiles;
    });

    // Alert for debugging
    alert(`Removed file at index ${index}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message || !subject || !messageText || !category || !messageType) {
      toast("Error", { description: "Please fill all required fields" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append("userMessageId", message.id);
      formData.append("subject", subject);
      formData.append("message", messageText);
      formData.append("category", category);
      formData.append("messageType", messageType);
      formData.append("priority", priority);

      // Append files
      if (files.length > 0) {
        console.log(`Attaching ${files.length} files to formData`);
        files.forEach((file) => {
          console.log(`Appending file: ${file.name} (${file.size} bytes)`);
          formData.append("attachments", file);
        });
      } else {
        console.log("No files to attach");
      }

      // Call the server action directly with FormData
      const result = await replyToUserMessage(formData);

      if ("error" in result && result.error) {
        throw new Error(result.error);
      }

      // Success!
      toast("Success", {
        description: "Your message has been sent to the support team",
      });

      // Close the dialog and reset the form
      onOpenChange(false);
      setSubject("");
      setMessageText("");
      setCategory("support");
      setMessageType("RESPONSE");
      setPriority(Priority.MEDIUM);
      setFiles([]);

      // Notify parent component that a message was sent
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
          <DialogTitle className="text-xl">Reply to Support</DialogTitle>
          <DialogDescription>
            Send a reply to the support team
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
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={6}
              required
              placeholder="Describe your issue or request in detail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-type">Message Type</Label>
              <Select
                value={messageType}
                onValueChange={(value) => setMessageType(value)}
              >
                <SelectTrigger id="message-type">
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as Priority)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.LOW}>Low</SelectItem>
                  <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={Priority.HIGH}>High</SelectItem>
                  <SelectItem value={Priority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Attachments</Label>

            {/* Alternative file upload button - more visible */}
            <Button
              type="button"
              variant="outline"
              className="w-full py-8 h-auto flex flex-col items-center justify-center border-dashed"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Paperclip className="h-8 w-8 mb-2 text-accent" />
              <span className="text-base">Click to select files</span>
              <p className="text-xs text-muted-foreground mt-2">
                Max 5MB per file. Accepted formats: images, PDF, Word documents,
                text files
              </p>
            </Button>

            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
            />

            {/* File List Display */}
            {files.length > 0 && (
              <div className="mt-4 border-2 border-accent rounded-md p-4">
                <h4 className="text-base font-medium mb-3 flex items-center">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Selected Files ({files.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-accent/10 p-3 rounded-md"
                    >
                      <div className="flex items-center overflow-hidden">
                        <Paperclip className="h-4 w-4 mr-2 text-accent flex-shrink-0" />
                        <span className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                        <span className="ml-1">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
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
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerReplyDialog;



