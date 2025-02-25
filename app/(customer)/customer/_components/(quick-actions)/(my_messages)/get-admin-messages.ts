"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function getUserMessages() {
  try {
    // Validate user is authenticated
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Fetch all user messages for the current user with their attachments
    // Explicitly select all fields to make it clear what's being fetched
    const messages = await prisma.userMessage.findMany({
      where: {
        userId: user.id,
      },
      select: {
        // All base UserMessage fields
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

        // Include the related tech team response if it exists (one-to-one)
        techTeamResponse: {
          select: {
            id: true,
            subject: true,
            message: true,
            category: true,
            messageType: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
            attachments: {
              select: {
                id: true,
                fileName: true,
                fileUrl: true,
                createdAt: true,
              },
            },
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
