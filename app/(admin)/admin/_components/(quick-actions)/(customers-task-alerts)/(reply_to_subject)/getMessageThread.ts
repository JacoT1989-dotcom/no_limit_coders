"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function getMessageThread(techTeamMessageId: string) {
  try {
    // Validate user has admin privileges
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return { error: "Access denied. Admin privileges required." };
    }

    console.log(
      "Fetching message thread for techTeamMessageId:",
      techTeamMessageId,
    );

    // Get the tech team message with associated user messages
    const techTeamMessage = await prisma.techTeamMessage.findUnique({
      where: { id: techTeamMessageId },
      include: {
        user: {
          select: {
            displayName: true,
            email: true,
            avatarUrl: true,
          },
        },
        // Find the user message that's linked to this tech team message
        userMessage: {
          include: {
            attachments: true,
          },
        },
      },
    });

    if (!techTeamMessage) {
      console.log("Original tech team message not found");
      return { error: "Message not found" };
    }

    console.log("Original tech team message found:", {
      id: techTeamMessage.id,
      subject: techTeamMessage.subject,
      userMessageId: techTeamMessage.userMessageId,
      hasUserMessage: !!techTeamMessage.userMessage,
    });

    if (techTeamMessage.userMessage) {
      console.log("Associated userMessage:", {
        id: techTeamMessage.userMessage.id,
        subject: techTeamMessage.userMessage.subject,
        hasAttachments: techTeamMessage.userMessage.attachments?.length > 0,
        attachmentsCount: techTeamMessage.userMessage.attachments?.length,
      });
    }

    // If there's a linked user message, get all responses
    const responses = [];

    if (techTeamMessage.userMessageId) {
      console.log(
        "Looking for related responses with userId:",
        techTeamMessage.userId,
      );
      console.log("And subject containing:", techTeamMessage.subject);

      // Get all user messages that are responses to the original message
      // CRITICAL: Use separate queries for each message to ensure attachments are properly grouped
      const responseMessages = await prisma.userMessage.findMany({
        where: {
          userId: techTeamMessage.userId,
          // Filter for related messages by subject
          subject: {
            contains: techTeamMessage.subject,
          },
          // Exclude the original message
          id: { not: techTeamMessage.userMessageId },
        },
        select: {
          id: true,
          sender: true,
          subject: true,
          preview: true,
          category: true,
          isUnread: true,
          hasAttachment: true,
          createdAt: true,
          userId: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      console.log(`Found ${responseMessages.length} related responses`);

      // For each message, get its attachments separately to ensure proper relationship
      for (const respMsg of responseMessages) {
        // Get attachments for this specific message
        const msgAttachments = await prisma.messageAttachment.findMany({
          where: {
            messageId: respMsg.id,
          },
        });

        // Add the message with its attachments to the responses array
        responses.push({
          ...respMsg,
          attachments: msgAttachments.map((att) => ({
            ...att,
            messageId: respMsg.id, // Explicitly set the messageId to ensure association
          })),
        });

        console.log(
          `Response ${respMsg.id}: ${respMsg.subject} has ${msgAttachments.length} attachments`,
        );
      }

      // Log response details
      responses.forEach((resp, index) => {
        console.log(`Response ${index} details:`, {
          id: resp.id,
          subject: resp.subject,
          preview: resp.preview,
          attachmentsCount: resp.attachments.length,
        });

        if (resp.attachments.length > 0) {
          resp.attachments.forEach((att, i) => {
            console.log(`  Attachment ${i} for response ${resp.id}:`, {
              id: att.id,
              fileName: att.fileName,
              messageId: att.messageId,
            });
          });
        }
      });
    }

    return {
      success: true,
      original: techTeamMessage,
      responses,
    };
  } catch (error) {
    console.error("Error fetching message thread:", error);
    return {
      error: "Failed to fetch message thread",
    };
  }
}
