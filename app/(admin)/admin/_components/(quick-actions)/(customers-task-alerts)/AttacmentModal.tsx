import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Download, File } from "lucide-react";

interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  taskId: string;
  uploaderId: string;
}

interface AttachmentsModalProps {
  attachments: TaskAttachment[];
}

const AttachmentsModal = ({ attachments }: AttachmentsModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<TaskAttachment | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const isImageFile = (filename: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  const handleDownload = async (url: string, filename: string) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.style.display = "none";
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle dialog open/close events
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Reset selected image when dialog closes
    if (!isOpen) {
      setSelectedImage(null);
    }
  };

  const renderAttachmentContent = () => {
    if (selectedImage) {
      return (
        <div className="relative w-full h-96">
          <div className="relative w-full h-full">
            <Image
              src={selectedImage.url}
              alt={selectedImage.name}
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 768px) 100vw, 700px"
              unoptimized
            />
          </div>
        </div>
      );
    }

    return (
      <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
        <div className="space-y-3">
          {attachments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No attachments for this task
            </div>
          ) : (
            attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                    <File className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-medium truncate">{attachment.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{formatDate(attachment.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {isImageFile(attachment.name) ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setSelectedImage(attachment)}
                  >
                    View
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() =>
                      handleDownload(attachment.url, attachment.name)
                    }
                    disabled={loading}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    );
  };

  // For accessibility, use a div with role="button" instead of a Button component
  // This avoids the nested button issue when used inside other buttons or interactive elements
  const triggerElement = (
    <div
      role="button"
      tabIndex={0}
      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent hover:bg-muted hover:text-accent-foreground h-8 px-2 rounded-md"
      onClick={(e) => {
        // Stop propagation to prevent parent buttons from also triggering
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <Paperclip className="h-3 w-3 mr-1" />
      {attachments.length}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {triggerElement}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {selectedImage ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  Back to list
                </Button>
                <span className="text-muted-foreground">|</span>
                <span>Viewing attachment</span>
              </div>
            ) : (
              "Attachments"
            )}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          View or download task attachments
        </DialogDescription>
        {renderAttachmentContent()}
      </DialogContent>
    </Dialog>
  );
};

export const AttachmentsBadge = ({ attachments }: AttachmentsModalProps) => {
  return <AttachmentsModal attachments={attachments} />;
};

export default AttachmentsModal;
