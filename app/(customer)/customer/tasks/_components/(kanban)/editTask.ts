"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  Priority as PrismaPriority,
  TaskStatus,
  ColumnState,
} from "@prisma/client";
import { UpdateTaskResponse } from "../../types";

// Schema for validating task edit data
const EditTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  priority: z.nativeEnum(PrismaPriority),
  status: z.nativeEnum(TaskStatus),
  // Accept string from client and parse to Date if needed
  dueDate: z.string().nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
  projectId: z.string(),
});

type EditTaskInput = z.infer<typeof EditTaskSchema>;

// Map TaskStatus to ColumnState
const statusToColumnMap: Record<TaskStatus, ColumnState> = {
  TODO: ColumnState.TODO,
  REVIEW: ColumnState.BACKLOG,
  IN_PROGRESS: ColumnState.IN_PROGRESS,
  COMPLETED: ColumnState.DONE,
};

/**
 * Server action to edit a task
 * Validates user permissions and updates task details
 */
export async function editTask(
  data: EditTaskInput,
): Promise<UpdateTaskResponse> {
  try {
    // Validate request schema
    const validatedData = EditTaskSchema.parse(data);

    // Parse dueDate from string to Date if it exists
    const parsedDueDate = validatedData.dueDate
      ? new Date(validatedData.dueDate)
      : null;

    // Check authentication
    const { user } = await validateRequest();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized: You must be logged in",
      };
    }

    // Fetch task to verify ownership and existence
    const task = await prisma.task.findUnique({
      where: { id: validatedData.id },
      include: {
        project: {
          select: {
            customerId: true,
            team: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // Verify task exists
    if (!task) {
      return {
        success: false,
        error: "Task not found",
      };
    }

    // Verify user has permission to edit this task
    const isCustomer = task.project.customerId === user.id;
    const isTeamMember = task.project.team.some(
      (member) => member.userId === user.id,
    );

    if (!isCustomer && !isTeamMember) {
      return {
        success: false,
        error: "Unauthorized: You don't have permission to edit this task",
      };
    }

    // Find the appropriate column for the task based on status
    const column = await prisma.taskColumn.findFirst({
      where: {
        projectId: validatedData.projectId,
        name: statusToColumnMap[validatedData.status],
      },
    });

    if (!column) {
      return {
        success: false,
        error: "Invalid task status or column not found",
      };
    }

    // Perform task update without a transaction to avoid timeout
    // 1. First update the task basic details
    await prisma.task.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        status: validatedData.status,
        dueDate: parsedDueDate,
        columnId: column.id,
      },
    });

    // 2. Then update assignees if provided
    if (validatedData.assigneeIds && validatedData.assigneeIds.length > 0) {
      // First disconnect all current assignees
      await prisma.task.update({
        where: { id: validatedData.id },
        data: {
          assignees: {
            set: [], // Disconnect all existing assignees
          },
        },
      });

      // Prepare the connect statements for all assignees
      const assigneeConnects = [];
      for (const assigneeId of validatedData.assigneeIds) {
        // Find team member record
        const teamMember = await prisma.projectTeamMember.findFirst({
          where: {
            projectId: validatedData.projectId,
            userId: assigneeId,
          },
        });

        if (teamMember) {
          assigneeConnects.push({ id: teamMember.id });
        }
      }

      // Connect all assignees in a single operation if there are any
      if (assigneeConnects.length > 0) {
        await prisma.task.update({
          where: { id: validatedData.id },
          data: {
            assignees: {
              connect: assigneeConnects,
            },
          },
        });
      }
    }

    // 3. Fetch the complete updated task with all relations
    const updatedTask = await prisma.task.findUnique({
      where: { id: validatedData.id },
      include: {
        column: true,
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        attachments: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    // Revalidate the tasks page to reflect changes
    revalidatePath(`/customer/tasks`);

    return {
      success: true,
      data: updatedTask!,
    };
  } catch (error) {
    console.error("Error editing task:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors.map((e) => `${e.path}: ${e.message}`).join(", ")}`,
      };
    }

    return {
      success: false,
      error: "Failed to update task",
    };
  }
}
