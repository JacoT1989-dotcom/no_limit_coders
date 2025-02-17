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
  memberId: string,
): Promise<AssignMemberResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the developer exists and has the correct role
    const developer = await prisma.user.findUnique({
      where: {
        id: memberId,
      },
      select: {
        id: true,
        role: true,
        displayName: true,
      },
    });

    if (!developer) {
      return { success: false, error: "Developer not found" };
    }

    if (developer.role !== "DEVELOPER") {
      return {
        success: false,
        error: `User is not a developer. Current role: ${developer.role}`,
      };
    }

    return await prisma.$transaction(async (tx) => {
      // Find the task and its current assignments
      const task = await tx.task.findUnique({
        where: { id: taskId },
        include: {
          project: true,
          assignees: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!task) {
        return { success: false, error: "Task not found" };
      }

      // Check for existing team membership
      let teamMember = await tx.projectTeamMember.findFirst({
        where: {
          userId: memberId,
          projectId: task.projectId,
        },
      });

      // Create team membership if it doesn't exist
      if (!teamMember) {
        teamMember = await tx.projectTeamMember.create({
          data: {
            project: {
              connect: { id: task.projectId },
            },
            user: {
              connect: { id: memberId },
            },
            role: "MEMBER",
          },
        });
      }

      // Assign to task
      await tx.task.update({
        where: { id: taskId },
        data: {
          assignees: {
            connect: {
              id: teamMember.id,
            },
          },
        },
      });

      return { success: true };
    });
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to assign developer to task",
    };
  } finally {
    revalidatePath("/admin/customer-tasks/task-kanban-progress");
  }
}
