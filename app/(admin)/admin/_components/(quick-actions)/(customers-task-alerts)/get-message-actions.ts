"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// In get-message-actions.ts or similar file
export async function getConversations() {
  try {
    // Validate user has admin privileges
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return { error: "Access denied. Admin privileges required." };
    }

    // Fetch conversations with their messages
    const conversations = await prisma.conversation.findMany({
      include: {
        techTeamMessages: {
          include: {
            attachments: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        userMessages: {
          include: {
            attachments: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
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
    console.error("Error fetching conversations:", error);
    return {
      error: "Failed to fetch conversations",
    };
  }
}
export async function getConversationById(conversationId: string) {
  try {
    // Validate user has admin privileges
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return { error: "Access denied. Admin privileges required." };
    }

    // Fetch the specific conversation with all its messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        techTeamMessages: {
          include: {
            attachments: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        userMessages: {
          include: {
            attachments: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return { error: "Conversation not found" };
    }

    return {
      success: true,
      conversation,
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return {
      error: "Failed to fetch conversation",
    };
  }
}

export async function getCustomerMessageCount() {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return { error: "Access denied. Admin privileges required." };
    }

    // Count unique conversations
    const conversationCount = await prisma.conversation.count();

    // Count unread messages
    const unreadCount = await prisma.userMessage.count({
      where: {
        isUnread: true,
      },
    });

    return {
      success: true,
      conversationCount,
      unreadCount,
    };
  } catch (error) {
    console.error("Error counting messages:", error);
    return {
      error: "Failed to count messages",
    };
  }
}
