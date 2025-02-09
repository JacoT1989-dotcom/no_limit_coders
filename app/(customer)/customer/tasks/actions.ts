"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { ProjectOption, Task } from "./types";

type GetCustomerProjectsResponse = {
  projects?: ProjectOption[];
  error?: string;
};

export async function getCustomerProjects(): Promise<GetCustomerProjectsResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized");
    if (user.role !== "CUSTOMER") return redirect("/login");

    const projects = await prisma.project.findMany({
      where: { customerId: user.id },
      select: {
        id: true,
        name: true,
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            status: true,
            dueDate: true,
            createdAt: true, // Added this
            updatedAt: true, // Added this
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
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { projects: projects as ProjectOption[] };
  } catch (error) {
    console.error("Project fetch error:", error);
    return { error: "Failed to fetch projects" };
  }
}

export type CreateTaskResponse = {
  success: boolean;
  data?: Task;
  error?: string;
};

export type UpdateTaskResponse = {
  success: boolean;
  data?: Task;
  error?: string;
};
