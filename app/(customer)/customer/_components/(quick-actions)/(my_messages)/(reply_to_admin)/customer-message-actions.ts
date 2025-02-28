"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { MessageCategory, Prisma } from "@prisma/client";
import { z } from "zod";
import {
  CustomerMessageResponse,
  fileValidationSchema,
} from "./customer-validations";

// Create a new conversation with the initial message
export async function createCustomerMessage(
  formData: FormData,
): Promise<CustomerMessageResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Extract form fields
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const category = formData.get("category") as MessageCategory;

    // Basic validation
    if (!subject || !message || !category) {
      return { error: "Missing required fields" };
    }

    // Handle file uploads
    const files = formData.getAll("attachments") as File[];

    // Validate each file
    for (const file of files) {
      try {
        fileValidationSchema.parse(file);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            error: `File ${file.name}: ${error.errors[0].message}`,
          };
        }
        throw error;
      }
    }

    // Process attachments
    const attachmentPromises = files.map(async (file) => {
      try {
        const timestamp = Date.now();
        const path = `customer/${user.id}/messages/${timestamp}_${file.name}`;

        const blob = await put(path, file, {
          access: "public",
          addRandomSuffix: false,
        });

        if (!blob.url) throw new Error("Failed to upload file");

        return {
          fileName: file.name,
          fileUrl: blob.url,
        };
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        return null;
      }
    });

    // Filter out failed uploads
    const attachments = (await Promise.all(attachmentPromises)).filter(
      (attachment): attachment is NonNullable<typeof attachment> =>
        attachment !== null,
    );

    // Create conversation and user message in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the conversation
      const conversation = await tx.conversation.create({
        data: {
          subject: subject,
        },
      });

      // Create the user message
      const userMessage = await tx.userMessage.create({
        data: {
          sender: user.username || user.email,
          preview: message.substring(0, 100),
          message: message,
          category: category,
          isUnread: true,
          hasAttachment: attachments.length > 0,
          isInitial: true,
          user: {
            connect: {
              id: user.id,
            },
          },
          conversation: {
            connect: {
              id: conversation.id,
            },
          },
          attachments: {
            create: attachments,
          },
        },
        include: {
          attachments: true,
        },
      });

      return { conversation, userMessage };
    });

    return {
      success: true,
      messageId: result.userMessage.id,
      conversationId: result.conversation.id,
      attachments: result.userMessage.attachments,
    };
  } catch (error) {
    console.error("Customer message creation error:", error);

    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error: "Database error occurred. Please try again.",
      };
    }

    return {
      error: "Something went wrong. Please try again.",
    };
  }
}

// Add a reply to an existing conversation
export async function replyToConversation(
  conversationId: string,
  formData: FormData,
): Promise<CustomerMessageResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        userMessages: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!conversation) {
      return { error: "Conversation not found" };
    }

    // Verify that the user is a participant in this conversation
    if (conversation.userMessages.length === 0) {
      return {
        error: "You don't have permission to reply to this conversation",
      };
    }

    // Extract form data
    const message = formData.get("message") as string;
    const category = formData.get("category") as MessageCategory;

    // Basic validation
    if (!message || !category) {
      return { error: "Missing required fields" };
    }

    // Handle file uploads
    const files = formData.getAll("attachments") as File[];

    // Validate each file
    for (const file of files) {
      try {
        fileValidationSchema.parse(file);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            error: `File ${file.name}: ${error.errors[0].message}`,
          };
        }
        throw error;
      }
    }

    // Process attachments
    const attachmentPromises = files.map(async (file) => {
      try {
        const timestamp = Date.now();
        const path = `customer/${user.id}/messages/${timestamp}_${file.name}`;

        const blob = await put(path, file, {
          access: "public",
          addRandomSuffix: false,
        });

        if (!blob.url) throw new Error("Failed to upload file");

        return {
          fileName: file.name,
          fileUrl: blob.url,
        };
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        return null;
      }
    });

    // Filter out failed uploads
    const attachments = (await Promise.all(attachmentPromises)).filter(
      (attachment): attachment is NonNullable<typeof attachment> =>
        attachment !== null,
    );

    // Create the user message and update conversation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user message
      const userMessage = await tx.userMessage.create({
        data: {
          sender: user.username || user.email,
          preview: message.substring(0, 100),
          message: message,
          category: category,
          isUnread: true,
          hasAttachment: attachments.length > 0,
          isInitial: false,
          user: {
            connect: {
              id: user.id,
            },
          },
          conversation: {
            connect: {
              id: conversationId,
            },
          },
          attachments: {
            create: attachments,
          },
        },
        include: {
          attachments: true,
        },
      });

      // Update the conversation's updatedAt timestamp
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return userMessage;
    });

    return {
      success: true,
      messageId: result.id,
      conversationId: conversationId,
      attachments: result.attachments,
    };
  } catch (error) {
    console.error("Customer reply error:", error);

    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error: "Database error occurred. Please try again.",
      };
    }

    return {
      error: "Something went wrong. Please try again.",
    };
  }
}

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
