"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { ProjectOption } from "@/app/(customer)/customer/tasks/types";

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

    // First get all developers
    const developers = await prisma.user.findMany({
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

    // Query projects based on user role
    const projects = await prisma.project.findMany({
      where: {
        // If user is admin/superadmin/developer, get all projects
        // Otherwise, only get their own projects
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
                    role: true,
                  },
                },
              },
            },
            attachments: true,
            comments: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add available developers to each project
    const projectsWithDevelopers = projects.map((project) => {
      // Get IDs of developers already in the team
      const teamDeveloperIds = new Set(
        project.team
          .filter((member) => member.user.role === "DEVELOPER")
          .map((member) => member.user.id),
      );

      // Filter out developers already in the team
      const availableDevelopers = developers.filter(
        (dev) => !teamDeveloperIds.has(dev.id),
      );

      return {
        ...project,
        availableDevelopers,
      };
    });

    return { projects: projectsWithDevelopers as ProjectOption[] };
  } catch (error) {
    console.error("Project fetch error:", error);
    return { error: "Failed to fetch projects" };
  }
}
