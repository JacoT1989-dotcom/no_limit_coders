"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { TaskComment } from "@prisma/client";

// Updated author information to include avatarUrl
type CommentWithAuthor = TaskComment & {
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
};

export type CreateCommentResponse = {
  success: boolean;
  data?: CommentWithAuthor;
  error?: string;
};

export type UpdateCommentResponse = {
  success: boolean;
  data?: CommentWithAuthor;
  error?: string;
};

export type DeleteCommentResponse = {
  success: boolean;
  error?: string;
};

// Get all comments for a task
export async function getTaskComments(
  taskId: string,
): Promise<CommentWithAuthor[]> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (!["CUSTOMER", "PROCUSTOMER", "ADMIN"].includes(user.role)) {
      return redirect("/login");
    }

    // First check if user has access to this task
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

    // Get all comments for the task with the author information including avatarUrl
    const comments = await prisma.taskComment.findMany({
      where: {
        taskId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true, // Make sure this field is included
          },
        },
      },
    });

    console.log("[Debug] Retrieved task comments with authors:", {
      taskId,
      commentCount: comments.length,
      sampleAuthor: comments.length > 0 ? comments[0].author : null,
      hasAvatarUrls: comments.map((c) => !!c.author?.avatarUrl),
    });

    return comments as CommentWithAuthor[];
  } catch (error) {
    console.error("Error getting task comments:", error);
    throw error;
  }
}

export async function createTaskComment(
  taskId: string,
  content: string,
): Promise<CreateCommentResponse> {
  try {
    console.log("[Debug] createTaskComment called with:", { taskId, content });

    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (!["CUSTOMER", "PROCUSTOMER", "ADMIN"].includes(user.role)) {
      return redirect("/login");
    }

    console.log("[Debug] User authenticated:", {
      userId: user.id,
      role: user.role,
    });

    if (!taskId) throw new Error("Task ID is required");
    if (!content.trim()) throw new Error("Comment content is required");

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

    // First, get the current user information to debug avatarUrl
    const authorUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    console.log(
      "[Debug] Author user info before creating comment:",
      authorUser,
    );

    // Define author data to ensure proper structure
    const authorData = {
      id: authorUser?.id || user.id,
      displayName: authorUser?.displayName || "Unknown User",
      avatarUrl: authorUser?.avatarUrl || null,
    };

    // Create the comment with proper author data structure
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
            avatarUrl: true,
          },
        },
      },
    });

    // Make sure the avatarUrl is preserved
    const enhancedComment = {
      ...comment,
      author: {
        ...comment.author,
        avatarUrl: comment.author.avatarUrl || authorData.avatarUrl,
      },
    };

    console.log("[Debug] Created comment with author:", {
      commentId: enhancedComment.id,
      authorId: enhancedComment.authorId,
      authorInfo: enhancedComment.author,
      hasAvatarUrl: enhancedComment.author.avatarUrl !== undefined,
      avatarUrl: enhancedComment.author.avatarUrl,
    });

    return {
      success: true,
      data: enhancedComment as CommentWithAuthor,
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

export async function updateTaskComment(
  commentId: string,
  content: string,
): Promise<UpdateCommentResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (!["CUSTOMER", "PROCUSTOMER", "ADMIN"].includes(user.role)) {
      return redirect("/login");
    }

    if (!content.trim()) throw new Error("Comment content is required");

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
            avatarUrl: true,
          },
        },
      },
    });

    console.log("[Debug] Updated comment with author:", {
      commentId: updatedComment.id,
      authorId: updatedComment.authorId,
      authorInfo: updatedComment.author,
      hasAvatarUrl: updatedComment.author.avatarUrl !== undefined,
      avatarUrl: updatedComment.author.avatarUrl,
    });

    return {
      success: true,
      data: updatedComment as CommentWithAuthor,
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

export async function deleteTaskComment(
  commentId: string,
): Promise<DeleteCommentResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (!["CUSTOMER", "PROCUSTOMER", "ADMIN"].includes(user.role)) {
      return redirect("/login");
    }

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
