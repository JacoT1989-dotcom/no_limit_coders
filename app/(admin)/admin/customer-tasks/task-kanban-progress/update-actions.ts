"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { ColumnState, TaskStatus } from "@prisma/client";
import { Task } from "@/app/(customer)/customer/tasks/types";
import { revalidatePath } from "next/cache";

// Map status updates: column state to task status
const getTaskStatusFromColumn = (columnState: ColumnState): TaskStatus => {
  switch (columnState) {
    case ColumnState.TODO:
      return TaskStatus.TODO;
    case ColumnState.BACKLOG: // When task moves to BACKLOG column
      return TaskStatus.REVIEW; // Set task status to REVIEW
    case ColumnState.IN_PROGRESS:
      return TaskStatus.IN_PROGRESS;
    case ColumnState.DONE: // When task moves to DONE column
      return TaskStatus.COMPLETED; // Set task status to COMPLETED
  }
};

// Get column state from task status (reverse mapping)
const getColumnFromTaskStatus = (status: TaskStatus): ColumnState => {
  switch (status) {
    case TaskStatus.TODO:
      return ColumnState.TODO;
    case TaskStatus.REVIEW: // Tasks with REVIEW status
      return ColumnState.BACKLOG; // Go to BACKLOG column
    case TaskStatus.IN_PROGRESS:
      return ColumnState.IN_PROGRESS;
    case TaskStatus.COMPLETED: // Tasks with COMPLETED status
      return ColumnState.DONE; // Go to DONE column
  }
};

type UpdateTaskColumnResponse = {
  success: boolean;
  task?: Task;
  error?: string;
};

export async function updateTaskColumn(
  taskId: string,
  newColumnState: ColumnState,
): Promise<UpdateTaskColumnResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized");
    if (!["ADMIN", "SUPERADMIN", "DEVELOPER"].includes(user.role)) {
      return { success: false, error: "Unauthorized" };
    }

    // Get current task with its column and project
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: true,
        project: true,
      },
    });

    if (!currentTask) {
      return { success: false, error: "Task not found" };
    }

    console.log("Current task:", {
      taskId,
      projectId: currentTask.projectId,
      newColumnState,
    });

    // Find or create the target column if it doesn't exist
    let targetColumn = await prisma.taskColumn.findFirst({
      where: {
        projectId: currentTask.projectId,
        name: newColumnState,
      },
    });

    if (!targetColumn) {
      // Get the max order from existing columns
      const maxOrderColumn = await prisma.taskColumn.findFirst({
        where: { projectId: currentTask.projectId },
        orderBy: { order: "desc" },
      });

      const newOrder = maxOrderColumn ? maxOrderColumn.order + 1 : 0;

      // Create the column if it doesn't exist
      targetColumn = await prisma.taskColumn.create({
        data: {
          projectId: currentTask.projectId,
          name: newColumnState,
          order: newOrder,
        },
      });
    }

    // Calculate the new order in target column
    const lastTaskInColumn = await prisma.task.findFirst({
      where: { columnId: targetColumn.id },
      orderBy: { order: "desc" },
    });

    const newOrder = lastTaskInColumn ? lastTaskInColumn.order + 1 : 0;

    // Update task with new column and corresponding status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: targetColumn.id,
        status: getTaskStatusFromColumn(newColumnState),
        order: newOrder,
        updatedAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        column: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            order: true,
            projectId: true,
          },
        },
        assignees: {
          select: {
            id: true,
            role: true,
            userId: true,
            projectId: true,
          },
        },
        attachments: {
          select: {
            id: true,
            name: true,
            url: true,
            createdAt: true,
            taskId: true,
            uploaderId: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            taskId: true,
            authorId: true,
          },
        },
      },
    });

    // Reorder tasks in the previous column
    await prisma.task.updateMany({
      where: {
        columnId: currentTask.column.id,
        order: { gt: currentTask.order },
      },
      data: {
        order: { decrement: 1 },
      },
    });

    // Revalidate the customer tasks path
    revalidatePath("/customer/tasks");

    return {
      success: true,
      task: updatedTask as Task,
    };
  } catch (error) {
    console.error("Task update error:", error);
    return {
      success: false,
      error: "Failed to update task",
    };
  }
}

// Export helper functions for use in components
export { getTaskStatusFromColumn, getColumnFromTaskStatus };
