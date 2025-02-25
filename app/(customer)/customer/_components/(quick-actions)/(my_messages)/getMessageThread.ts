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

    // Create the thread responses array
    const threadResponses = [];

    // Only add the customer's direct reply (techTeamResponse) if it exists
    if (originalMessage.techTeamResponse) {
      const customerReply = originalMessage.techTeamResponse;

      threadResponses.push({
        id: customerReply.id,
        sender: "You", // This is the customer's reply
        subject: customerReply.subject,
        message: customerReply.message,
        category: customerReply.category as unknown as MessageCategory,
        priority: customerReply.priority,
        messageType: customerReply.messageType,
        createdAt: customerReply.createdAt,
        isCustomerMessage: true, // This is from the customer
        attachments: customerReply.attachments.map((attachment) => ({
          id: attachment.id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          createdAt: attachment.createdAt,
          messageId: customerReply.id,
        })),
      });
    }

    // Find ANY TechTeamMessages from this user (remove all filtering first for debugging)
    const allUserReplies = await prisma.techTeamMessage.findMany({
      where: {
        userId: user.id,
      },
      include: {
        attachments: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Now apply our actual filtering
    const relatedReplies = allUserReplies.filter((reply) => {
      // If this is already added as the direct response, skip it
      if (
        originalMessage.techTeamResponse &&
        reply.id === originalMessage.techTeamResponse.id
      ) {
        return false;
      }

      // Check if subject contains the original subject
      const subjectMatches =
        reply.subject.includes(originalMessage.subject) ||
        reply.subject.includes(`Re: ${originalMessage.subject}`);

      return subjectMatches;
    });

    // Add all related customer replies to the thread
    for (const reply of relatedReplies) {
      threadResponses.push({
        id: reply.id,
        sender: "You", // Customer's message
        subject: reply.subject,
        message: reply.message,
        category: reply.category as unknown as MessageCategory,
        priority: reply.priority,
        messageType: reply.messageType,
        createdAt: reply.createdAt,
        isCustomerMessage: true, // This is from the customer
        attachments: reply.attachments.map((attachment) => ({
          id: attachment.id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          createdAt: attachment.createdAt,
          messageId: reply.id,
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
