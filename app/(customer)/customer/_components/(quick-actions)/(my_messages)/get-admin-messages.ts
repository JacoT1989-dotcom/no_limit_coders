"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function getUserMessages() {
  try {
    // Validate user is authenticated
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Fetch all user messages for the current user with their attachments
    // Here's the key fix: We want to show admin responses to the customer, not the customer's original messages
    const messages = await prisma.userMessage.findMany({
      where: {
        userId: user.id,
      },
      select: {
        // All base UserMessage fields - these will contain the ADMIN response data
        id: true,
        sender: true,
        subject: true,
        preview: true,
        category: true,
        isUnread: true,
        hasAttachment: true,
        createdAt: true,
        userId: true,

        // Include attachments with all their fields
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            createdAt: true,
            messageId: true,
          },
        },

        // Include the related tech team message (original customer message)
        // Used for reference only, NOT for display in the message list
        techTeamResponse: {
          select: {
            id: true,
            subject: true,
            priority: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      messages,
    };
  } catch (error) {
    console.error("Error fetching user messages:", error);
    return {
      error: "Failed to fetch messages",
    };
  }
}
