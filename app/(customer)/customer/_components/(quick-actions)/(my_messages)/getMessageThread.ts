"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { MessageCategory } from "@prisma/client";

export async function getMessageThread(messageId: string) {
  try {
    // Validate user is authenticated
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Get the current message the user is viewing
    const currentMessage = await prisma.userMessage.findUnique({
      where: {
        id: messageId,
        userId: user.id,
      },
      include: {
        techTeamResponse: true,
      },
    });

    if (!currentMessage) {
      return {
        error: "Message not found or you don't have permission to view it",
      };
    }

    // Create the thread responses array
    const threadResponses = [];

    // Only include follow-up customer replies in the thread, not the original message
    // This way, when viewing an admin message, we don't show the original subject again

    // Find customer replies specifically for this message
    const customerReplies = await prisma.techTeamMessage.findMany({
      where: {
        userId: user.id,
        createdAt: { gt: currentMessage.createdAt },
        OR: [
          // Direct replies to this message
          { userMessageId: messageId },
          // Messages with reference to this message
          { subject: { contains: `[Ref:${messageId}]` } },
        ],
      },
      include: {
        attachments: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Add these customer replies to the thread
    for (const reply of customerReplies) {
      threadResponses.push({
        id: reply.id,
        sender: "You",
        subject: reply.subject,
        message: reply.message,
        category: reply.category as unknown as MessageCategory,
        priority: reply.priority,
        messageType: reply.messageType,
        createdAt: reply.createdAt,
        isCustomerMessage: true,
        attachments: reply.attachments.map((attachment) => ({
          id: attachment.id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          createdAt: attachment.createdAt,
          messageId: reply.id,
        })),
      });
    }

    return {
      success: true,
      messages: threadResponses,
    };
  } catch (error) {
    console.error("Error fetching message thread:", error);
    return {
      error: "Failed to fetch message thread",
    };
  }
}
