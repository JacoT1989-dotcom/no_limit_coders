"use server";

import prisma from "@/lib/prisma";
import { isRedirectError } from "next/dist/client/components/redirect";
import { Prisma } from "@prisma/client";

export async function getBookingMessages(): Promise<
  | {
      data: {
        id: string;
        fullName: string;
        email: string;
        mobile: string;
        country: string;
        package: string;
        message: string;
        createdAt: Date;
      }[];
      error?: string;
    }
  | never
> {
  try {
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        country: true,
        package: true,
        message: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: bookings,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Error fetching booking messages:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        data: [],
        error: "Database error occurred while fetching booking messages.",
      };
    }

    return {
      data: [],
      error: "Something went wrong while fetching booking messages.",
    };
  }
}
