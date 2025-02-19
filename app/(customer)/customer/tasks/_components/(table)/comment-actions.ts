"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { TaskComment } from "@prisma/client";

export type CreateCommentResponse = {
  success: boolean;
  data?: TaskComment;
  error?: string;
};

export async function createTaskComment(
  taskId: string,
  content: string,
): Promise<CreateCommentResponse> {
  try {
    // Validate user authentication and authorization
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (!["CUSTOMER", "PROCUSTOMER", "ADMIN"].includes(user.role)) {
      return redirect("/login");
    }

    // Validate inputs
    if (!taskId) throw new Error("Task ID is required");
    if (!content.trim()) throw new Error("Comment content is required");

    // Verify task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          customerId: user.id,
        },
      },
    });

    if (!task) {
      throw new Error("Task not found or access denied");
    }

    // Create comment
    const comment = await prisma.taskComment.create({
      data: {
        content: content.trim(),
        taskId,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return {
      success: true,
      data: comment,
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}

export type DeleteCommentResponse = {
  success: boolean;
  error?: string;
};

export async function deleteTaskComment(
  commentId: string,
): Promise<DeleteCommentResponse> {
  try {
    // Validate user authentication and authorization
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (!["CUSTOMER", "PROCUSTOMER", "ADMIN"].includes(user.role)) {
      return redirect("/login");
    }

    // Verify comment exists and user has access
    const comment = await prisma.taskComment.findFirst({
      where: {
        id: commentId,
        task: {
          project: {
            customerId: user.id,
          },
        },
      },
    });

    if (!comment) {
      throw new Error("Comment not found or access denied");
    }

    // Delete comment
    await prisma.taskComment.delete({
      where: {
        id: commentId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}

export type UpdateCommentResponse = {
  success: boolean;
  data?: TaskComment;
  error?: string;
};

export async function updateTaskComment(
  commentId: string,
  content: string,
): Promise<UpdateCommentResponse> {
  try {
    // Validate user authentication and authorization
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (!["CUSTOMER", "PROCUSTOMER", "ADMIN"].includes(user.role)) {
      return redirect("/login");
    }

    // Validate input
    if (!content.trim()) throw new Error("Comment content is required");

    // Verify comment exists and user has access
    const comment = await prisma.taskComment.findFirst({
      where: {
        id: commentId,
        task: {
          project: {
            customerId: user.id,
          },
        },
      },
    });

    if (!comment) {
      throw new Error("Comment not found or access denied");
    }

    // Update comment
    const updatedComment = await prisma.taskComment.update({
      where: {
        id: commentId,
      },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedComment,
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update comment",
    };
  }
}
