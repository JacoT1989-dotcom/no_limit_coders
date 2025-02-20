import React, { useState, ReactNode, useRef } from "react";
import {
  MessageSquare,
  Users,
  Code,
  Paperclip,
  X,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface MessageTechTeamModalProps {
  children: ReactNode;
}

interface CategoryOption {
  value: string;
  display: string;
}

interface FileAttachment {
  file: File;
  id: string;
}

const MessageTechTeamModal: React.FC<MessageTechTeamModalProps> = ({
  children,
}) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [messageType, setMessageType] = useState("");
  const [priority, setPriority] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: CategoryOption[] = [
    { value: "bug", display: "Bug Report" },
    { value: "feature", display: "Feature Request" },
    { value: "support", display: "Technical Support" },
    { value: "access", display: "Access Issue" },
    { value: "performance", display: "Performance Issue" },
    { value: "security", display: "Security Concern" },
    { value: "other", display: "Other" },
  ];

  const messageTypes = [
    { value: "design", display: "Design Feedback" },
    { value: "support", display: "Support Request" },
    { value: "meeting", display: "Meeting Related" },
    { value: "development", display: "Development Issue" },
    { value: "documentation", display: "Documentation" },
    { value: "question", display: "General Question" },
  ];

  const priorities = [
    { value: "low", display: "Low - Not time sensitive" },
    { value: "medium", display: "Medium - Needs attention soon" },
    { value: "high", display: "High - Urgent issue" },
    { value: "critical", display: "Critical - System down/blocking work" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would implement your message submission logic
      console.log({
        subject,
        message,
        category,
        messageType,
        priority,
        attachments: attachments.map((a) => a.file.name),
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form
      setSubject("");
      setMessage("");
      setCategory("");
      setMessageType("");
      setPriority("");
      setAttachments([]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Message Tech Team</DialogTitle>
          <DialogDescription>
            Send a message to our technical team for support or assistance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <div className="relative">
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-10"
                  required
                  aria-label="Message subject"
                />
                <MessageSquare className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="messageType">Message Type</Label>
                <div className="relative">
                  <select
                    id="messageType"
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                    aria-label="Message type"
                    title="Select message type"
                  >
                    <option value="">Select type</option>
                    {messageTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.display}
                      </option>
                    ))}
                  </select>
                  <FileText className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                    aria-label="Message category"
                    title="Select message category"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.display}
                      </option>
                    ))}
                  </select>
                  <Code className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <div className="relative">
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  aria-label="Message priority"
                  title="Select message priority"
                >
                  <option value="">Select priority</option>
                  {priorities.map((pri) => (
                    <option key={pri.value} value={pri.value}>
                      {pri.display}
                    </option>
                  ))}
                </select>
                <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue or request in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px] resize-none"
                required
                aria-label="Message content"
              />
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="space-y-2">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachments.map((attachment) => (
                      <Badge
                        key={attachment.id}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        <Paperclip className="h-3 w-3" />
                        <span className="max-w-[150px] truncate">
                          {attachment.file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="ml-1 hover:text-destructive"
                          aria-label={`Remove ${attachment.file.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach Files
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <DialogTrigger asChild>
              <Button
                variant="outline"
                type="button"
                aria-label="Cancel message"
              >
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={
                isSubmitting ||
                !subject ||
                !message ||
                !category ||
                !priority ||
                !messageType
              }
              aria-label="Send message"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageTechTeamModal;
