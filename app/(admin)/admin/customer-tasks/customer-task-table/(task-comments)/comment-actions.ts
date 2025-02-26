"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { TaskComment } from "@prisma/client";

// Add author information to the response type
type CommentWithAuthor = TaskComment & {
  author: {
    id: string;
    displayName: string;
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

export async function createTaskComment(
  taskId: string,
  content: string,
): Promise<CreateCommentResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (
      !["CUSTOMER", "PROCUSTOMER", "ADMIN", "SUPERADMIN", "DEVELOPER"].includes(
        user.role,
      )
    ) {
      return redirect("/");
    }

    if (!taskId) throw new Error("Task ID is required");
    if (!content.trim()) throw new Error("Comment content is required");

    // Different query based on user role
    let task;
    if (["ADMIN", "SUPERADMIN", "DEVELOPER"].includes(user.role)) {
      // Admins can comment on any task
      task = await prisma.task.findUnique({
        where: {
          id: taskId,
        },
      });
    } else {
      // Regular customers can only comment on their own tasks
      task = await prisma.task.findFirst({
        where: {
          id: taskId,
          project: {
            customerId: user.id,
          },
        },
      });
    }

    if (!task) {
      throw new Error("Task not found or access denied");
    }

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
      data: comment as CommentWithAuthor,
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
    if (
      !["CUSTOMER", "PROCUSTOMER", "ADMIN", "SUPERADMIN", "DEVELOPER"].includes(
        user.role,
      )
    ) {
      return redirect("/login");
    }

    if (!content.trim()) throw new Error("Comment content is required");

    // For admin roles, allow updating any comment
    let comment;
    if (["ADMIN", "SUPERADMIN", "DEVELOPER"].includes(user.role)) {
      comment = await prisma.taskComment.findUnique({
        where: {
          id: commentId,
        },
      });
    } else {
      // For non-admin roles, only allow updating comments on their own projects
      comment = await prisma.taskComment.findFirst({
        where: {
          id: commentId,
          task: {
            project: {
              customerId: user.id,
            },
          },
        },
      });
    }

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
          },
        },
      },
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
    if (
      !["CUSTOMER", "PROCUSTOMER", "ADMIN", "SUPERADMIN", "DEVELOPER"].includes(
        user.role,
      )
    ) {
      return redirect("/login");
    }

    // For admin roles, allow deleting any comment
    let comment;
    if (["ADMIN", "SUPERADMIN", "DEVELOPER"].includes(user.role)) {
      comment = await prisma.taskComment.findUnique({
        where: {
          id: commentId,
        },
      });
    } else {
      // For non-admin roles, only allow deleting comments on their own projects
      comment = await prisma.taskComment.findFirst({
        where: {
          id: commentId,
          task: {
            project: {
              customerId: user.id,
            },
          },
        },
      });
    }

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
