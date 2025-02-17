"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { ProjectOption, User } from "@/app/(customer)/customer/tasks/types";

type GetCustomerProjectsResponse = {
  projects?: ProjectOption[];
  error?: string;
};

export async function getCustomerProjects(): Promise<GetCustomerProjectsResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized");
    if (!["CUSTOMER", "ADMIN", "SUPERADMIN", "DEVELOPER"].includes(user.role))
      return redirect("/login");

    // Get all developers
    const developersQuery = await prisma.user.findMany({
      where: {
        role: "DEVELOPER",
      },
      select: {
        id: true,
        displayName: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    // Map developers to our User type
    const developers: User[] = developersQuery.map((dev) => ({
      id: dev.id,
      displayName: dev.displayName,
      firstName: dev.firstName,
      lastName: dev.lastName,
      email: dev.email,
      role: dev.role,
    }));

    // Query projects
    const projects = await prisma.project.findMany({
      where: {
        ...(!["ADMIN", "SUPERADMIN", "DEVELOPER"].includes(user.role)
          ? { customerId: user.id }
          : {}),
      },
      select: {
        id: true,
        name: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            displayName: true,
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
            attachments: true,
            comments: true,
          },
        },
      },
    });

    // Process projects to add available developers
    const projectsWithDevelopers: ProjectOption[] = projects.map((project) => {
      return {
        id: project.id,
        name: project.name,
        customerId: project.customerId,
        customer: project.customer,
        team: project.team,
        tasks: project.tasks.map((task) => ({
          ...task,
          assignees: task.assignees,
          attachments: task.attachments,
          comments: task.comments,
        })),
        availableDevelopers: developers,
        assignedDevelopersByTask: project.tasks.reduce(
          (acc, task) => {
            acc[task.id] = new Set(
              task.assignees
                .filter((assignee) => assignee.user.role === "DEVELOPER")
                .map((assignee) => assignee.user.id),
            );
            return acc;
          },
          {} as { [taskId: string]: Set<string> },
        ),
      };
    });

    return { projects: projectsWithDevelopers };
  } catch (error) {
    return { error: "Failed to fetch projects" };
  }
}
