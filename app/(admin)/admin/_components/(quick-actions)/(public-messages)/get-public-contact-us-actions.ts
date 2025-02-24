"use server";

import prisma from "@/lib/prisma";
import { isRedirectError } from "next/dist/client/components/redirect";
import { Prisma } from "@prisma/client";

export async function getMessages(): Promise<
  | {
      data: {
        id: string;
        fullName: string;
        email: string;
        mobile: string;
        country: string;
        message: string;
        createdAt: Date;
        updatedAt: Date;
      }[];
      error?: string;
    }
  | never
> {
  try {
    const messages = await prisma.message.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        country: true,
        message: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: messages,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Error fetching messages:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        data: [],
        error: "Database error occurred while fetching messages.",
      };
    }

    return {
      data: [],
      error: "Something went wrong while fetching messages.",
    };
  }
}
