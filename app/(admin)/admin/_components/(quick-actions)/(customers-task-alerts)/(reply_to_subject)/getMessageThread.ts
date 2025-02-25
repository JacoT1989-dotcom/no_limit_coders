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
      return { error: "Message not found" };
    }

    // If there's a linked user message, get all responses
    let responses: {
      id: string;
      sender: string;
      subject: string;
      preview: string;
      category: string;
      isUnread: boolean;
      hasAttachment: boolean;
      createdAt: Date;
      userId: string;
      attachments: {
        id: string;
        fileName: string;
        fileUrl: string;
        createdAt: Date;
        messageId: string;
      }[];
    }[] = [];

    if (techTeamMessage.userMessageId) {
      // Get all user messages that are responses to the original message
      responses = await prisma.userMessage.findMany({
        where: {
          userId: techTeamMessage.userId,
          // Filter for related messages (e.g., by subject or other criteria)
          subject: {
            contains: techTeamMessage.subject,
          },
          // Exclude the original message
          id: { not: techTeamMessage.userMessageId },
        },
        include: {
          attachments: true,
        },
        orderBy: {
          createdAt: "asc",
        },
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
