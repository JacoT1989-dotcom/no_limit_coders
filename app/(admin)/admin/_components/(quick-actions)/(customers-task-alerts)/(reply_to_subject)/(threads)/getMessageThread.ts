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

      // Extract reference ID if present in the subject
      const refMatch = techTeamMessage.subject.match(/\[Ref:([^\]]+)\]/);
      const referenceId = refMatch ? refMatch[0] : null;

      // Get all user messages that are responses to the original message
      const responseMessages = await prisma.userMessage.findMany({
        where: {
          userId: techTeamMessage.userId,
          OR: [
            // Match exact subject
            { subject: techTeamMessage.subject },
            // Match subject with Re: prefix
            {
              subject: {
                startsWith: `Re: ${techTeamMessage.subject.replace(/^(Re:\s*)+/i, "")}`,
              },
            },
            // Match subject with reference ID if present
            ...(referenceId ? [{ subject: { contains: referenceId } }] : []),
          ],
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

      console.log(`Found ${responseMessages.length} related responses`);

      // Debug: Log all response messages with their complete fields
      console.log("=== RAW DATABASE RESPONSES ===");
      responseMessages.forEach((respMsg, idx) => {
        console.log(`Raw Response ${idx} (${respMsg.id}):`);
        // Log all properties to see what's available
        console.log(
          JSON.stringify(
            {
              id: respMsg.id,
              sender: respMsg.sender,
              subject: respMsg.subject,
              preview: respMsg.preview?.substring(0, 30) + "...",
              message: respMsg.message
                ? respMsg.message.substring(0, 30) + "..."
                : undefined,
              category: respMsg.category,
              isUnread: respMsg.isUnread,
              hasAttachment: respMsg.hasAttachment,
              createdAt: respMsg.createdAt,
              userId: respMsg.userId,
              attachmentsCount: respMsg.attachments?.length || 0,
            },
            null,
            2,
          ),
        );
      });
      console.log("=== END RAW RESPONSES ===");

      // Process each response message
      for (const respMsg of responseMessages) {
        // Debug: Log what we're adding to the responses array
        console.log(`Building response object for ${respMsg.id}`);
        console.log(
          `Message field exists: ${respMsg.hasOwnProperty("message")}`,
        );
        console.log(
          `Message content length: ${respMsg.message ? respMsg.message.length : 0}`,
        );

        // Add the message with its attachments to the responses array
        const responseObject = {
          id: respMsg.id,
          sender: respMsg.sender,
          subject: respMsg.subject,
          preview: respMsg.preview || "",
          message: respMsg.message || "", // This should include the message field if it exists
          category: respMsg.category,
          createdAt: respMsg.createdAt,
          attachments: respMsg.attachments.map((att) => ({
            ...att,
            messageId: respMsg.id, // Explicitly set the messageId to ensure association
          })),
        };

        console.log(`Built response object:`, {
          id: responseObject.id,
          hasMessage: !!responseObject.message,
          messageLength: responseObject.message?.length || 0,
          previewLength: responseObject.preview?.length || 0,
        });

        responses.push(responseObject);

        console.log(
          `Response ${respMsg.id}: ${respMsg.subject} has ${respMsg.attachments.length} attachments`,
        );
      }

      // Log response details
      console.log("=== FINAL PROCESSED RESPONSES ===");
      responses.forEach((resp, index) => {
        console.log(`Response ${index} details:`, {
          id: resp.id,
          subject: resp.subject,
          preview: resp.preview?.substring(0, 30) + "...",
          message: resp.message
            ? resp.message.substring(0, 30) + "..."
            : "undefined",
          messageLength: resp.message ? resp.message.length : 0,
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
      console.log("=== END PROCESSED RESPONSES ===");
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
