"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { UserRole, MessageCategory } from "@prisma/client";
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

export async function respondToConversation(formData: FormData) {
  try {
    // Validate user has admin privileges
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return { error: "Access denied. Admin privileges required." };
    }

    // Extract form data
    const conversationId = formData.get("conversationId") as string;
    const message = formData.get("message") as string;
    const category = formData.get("category") as MessageCategory;

    // Validate required fields
    if (!conversationId || !message || !category) {
      return { error: "Missing required fields" };
    }

    // Fetch the conversation to ensure it exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return { error: "Conversation not found" };
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
        const path = `admin/${user.id}/responses/${timestamp}_${file.name}`;

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
      // Create the user message
      const userMessage = await tx.userMessage.create({
        data: {
          sender: user.displayName,
          preview: message.substring(0, 100), // Use first 100 chars as preview
          message: message,
          category: category,
          isUnread: true,
          hasAttachment: attachments.length > 0,
          isInitial: false,
          userId: user.id,

          // Connect to the conversation using conversationId
          conversationId: conversationId,

          // Create message attachments separately
        },
        include: {
          attachments: true,
        },
      });

      // Create attachments for the message
      if (attachments.length > 0) {
        await tx.messageAttachment.createMany({
          data: attachments.map((attachment) => ({
            ...attachment,
            messageId: userMessage.id,
          })),
        });
      }

      // Update the conversation's updatedAt timestamp
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return {
        success: true,
        messageId: userMessage.id,
        conversationId,
        attachments: userMessage.attachments,
      };
    });

    return result;
  } catch (error) {
    console.error("Error sending response message:", error);
    return {
      error: "Failed to send response message",
    };
  }
}

export async function markMessagesAsRead(conversationId: string) {
  try {
    // Validate user has admin privileges
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return { error: "Access denied. Admin privileges required." };
    }

    // Update all unread messages in the conversation to read
    const result = await prisma.userMessage.updateMany({
      where: {
        conversationId,
        isUnread: true,
      },
      data: {
        isUnread: false,
      },
    });

    return {
      success: true,
      updatedCount: result.count,
    };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return {
      error: "Failed to mark messages as read",
    };
  }
}
