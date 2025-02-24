"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function getTechTeamMessages() {
  try {
    // Validate user has admin privileges
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return { error: "Access denied. Admin privileges required." };
    }

    // Explicitly select all fields to make it clear what's being fetched
    const messages = await prisma.techTeamMessage.findMany({
      select: {
        // All base TechTeamMessage fields
        id: true,
        subject: true,
        message: true,
        category: true,
        messageType: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        userId: true,

        // Include related entities with specific fields we need
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
        createdAt: "desc",
      },
    });

    return {
      success: true,
      messages,
    };
  } catch (error) {
    console.error("Error fetching tech team messages:", error);
    return {
      error: "Failed to fetch tech team messages",
    };
  }
}
