"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

// Get all conversations for the current customer
export async function getCustomerConversations() {
  try {
    // Validate user authentication (must be a logged-in user)
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Users can only view their own conversations
    const userId = user.id;

    // Fetch conversations and their messages
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userMessages: {
              some: {
                userId: userId,
              },
            },
          },
          {
            techTeamMessages: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        userMessages: {
          where: {
            OR: [
              { userId: userId },
              { isInitial: false }, // Admin replies
            ],
          },
          include: {
            attachments: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        techTeamMessages: {
          where: {
            userId: userId,
          },
          include: {
            attachments: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return {
      success: true,
      conversations,
    };
  } catch (error) {
    console.error("Error fetching customer conversations:", error);
    return {
      error: "Failed to load conversations",
    };
  }
}

// Get customer's unread message count
export async function getCustomerUnreadCount() {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Count unread messages directed to this user
    const unreadCount = await prisma.userMessage.count({
      where: {
        AND: [
          { isUnread: true },
          { userId: { not: user.id } }, // Messages not created by this user (i.e., admin replies)
          {
            conversation: {
              userMessages: {
                some: {
                  userId: user.id, // Only in conversations the user is part of
                },
              },
            },
          },
        ],
      },
    });

    return {
      success: true,
      unreadCount,
    };
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return {
      error: "Failed to count messages",
    };
  }
}

// Mark messages as read for the customer
export async function markCustomerMessagesAsRead(conversationId: string) {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Update all unread messages in the specified conversation that are directed to this user
    const result = await prisma.userMessage.updateMany({
      where: {
        conversationId,
        isUnread: true,
        userId: { not: user.id }, // Only mark messages from others as read
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
