"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import {
  TaskStatus as PrismaTaskStatus,
  UserRole,
  Priority as PrismaPriority,
  Prisma,
} from "@prisma/client";
import { Task } from "@/app/(customer)/customer/tasks/types";

const taskInclude = {
  column: true,
  assignees: {
    include: {
      user: true,
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
} as const;

type TaskWithIncludes = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

type UpdateTaskResponse = {
  success: boolean;
  data?: Task;
  error?: string;
};

function transformPrismaTaskToTask(prismaTask: TaskWithIncludes): Task {
  return {
    id: prismaTask.id,
    title: prismaTask.title,
    description: prismaTask.description,
    priority: prismaTask.priority as PrismaPriority,
    status: prismaTask.status as PrismaTaskStatus,
    dueDate: prismaTask.dueDate,
    createdAt: prismaTask.createdAt,
    updatedAt: prismaTask.updatedAt,
    order: prismaTask.order,
    column: prismaTask.column,
    assignees: prismaTask.assignees,
    attachments: prismaTask.attachments,
    comments: prismaTask.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      taskId: comment.taskId,
      authorId: comment.authorId,
      author: comment.author,
    })),
  };
}

export async function getDeveloperProjects() {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized");
    if (user.role !== UserRole.DEVELOPER)
      return { error: "Unauthorized access" };

    const projects = await prisma.project.findMany({
      where: {
        team: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            displayName: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            status: true,
            dueDate: true,
            createdAt: true,
            updatedAt: true,
            order: true,
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
              orderBy: {
                createdAt: "desc",
              },
              select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                taskId: true,
                authorId: true,
                author: {
                  select: {
                    id: true,
                    displayName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        team: {
          select: {
            id: true,
            role: true,
            userId: true,
            projectId: true,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const projectsWithExtras = projects.map((project) => {
      const transformedTeam = project.team.map((member) => ({
        id: member.id,
        role: member.role,
        userId: member.userId,
        projectId: member.projectId,
        user: {
          id: member.user.id,
          displayName: member.user.displayName,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
          email: member.user.email,
          role: member.user.role,
        },
      }));

      return {
        id: project.id,
        name: project.name,
        customerId: project.customerId,
        customer: {
          id: project.customer.id,
          displayName: project.customer.displayName,
        },
        tasks: project.tasks,
        team: transformedTeam,
        availableDevelopers: transformedTeam
          .filter((member) => member.user.role === UserRole.DEVELOPER)
          .map((member) => member.user),
        assignedDevelopersByTask: project.tasks.reduce(
          (acc, task) => {
            acc[task.id] = new Set(
              task.assignees
                .filter((assignee) => assignee.user.role === UserRole.DEVELOPER)
                .map((assignee) => assignee.userId),
            );
            return acc;
          },
          {} as { [taskId: string]: Set<string> },
        ),
      };
    });

    return { projects: projectsWithExtras };
  } catch (error) {
    console.error("Developer projects fetch error:", error);
    return { error: "Failed to fetch projects" };
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: PrismaTaskStatus,
  columnId: string,
): Promise<UpdateTaskResponse> {
  try {
    const { user } = await validateRequest();
    if (!user || user.role !== UserRole.DEVELOPER) {
      return { success: false, error: "Unauthorized" };
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        columnId,
        updatedAt: new Date(),
      },
      include: taskInclude,
    });

    return { success: true, data: transformPrismaTaskToTask(updatedTask) };
  } catch (error) {
    console.error("Task update error:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function addTaskComment(
  taskId: string,
  content: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await validateRequest();
    if (!user || user.role !== UserRole.DEVELOPER) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.taskComment.create({
      data: {
        content,
        taskId,
        authorId: user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Comment creation error:", error);
    return { success: false, error: "Failed to add comment" };
  }
}
