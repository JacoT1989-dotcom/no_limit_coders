"use server";

import prisma from "@/lib/prisma";
import { isRedirectError } from "next/dist/client/components/redirect";
import { Prisma } from "@prisma/client";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { ProjectData, ProjectResponse, ProjectsResponse } from "./types";

export async function getProjectData(
  projectId: string,
): Promise<ProjectResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "CUSTOMER") {
      return redirect("/login");
    }

    const projectData = await prisma.project.findFirst({
      where: {
        id: projectId,
        customerId: user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        priority: true,
        preferredMeeting: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            displayName: true,
            email: true,
            phoneNumber: true,
            package: true,
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
            order: true,
            assignees: {
              select: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
                role: true,
              },
            },
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                author: {
                  select: {
                    id: true,
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            attachments: {
              select: {
                id: true,
                name: true,
                url: true,
                createdAt: true,
                uploader: {
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
        taskColumns: {
          select: {
            id: true,
            name: true,
            order: true,
            tasks: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
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
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!projectData) {
      return {
        error: "Project not found",
      };
    }

    return {
      project: projectData as unknown as ProjectData,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Project data fetch error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error: "Database error occurred while fetching project data",
      };
    }

    return {
      error: "Failed to fetch project data. Please try again.",
    };
  }
}
