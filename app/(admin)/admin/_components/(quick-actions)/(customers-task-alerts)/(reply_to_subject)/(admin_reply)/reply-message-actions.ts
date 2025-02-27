"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { UserRole, MessageCategory } from "@prisma/client";
import { z } from "zod";

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

export async function respondToMessage(formData: FormData) {
  try {
    // Validate user has admin privileges
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return { error: "Access denied. Admin privileges required." };
    }

    // Extract form data
    const techTeamMessageId = formData.get("techTeamMessageId") as string;
    const subject = formData.get("subject") as string;
    const preview = formData.get("preview") as string;
    const message = formData.get("message") as string;
    const category = formData.get("category") as MessageCategory;

    // Validate required fields
    if (!techTeamMessageId || !subject || !message || !category) {
      return { error: "Missing required fields" };
    }

    // Fetch the original tech team message to get user information
    const techTeamMessage = await prisma.techTeamMessage.findUnique({
      where: { id: techTeamMessageId },
      include: { user: true },
    });

    if (!techTeamMessage) {
      return { error: "Original message not found" };
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
        const path = `admin/${user.id}/responses/${timestamp}_${file.name}`;

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

    // Create a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create the user message
      const userMessage = await tx.userMessage.create({
        data: {
          sender: user.displayName,
          subject: subject || `Re: ${techTeamMessage.subject}`,
          preview: preview,
          category: category,
          isUnread: true,
          hasAttachment: attachments.length > 0,
          userId: techTeamMessage.userId,
          // Link this message to the original tech team message
          techTeamResponse: {
            connect: {
              id: techTeamMessageId,
            },
          },
          // Create the attachments for this message
          attachments: {
            create: attachments,
          },
        },
        include: {
          attachments: true,
        },
      });

      return {
        success: true,
        messageId: userMessage.id,
        attachments: userMessage.attachments,
      };
    });

    return result;
  } catch (error) {
    console.error("Error sending response message:", error);
    return {
      error: "Failed to send response message",
    };
  }
}
