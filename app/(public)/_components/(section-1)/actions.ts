// actions.ts
"use server";

import prisma from "@/lib/prisma";
import { isRedirectError } from "next/dist/client/components/redirect";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { MessageFormValues } from "./types";
import { messageSchema } from "./validations";

export async function submitMessage(
  formData: MessageFormValues,
): Promise<{ error?: string; success?: boolean } | never> {
  try {
    const validatedData = messageSchema.parse(formData);

    await prisma.message.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        mobile: validatedData.mobile,
        country: validatedData.country,
        message: validatedData.message,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Message submission error:", error);

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
