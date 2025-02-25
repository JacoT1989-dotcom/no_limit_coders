"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { MessageCategory } from "@prisma/client";

export async function getMessageThread(messageId: string) {
  try {
    // Validate user is authenticated
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // First, get the original message to ensure it belongs to the current user
    const originalMessage = await prisma.userMessage.findUnique({
      where: {
        id: messageId,
        userId: user.id,
      },
      include: {
        attachments: true,
        techTeamResponse: {
          include: {
            attachments: true,
          },
        },
      },
    });

    if (!originalMessage) {
      return {
        error: "Message not found or you don't have permission to view it",
      };
    }

    // Create the thread responses array, starting with the original user message
    const threadResponses = [
      {
        id: originalMessage.id,
        sender: "You", // Changed to indicate this is the customer's message
        subject: originalMessage.subject,
        message: originalMessage.preview,
        category: originalMessage.category, // This is already a MessageCategory enum
        priority: "MEDIUM", // Default priority for user messages
        messageType: "MESSAGE",
        createdAt: originalMessage.createdAt,
        isCustomerMessage: true, // Set to true for customer's message
        attachments: originalMessage.attachments.map((attachment) => ({
          id: attachment.id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          createdAt: attachment.createdAt,
          messageId: originalMessage.id,
        })),
      },
    ];

    // If there's a tech team response, add it to the thread
    if (originalMessage.techTeamResponse) {
      const techResponse = originalMessage.techTeamResponse; // Assign to a constant to satisfy TypeScript

      threadResponses.push({
        id: techResponse.id,
        sender: "Tech Support Team",
        subject: techResponse.subject,
        message: techResponse.message,
        category: techResponse.category as unknown as MessageCategory, // Cast to MessageCategory
        priority: techResponse.priority,
        messageType: techResponse.messageType,
        createdAt: techResponse.createdAt,
        isCustomerMessage: false, // Set to false for tech team messages
        attachments: techResponse.attachments.map((attachment) => ({
          id: attachment.id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          createdAt: attachment.createdAt,
          messageId: techResponse.id,
        })),
      });
    }

    // Sort by createdAt ascending so oldest messages appear first
    threadResponses.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

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
