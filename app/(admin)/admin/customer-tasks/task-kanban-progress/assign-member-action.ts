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

    // First, get the task and its project
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

    // First create or get the project team member
    let teamMember = await prisma.projectTeamMember.findFirst({
      where: {
        userId: userId,
        projectId: task.project.id,
      },
    });

    if (!teamMember) {
      // Create new team member if doesn't exist
      teamMember = await prisma.projectTeamMember.create({
        data: {
          userId: userId,
          projectId: task.project.id,
          role: "MEMBER",
        },
      });
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

    // Now assign the team member to the task using their ProjectTeamMember ID
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
