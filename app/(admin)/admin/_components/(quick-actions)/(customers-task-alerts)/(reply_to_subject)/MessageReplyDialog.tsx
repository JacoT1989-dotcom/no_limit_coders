import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { MessageWithUser } from "../CustomerMessageCard";
import {
  RespondToMessageFormValues,
  respondToMessageSchema,
} from "./validations";
import { respondToMessage } from "./reply-message-actions";

// FileUpload component
const FileUpload = ({ onChange }: { onChange: (files: File[]) => void }) => (
  <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
    <input
      type="file"
      multiple
      onChange={(e) => onChange(Array.from(e.target.files || []))}
      className="hidden"
      id="file-upload"
    />
    <label htmlFor="file-upload" className="cursor-pointer text-primary">
      <Paperclip className="h-4 w-4 inline mr-2" />
      Attach files
    </label>
  </div>
);

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Set up form with initial values and validation
  const form = useForm<RespondToMessageFormValues>({
    resolver: zodResolver(respondToMessageSchema),
    defaultValues: {
      techTeamMessageId: message?.id || "",
      subject: message ? `Re: ${message.subject}` : "",
      preview: "",
      message: "",
      category: MessageCategory.SUPPORT,
      attachments: [],
    },
  });

  // Update form values when selected message changes
  useEffect(() => {
    if (message) {
      form.reset({
        techTeamMessageId: message.id,
        subject: `Re: ${message.subject}`,
        preview: "",
        message: "",
        category: MessageCategory.SUPPORT,
        attachments: [],
      });
    }
  }, [message, form]);

  // Handle form submission
  const onSubmit = async (data: RespondToMessageFormValues) => {
    setIsSubmitting(true);

    try {
      // This is just a placeholder, as the actual file upload logic would depend on your system
      // Normally you'd upload files first, then pass the URLs to the server action
      const attachmentsData = uploadedFiles.map((file) => ({
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // This is temporary, in reality you'd upload the file and get a URL
      }));

      const result = await respondToMessage({
        ...data,
        techTeamMessageId: message.id,
        attachments: attachmentsData,
      });

      // TypeScript safeguard: Check if result has an error property
      if ("error" in result && result.error) {
        toast("Error", { description: result.error });
        return;
      }

      // Success!
      toast("Success", {
        description: "Your response has been sent to the customer",
      });

      // Close the dialog and reset the form
      onOpenChange(false);
      form.reset();
      setUploadedFiles([]);

      // Notify parent component that a response was sent
      if (onMessageResponded) {
        onMessageResponded();
      }
    } catch (error) {
      console.error("Error sending response:", error);
      toast("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file uploads
  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl !bg-black !border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Reply to Customer</DialogTitle>
          <DialogDescription>
            Send a direct response to {message.user.displayName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preview (shows in inbox)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Textarea {...field} rows={6} />
                  </FormControl>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={MessageCategory.DESIGN}>
                        Design
                      </SelectItem>
                      <SelectItem value={MessageCategory.SUPPORT}>
                        Support
                      </SelectItem>
                      <SelectItem value={MessageCategory.MEETING}>
                        Meeting
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Attachments</FormLabel>
              <FileUpload onChange={handleFileUpload} />
              {uploadedFiles.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {uploadedFiles.length} file(s) selected
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Response
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageReplyDialog;
