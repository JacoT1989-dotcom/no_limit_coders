"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { Prisma } from "@prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect";
import { z } from "zod";
import { ScheduleMeetingFormValues, ScheduleMeetingResponse } from "./types";
import { scheduleMeetingSchema } from "./validations";

export async function scheduleMeeting(
  formData: ScheduleMeetingFormValues,
): Promise<ScheduleMeetingResponse | never> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    const validatedData = scheduleMeetingSchema.parse(formData);

    // Convert date and time to a DateTime object
    const meetingDateTime = new Date(
      `${validatedData.date}T${validatedData.time}`,
    );

    const meeting = await prisma.scheduleMeeting.create({
      data: {
        subject: validatedData.subject,
        date: meetingDateTime,
        time: validatedData.time,
        participants: validatedData.participants,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return {
      success: true,
      meetingId: meeting.id,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Meeting scheduling error:", error);

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

export async function getUserScheduledMeetings(userId?: string) {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    const targetUserId = userId || user.id;

    const meetings = await prisma.scheduleMeeting.findMany({
      where: {
        userId: targetUserId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return { meetings };
  } catch (error) {
    console.error("Error fetching scheduled meetings:", error);
    return { error: "Failed to load scheduled meetings" };
  }
}

export async function deleteMeeting(meetingId: string) {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    const meeting = await prisma.scheduleMeeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return { error: "Meeting not found" };
    }

    if (
      meeting.userId !== user.id &&
      user.role !== "ADMIN" &&
      user.role !== "SUPERADMIN"
    ) {
      return { error: "You don't have permission to delete this meeting" };
    }

    await prisma.scheduleMeeting.delete({
      where: { id: meetingId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return { error: "Failed to delete meeting" };
  }
}
