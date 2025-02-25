"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { UserRole, MessageCategory } from "@prisma/client";

interface RespondToMessageParams {
  techTeamMessageId: string;
  subject: string;
  preview: string;
  message: string;
  category: MessageCategory;
  attachments?: { fileName: string; fileUrl: string }[];
}

export async function respondToMessage({
  techTeamMessageId,
  subject,
  preview,
  message,
  category,
  attachments = [],
}: RespondToMessageParams) {
  try {
    // Validate user has admin privileges
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return { error: "Access denied. Admin privileges required." };
    }

    // Fetch the original tech team message to get user information
    const techTeamMessage = await prisma.techTeamMessage.findUnique({
      where: { id: techTeamMessageId },
      include: { user: true },
    });

    if (!techTeamMessage) {
      return { error: "Original message not found" };
    }

    // Create a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create the user message
      const userMessage = await tx.userMessage.create({
        data: {
          sender: user.displayName,
          subject: subject || `Re: ${techTeamMessage.subject}`,
          preview: preview,
          category: category,
          isUnread: true,
          hasAttachment: attachments.length > 0,
          userId: techTeamMessage.userId,
          // Link this message to the original tech team message if userMessageId is not already set
          techTeamResponse: {
            connect: {
              id: techTeamMessageId,
            },
          },
        },
      });

      // Create attachments if any
      if (attachments.length > 0) {
        await tx.messageAttachment.createMany({
          data: attachments.map((attachment) => ({
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            messageId: userMessage.id,
          })),
        });
      }

      return { success: true, messageId: userMessage.id };
    });

    return result;
  } catch (error) {
    console.error("Error sending response message:", error);
    return {
      error: "Failed to send response message",
    };
  }
}
