// Define the types for our responses and attachments
export interface ThreadResponseAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  messageId?: string;
  taskId: string;
  uploaderId: string;
}

export interface ThreadResponse {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  message?: string; // Added message field as optional
  category: string;
  createdAt: Date;
  attachments: ThreadResponseAttachment[];
}

export interface MessageThreadViewProps {
  responses: ThreadResponse[];
  isLoading: boolean;
  onRefresh: () => void;
}

// Helper function to format subjects and extract reference numbers
export const formatSubject = (
  subject: string,
): { main: string; reference: string | null } => {
  // Check if the subject starts with multiple "Re:" prefixes
  const rePattern = /^(Re:\s*)+/i;
  let mainSubject = subject;

  if (rePattern.test(subject)) {
    // Replace multiple "Re:" with just one "Re:"
    mainSubject = "Re: " + subject.replace(rePattern, "");
  }

  // Extract reference number if present
  const refPattern = /\[Ref:([^\]]+)\]/;
  const refMatch = subject.match(refPattern);

  if (refMatch) {
    // Remove reference from main subject
    mainSubject = mainSubject.replace(refPattern, "").trim();
    return {
      main: mainSubject,
      reference: refMatch[0],
    };
  }

  return {
    main: mainSubject,
    reference: null,
  };
};

// Function to format dates in a readable way
export const formatDate = (date: Date) => {
  // Handle both Date objects and ISO strings
  const dateObj = date instanceof Date ? date : new Date(date);

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffMins < 24 * 60) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    const days = Math.floor(diffMins / (60 * 24));
    if (days < 7) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    } else {
      // For older messages, show the actual date
      return dateObj.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }
};

// Convert attachments format to match what AttachmentsModal expects
// IMPORTANT: Only include attachments that belong to the current message
export const convertAttachmentsFormat = (
  attachments: ThreadResponseAttachment[] | undefined,
  messageId: string,
): Array<{
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  taskId: string;
  uploaderId: string;
}> => {
  if (!attachments || !Array.isArray(attachments)) return [];

  // Filter attachments to only include those belonging to this message
  const filteredAttachments = attachments.filter((att) => {
    // Ensure the attachment has a valid messageId and it matches the provided messageId
    return att.messageId && att.messageId === messageId;
  });

  console.log(
    `Filtered ${attachments.length} attachments for message ${messageId}, returned ${filteredAttachments.length}`,
    filteredAttachments,
  );

  // Map the filtered attachments to the expected format
  return filteredAttachments.map((attachment) => ({
    id: attachment.id,
    name: attachment.fileName,
    url: attachment.fileUrl,
    createdAt: attachment.createdAt || new Date(),
    taskId: attachment.taskId || "default-task",
    uploaderId: attachment.uploaderId || "default-uploader",
  }));
};
