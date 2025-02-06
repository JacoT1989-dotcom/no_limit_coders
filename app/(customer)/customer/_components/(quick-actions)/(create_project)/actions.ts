"use server";

import prisma from "@/lib/prisma";
import { isRedirectError } from "next/dist/client/components/redirect";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ProjectFormValues } from "./types";
import { projectSchema } from "./validations";

export async function createProject(
  formData: ProjectFormValues,
): Promise<{ error?: string; success?: boolean } | never> {
  try {
    const validatedData = projectSchema.parse(formData);

    await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        status: "UNDER_REVIEW",
        priority: validatedData.priority,
        preferredMeeting: new Date(validatedData.preferredMeeting),
        customer: {
          connect: {
            id: validatedData.customerId,
          },
        },
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Project creation error:", error);

    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error: "Database error occurred. Please try again.",
      };
    }

    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
