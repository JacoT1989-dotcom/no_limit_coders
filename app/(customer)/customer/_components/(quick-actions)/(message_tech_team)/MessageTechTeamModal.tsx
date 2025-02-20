import React, { useState, ReactNode, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MessageSquare,
  Users,
  Code,
  Paperclip,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  TechTeamMessageCategory,
  TechTeamMessageType,
  CATEGORY_OPTIONS,
  MESSAGE_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
} from "./types";
import {
  techTeamMessageSchema,
  TechTeamMessageSchemaType,
} from "./validations";
import { createTechTeamMessage } from "./message-actions";

interface MessageTechTeamModalProps {
  children: ReactNode;
  onSuccess?: () => void;
}

interface FileAttachment {
  file: File;
  id: string;
}

const MessageTechTeamModal: React.FC<MessageTechTeamModalProps> = ({
  children,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TechTeamMessageSchemaType>({
    resolver: zodResolver(techTeamMessageSchema),
    defaultValues: {
      subject: "",
      message: "",
      category: undefined,
      messageType: undefined,
      priority: undefined,
      attachments: [],
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const newFiles = Array.from(files).filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} has an invalid file type`);
        return false;
      }
      return true;
    });

    const newAttachments = newFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const resetForm = () => {
    form.reset();
    setAttachments([]);
    setOpen(false);
  };

  const onSubmit = async (data: TechTeamMessageSchemaType) => {
    setIsSubmitting(true);

    try {
      // Create and populate FormData
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("message", data.message);
      formData.append("category", data.category);
      formData.append("messageType", data.messageType);
      formData.append("priority", data.priority);

      // Append each attachment
      attachments.forEach((attachment) => {
        formData.append("attachments", attachment.file);
      });

      const response = await createTechTeamMessage(formData);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("Message sent successfully", {
        description: "Our tech team will review your message and respond soon.",
      });

      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <div className="text-left space-y-2 pb-4">
          <h2 className="text-xl font-semibold">Message Tech Team</h2>
          <p className="text-sm text-muted-foreground">
            Send a message to our technical team for support or assistance.
          </p>
        </div>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Brief description of your issue"
                          className="w-full pl-10"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <MessageSquare className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="messageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Type</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Select
                            disabled={isSubmitting}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full pl-10">
                              <FileText className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {MESSAGE_TYPE_OPTIONS.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Select
                            disabled={isSubmitting}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full pl-10">
                              <Code className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Select
                          disabled={isSubmitting}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full pl-10">
                            <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((pri) => (
                              <SelectItem key={pri.value} value={pri.value}>
                                {pri.display}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your issue or request in detail..."
                        className="min-h-[150px] resize-none"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attachments"
                render={() => (
                  <FormItem>
                    <FormLabel>Attachments</FormLabel>
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
                                disabled={isSubmitting}
                                aria-label={`Remove ${attachment.file.name}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            multiple
                            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          className="w-full"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                        >
                          <Paperclip className="mr-2 h-4 w-4" />
                          Attach Files
                        </Button>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageTechTeamModal;
