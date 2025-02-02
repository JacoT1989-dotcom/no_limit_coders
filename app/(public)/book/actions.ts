"use server";

import prisma from "@/lib/prisma";
import { isRedirectError } from "next/dist/client/components/redirect";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { BookingFormValues } from "./types";
import { bookingSchema } from "./validations";

export async function submitBooking(
  formData: BookingFormValues,
): Promise<{ error?: string; success?: boolean } | never> {
  try {
    const validatedData = bookingSchema.parse(formData);

    await prisma.booking.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        mobile: validatedData.mobile,
        country: validatedData.country,
        package: validatedData.package,
        message: validatedData.message,
        userId: validatedData.userId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Booking submission error:", error);

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
