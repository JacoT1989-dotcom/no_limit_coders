"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { Prisma, Priority } from "@prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect";
import { z } from "zod";
import type {
  TechTeamMessageCategory,
  TechTeamMessageType,
  TechTeamMessageResponse,
  DeleteTechTeamMessageResponse,
  GetTechTeamMessagesResponse,
  GetConversationsResponse,
} from "./types";
import {
  techTeamMessageSchema,
  newConversationWithMessageSchema,
} from "./validations";

const fileValidationSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB",
  )
  .refine(
    (file) =>
      [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ].includes(file.type),
    "Invalid file type. Accepted types: images, PDF, Word documents, and text files",
  );

type FormDataNewConversation = {
  subject: string;
  message: string;
  category: TechTeamMessageCategory;
  messageType: TechTeamMessageType;
  priority: Priority;
};

type FormDataMessage = {
  message: string;
  category: TechTeamMessageCategory;
  messageType: TechTeamMessageType;
  priority: Priority;
};

// Create a new conversation with the initial message
export async function createConversationWithMessage(
  formData: FormData,
): Promise<TechTeamMessageResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Extract form fields
    const messageData: FormDataNewConversation = {
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
      category: formData.get("category") as TechTeamMessageCategory,
      messageType: formData.get("messageType") as TechTeamMessageType,
      priority: formData.get("priority") as Priority,
    };

    // Validate form data (excluding attachments)
    const validatedData = newConversationWithMessageSchema
      .omit({ attachments: true })
      .parse(messageData);

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
        const path = `tech-team/${user.id}/messages/${timestamp}_${file.name}`;

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

    // Create conversation and message in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the conversation
      const conversation = await tx.conversation.create({
        data: {
          subject: validatedData.subject,
        },
      });

      // Create the tech team message
      const message = await tx.techTeamMessage.create({
        data: {
          message: validatedData.message,
          category: validatedData.category,
          messageType: validatedData.messageType,
          priority: validatedData.priority,
          attachments: {
            create: attachments,
          },
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
        },
        include: {
          attachments: true,
        },
      });

      return { conversation, message };
    });

    return {
      success: true,
      messageId: result.message.id,
      conversationId: result.conversation.id,
      attachments: result.message.attachments,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Conversation and message creation error:", error);

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

// Add a message to an existing conversation
export async function addMessageToConversation(
  conversationId: string,
  formData: FormData,
): Promise<TechTeamMessageResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return { error: "Conversation not found" };
    }

    // Extract form fields
    const messageData: FormDataMessage = {
      message: formData.get("message") as string,
      category: formData.get("category") as TechTeamMessageCategory,
      messageType: formData.get("messageType") as TechTeamMessageType,
      priority: formData.get("priority") as Priority,
    };

    // Validate form data (excluding attachments)
    const validatedData = techTeamMessageSchema
      .omit({ attachments: true })
      .parse(messageData);

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
        const path = `tech-team/${user.id}/messages/${timestamp}_${file.name}`;

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

    // Create message
    const message = await prisma.techTeamMessage.create({
      data: {
        message: validatedData.message,
        category: validatedData.category,
        messageType: validatedData.messageType,
        priority: validatedData.priority,
        attachments: {
          create: attachments,
        },
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
      },
      include: {
        attachments: true,
      },
    });

    return {
      success: true,
      messageId: message.id,
      conversationId: conversation.id,
      attachments: message.attachments,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Message creation error:", error);

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

export async function createUserMessage(
  formData: FormData,
): Promise<TechTeamMessageResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const category = formData.get("category") as string;

    if (!subject || !message || !category) {
      return { error: "Missing required fields" };
    }

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
          category: category as any,
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
        },
      });

      return { conversation, userMessage };
    });

    return {
      success: true,
      messageId: result.userMessage.id,
      conversationId: result.conversation.id,
    };
  } catch (error) {
    console.error("User message creation error:", error);

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

export async function addUserMessageToConversation(
  conversationId: string,
  formData: FormData,
): Promise<TechTeamMessageResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return { error: "Conversation not found" };
    }

    const message = formData.get("message") as string;
    const category = formData.get("category") as string;

    if (!message || !category) {
      return { error: "Missing required fields" };
    }

    // Create the user message
    const userMessage = await prisma.userMessage.create({
      data: {
        sender: user.username || user.email,
        preview: message.substring(0, 100),
        message: message,
        category: category as any,
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
      },
    });

    return {
      success: true,
      messageId: userMessage.id,
      conversationId: conversation.id,
    };
  } catch (error) {
    console.error("User message creation error:", error);

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

export async function getTechTeamMessages(
  userId?: string,
): Promise<GetTechTeamMessagesResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Users can only view their own messages
    const targetUserId = userId || user.id;

    // Ensure users can only access their own messages
    if (targetUserId !== user.id) {
      throw new Error("You can only view your own messages");
    }

    const messages = await prisma.techTeamMessage.findMany({
      where: {
        userId: targetUserId,
      },
      include: {
        attachments: true,
        conversation: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      messages: messages.map((message) => ({
        id: message.id,
        message: message.message,
        category: message.category as TechTeamMessageCategory,
        messageType: message.messageType as TechTeamMessageType,
        priority: message.priority,
        createdAt: message.createdAt,
        conversationId: message.conversationId,
        attachments: message.attachments.map((attachment) => ({
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching tech team messages:", error);
    return { error: "Failed to load messages" };
  }
}

export async function getConversations(
  userId?: string,
): Promise<GetConversationsResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Users can only view their own conversations
    const targetUserId = userId || user.id;

    // Ensure users can only access their own conversations
    if (targetUserId !== user.id) {
      throw new Error("You can only view your own conversations");
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userMessages: {
              some: {
                userId: targetUserId,
              },
            },
          },
          {
            techTeamMessages: {
              some: {
                userId: targetUserId,
              },
            },
          },
        ],
      },
      include: {
        userMessages: {
          where: {
            userId: targetUserId,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        techTeamMessages: {
          where: {
            userId: targetUserId,
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
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        subject: conversation.subject,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        userMessages: conversation.userMessages,
        techTeamMessages: conversation.techTeamMessages,
      })),
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { error: "Failed to load conversations" };
  }
}

export async function deleteTechTeamMessage(
  messageId: string,
): Promise<DeleteTechTeamMessageResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    const message = await prisma.techTeamMessage.findUnique({
      where: { id: messageId },
      include: {
        attachments: true,
      },
    });

    if (!message) {
      return { error: "Message not found" };
    }

    // Users can only delete their own messages
    if (message.userId !== user.id) {
      return { error: "You can only delete your own messages" };
    }

    // Delete the message and its attachments in a transaction
    await prisma.$transaction([
      prisma.techTeamMessageAttachment.deleteMany({
        where: { messageId },
      }),
      prisma.techTeamMessage.delete({
        where: { id: messageId },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error deleting tech team message:", error);
    return { error: "Failed to delete message" };
  }
}

export async function updateTechTeamMessage(
  messageId: string,
  formData: FormData,
): Promise<TechTeamMessageResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Check if message exists and belongs to user
    const existingMessage = await prisma.techTeamMessage.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return { error: "Message not found" };
    }

    if (existingMessage.userId !== user.id) {
      return { error: "You can only update your own messages" };
    }

    // Extract and validate form data
    const messageData: FormDataMessage = {
      message: formData.get("message") as string,
      category: formData.get("category") as TechTeamMessageCategory,
      messageType: formData.get("messageType") as TechTeamMessageType,
      priority: formData.get("priority") as Priority,
    };

    const validatedData = techTeamMessageSchema
      .omit({ attachments: true })
      .parse(messageData);

    // Handle new file uploads
    const files = formData.getAll("attachments") as File[];

    // Validate each new file
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

    // Process new attachments
    const attachmentPromises = files.map(async (file) => {
      try {
        const timestamp = Date.now();
        const path = `tech-team/${user.id}/messages/${timestamp}_${file.name}`;

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
    const newAttachments = (await Promise.all(attachmentPromises)).filter(
      (attachment): attachment is NonNullable<typeof attachment> =>
        attachment !== null,
    );

    // Update message and add new attachments
    const updatedMessage = await prisma.techTeamMessage.update({
      where: { id: messageId },
      data: {
        message: validatedData.message,
        category: validatedData.category,
        messageType: validatedData.messageType,
        priority: validatedData.priority,
        attachments: {
          create: newAttachments,
        },
      },
      include: {
        attachments: true,
      },
    });

    return {
      success: true,
      messageId: updatedMessage.id,
      conversationId: existingMessage.conversationId,
      attachments: updatedMessage.attachments,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Tech team message update error:", error);

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
