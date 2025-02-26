"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { UserRole, Priority } from "@prisma/client";
import { z } from "zod";

const fileValidationSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB",
  )
  .refine(
    (file) =>
      [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ].includes(file.type),
    "Invalid file type. Accepted types: images, PDF, Word documents, and text files",
  );

export async function replyToUserMessage(formData: FormData) {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Extract form data
    const userMessageId = formData.get("userMessageId") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const category = formData.get("category") as string;
    const messageType = formData.get("messageType") as string;
    const priority = (formData.get("priority") as Priority) || Priority.MEDIUM;

    // Validate required fields
    if (!userMessageId || !subject || !message || !category || !messageType) {
      return { error: "Missing required fields" };
    }

    // Fetch the original user message
    const userMessage = await prisma.userMessage.findUnique({
      where: { id: userMessageId },
      include: {
        techTeamResponse: true, // Check if there's already a linked TechTeamMessage
      },
    });

    if (!userMessage) {
      return { error: "Original message not found" };
    }

    // Handle file uploads
    const files = formData.getAll("attachments") as File[];

    // Validate each file
    for (const file of files) {
      try {
        fileValidationSchema.parse(file);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            error: `File ${file.name}: ${error.errors[0].message}`,
          };
        }
        throw error;
      }
    }

    // Process attachments
    const attachmentPromises = files.map(async (file) => {
      try {
        const timestamp = Date.now();
        const path = `customer/${user.id}/tech-replies/${timestamp}_${file.name}`;

        const blob = await put(path, file, {
          access: "public",
          addRandomSuffix: false,
        });

        if (!blob.url) throw new Error("Failed to upload file");

        return {
          fileName: file.name,
          fileUrl: blob.url,
        };
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        return null;
      }
    });

    // Filter out failed uploads
    const attachments = (await Promise.all(attachmentPromises)).filter(
      (attachment): attachment is NonNullable<typeof attachment> =>
        attachment !== null,
    );

    // Create a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // MODIFICATION: If there's already a linked tech team response to this user message,
      // create a new tech team message WITHOUT linking it to the user message
      if (userMessage.techTeamResponse) {
        // Create a new "follow-up" tech team message without setting userMessageId
        // In your replyToUserMessage function, when creating a follow-up:
        const techTeamMessage = await tx.techTeamMessage.create({
          data: {
            // Add the reference marker to the subject for follow-up messages
            subject: `Re: ${userMessage.subject} [Ref:${userMessageId}]`,
            message: message,
            category: category,
            messageType: messageType,
            priority: priority,
            userId: user.id,
            // No userMessageId for follow-ups to avoid unique constraint error
          },
          include: {
            user: true,
          },
        });

        // Then create attachments separately
        if (attachments.length > 0) {
          await tx.techTeamMessageAttachment.createMany({
            data: attachments.map((attachment) => ({
              fileName: attachment.fileName,
              fileUrl: attachment.fileUrl,
              messageId: techTeamMessage.id,
            })),
          });
        }

        // Fetch the created attachments to return them
        const createdAttachments = await tx.techTeamMessageAttachment.findMany({
          where: {
            messageId: techTeamMessage.id,
          },
        });

        return {
          success: true,
          messageId: techTeamMessage.id,
          attachments: createdAttachments,
          isFollowUp: true, // Indicate this is a follow-up message
        };
      } else {
        // Original behavior: If there's no existing response, link the new one to the user message
        const techTeamMessage = await tx.techTeamMessage.create({
          data: {
            subject: subject || `Re: ${userMessage.subject}`,
            message: message,
            category: category,
            messageType: messageType,
            priority: priority,
            userId: user.id,
            userMessageId: userMessageId, // Set the userMessageId for the first response
          },
          include: {
            user: true,
          },
        });

        // Then create attachments separately
        if (attachments.length > 0) {
          await tx.techTeamMessageAttachment.createMany({
            data: attachments.map((attachment) => ({
              fileName: attachment.fileName,
              fileUrl: attachment.fileUrl,
              messageId: techTeamMessage.id,
            })),
          });
        }

        // Fetch the created attachments to return them
        const createdAttachments = await tx.techTeamMessageAttachment.findMany({
          where: {
            messageId: techTeamMessage.id,
          },
        });

        // Mark the user message as read
        await tx.userMessage.update({
          where: { id: userMessageId },
          data: { isUnread: false },
        });

        return {
          success: true,
          messageId: techTeamMessage.id,
          attachments: createdAttachments,
        };
      }
    });

    return result;
  } catch (error) {
    console.error("Error sending tech team response:", error);

    // Your existing error handling code
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return {
          error:
            "You've already replied to this message. Please refresh your messages to see the latest updates.",
        };
      }
    }

    return {
      error: "Failed to send response message",
    };
  }
}
