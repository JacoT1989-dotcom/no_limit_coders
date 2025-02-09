"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { Priority, ColumnState, TaskStatus } from "@prisma/client";
import { type TaskFormValues } from "../types";

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function createTask(formData: FormData) {
  try {
    // Validate user authentication and authorization
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (!["CUSTOMER", "PROCUSTOMER", "ADMIN"].includes(user.role)) {
      return redirect("/login");
    }

    // Get form data
    const name = formData.get("name") as string;
    const projectId = formData.get("projectId") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as Priority;
    const dueDate = formData.get("dueDate") as string;
    const files = formData.getAll("attachments") as File[];

    // Validate inputs
    if (!name) throw new Error("Task name is required");
    if (!projectId) throw new Error("Project ID is required");
    if (!description) throw new Error("Description is required");
    if (!priority) throw new Error("Priority is required");

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        customerId: user.id,
      },
      include: {
        taskColumns: {
          where: {
            name: ColumnState.BACKLOG,
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found or access denied");
    }

    // Get or create the Backlog column
    let backlogColumn = project.taskColumns[0];

    if (!backlogColumn) {
      // Get the count of existing columns to determine the order
      const columnCount = await prisma.taskColumn.count({
        where: { projectId },
      });

      backlogColumn = await prisma.taskColumn.create({
        data: {
          name: ColumnState.BACKLOG,
          order: columnCount,
          projectId,
        },
      });
    }

    // Get the highest order in the backlog column
    const lastTask = await prisma.task.findFirst({
      where: { columnId: backlogColumn.id },
      orderBy: { order: "desc" },
    });

    const newTaskOrder = (lastTask?.order ?? -1) + 1;

    // Upload attachments if any
    const uploadedAttachments = await Promise.all(
      files.map(async (file) => {
        if (!file || !file.size) return null;

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}`);
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          throw new Error("File size must be less than 10MB");
        }

        const timestamp = Date.now();
        const path = `tasks/${projectId}/attachments/${timestamp}_${file.name}`;

        try {
          const blob = await put(path, file, {
            access: "public",
            addRandomSuffix: false,
          });

          if (!blob.url) throw new Error("Failed to upload file");

          return {
            name: file.name,
            url: blob.url,
            uploaderId: user.id,
          };
        } catch (error) {
          console.error(`Failed to upload file ${file.name}:`, error);
          return null;
        }
      }),
    );

    // Filter out null values from failed uploads
    const attachments = uploadedAttachments.filter(
      (attachment): attachment is NonNullable<typeof attachment> =>
        attachment !== null,
    );

    // Create task with attachments in a transaction
    const task = await prisma.$transaction(async (tx) => {
      // Create the task
      const newTask = await tx.task.create({
        data: {
          title: name,
          description,
          priority,
          status: TaskStatus.TODO, // Default status is TODO
          dueDate: dueDate ? new Date(dueDate) : null,
          projectId,
          columnId: backlogColumn.id,
          order: newTaskOrder,
          attachments: {
            create: attachments,
          },
        },
        include: {
          attachments: true,
          column: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      return newTask;
    });

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating the task",
    };
  }
}

export type CreateTaskResponse = {
  success: boolean;
  data?: any;
  error?: string;
};
