import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Download, File } from "lucide-react";
import { Task, TaskAttachment } from "@/app/(customer)/customer/tasks/types";

interface AttachmentsModalProps {
  task: Task;
}

const AttachmentsModal = ({ task }: AttachmentsModalProps) => {
  const [selectedAttachment, setSelectedAttachment] =
    useState<TaskAttachment | null>(null);
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

  const renderAttachmentContent = () => {
    if (selectedAttachment) {
      return (
        <div className="relative w-full h-96">
          <div className="relative w-full h-full">
            <Image
              src={selectedAttachment.url}
              alt={selectedAttachment.name}
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
          {task.attachments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No attachments for this task
            </div>
          ) : (
            task.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card transition-colors hover:bg-muted/50 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-600/10 dark:bg-red-500/10">
                    <File className="h-5 w-5 text-red-600 dark:text-red-500" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-medium truncate text-gray-900 dark:text-white">
                      {attachment.name}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatDate(attachment.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {isImageFile(attachment.name) ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 hover:text-red-600 dark:hover:text-red-500"
                    onClick={() => setSelectedAttachment(attachment)}
                  >
                    View
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 hover:text-red-600 dark:hover:text-red-500"
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 h-8 hover:text-red-600 dark:hover:text-red-500"
        >
          <Paperclip className="h-3 w-3 mr-1" />
          {task.attachments.length}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-gray-900">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {selectedAttachment ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAttachment(null)}
                  className="hover:text-red-600 dark:hover:text-red-500"
                >
                  Back to list
                </Button>
                <span className="text-gray-500 dark:text-gray-400">|</span>
                <span>Viewing attachment</span>
              </div>
            ) : (
              "Attachments"
            )}
          </DialogTitle>
        </DialogHeader>
        {renderAttachmentContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentsModal;
