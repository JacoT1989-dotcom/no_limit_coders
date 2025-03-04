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
  newConversationWithMessageSchema,
  NewConversationWithMessageSchemaType,
} from "./validations";
import { createConversationWithMessage } from "./message-actions";

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

  const form = useForm<NewConversationWithMessageSchemaType>({
    resolver: zodResolver(newConversationWithMessageSchema),
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

  const onSubmit = async (data: NewConversationWithMessageSchemaType) => {
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

      const response = await createConversationWithMessage(formData);

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
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="text-left space-y-2 pb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Message Tech Team
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Send a message to our technical team for support or assistance. Your
            conversation will become active on the Conversation Topics as soon
            as an Admin responded to your conversation-topic invite.
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
                    <FormLabel className="text-slate-900 dark:text-slate-100">
                      Subject
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Brief description of your issue"
                          className="w-full pl-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 dark:placeholder:text-slate-400"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <MessageSquare className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="messageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 dark:text-slate-100">
                        Message Type
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Select
                            disabled={isSubmitting}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full pl-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                              <FileText className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                              {MESSAGE_TYPE_OPTIONS.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 dark:text-slate-100">
                        Category
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Select
                            disabled={isSubmitting}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full pl-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                              <Code className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                              {CATEGORY_OPTIONS.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-900 dark:text-slate-100">
                      Priority
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Select
                          disabled={isSubmitting}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full pl-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                            <Users className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                            {PRIORITY_OPTIONS.map((pri) => (
                              <SelectItem key={pri.value} value={pri.value}>
                                {pri.display}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-900 dark:text-slate-100">
                      Message
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your issue or request in detail..."
                        className="min-h-[150px] resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 dark:placeholder:text-slate-400"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attachments"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-slate-900 dark:text-slate-100">
                      Attachments
                    </FormLabel>
                    <div className="space-y-2">
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {attachments.map((attachment) => (
                            <Badge
                              key={attachment.id}
                              variant="secondary"
                              className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                              <Paperclip className="h-3 w-3" />
                              <span className="max-w-[150px] truncate">
                                {attachment.file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeAttachment(attachment.id)}
                                className="ml-1 hover:text-red-500 dark:hover:text-red-400"
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
                          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                        >
                          <Paperclip className="mr-2 h-4 w-4" />
                          Attach Files
                        </Button>
                      </div>
                      <FormMessage className="text-red-500" />
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
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
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
