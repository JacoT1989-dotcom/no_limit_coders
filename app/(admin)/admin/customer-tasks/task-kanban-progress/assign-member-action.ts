"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";

type AssignMemberResponse = {
  success: boolean;
  error?: string;
};

export async function assignTeamMemberToTask(
  taskId: string,
  userId: string,
): Promise<AssignMemberResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get task and its project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        assignees: true,
      },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    // Verify the developer exists
    const developer = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!developer) {
      return { success: false, error: "Developer not found" };
    }

    // Check if already assigned
    const isAlreadyAssigned = task.assignees.some(
      (assignee) => assignee.userId === userId,
    );

    if (isAlreadyAssigned) {
      return {
        success: false,
        error: "Member is already assigned to this task",
      };
    }

    // First, find or create ProjectTeamMember
    let teamMember = await prisma.projectTeamMember.findFirst({
      where: {
        userId: userId,
        projectId: task.projectId,
      },
    });

    if (!teamMember) {
      teamMember = await prisma.projectTeamMember.create({
        data: {
          project: {
            connect: { id: task.projectId },
          },
          user: {
            connect: { id: userId },
          },
          role: "MEMBER",
        },
      });
    }

    // Now assign to task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        assignees: {
          connect: {
            id: teamMember.id,
          },
        },
      },
    });

    revalidatePath("/admin/customer-tasks/task-kanban-progress");
    return { success: true };
  } catch (error) {
    console.error("Error assigning member to task:", error);
    return {
      success: false,
      error: "Failed to assign member to task",
    };
  }
}
