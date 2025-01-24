"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { verify } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { LoginFormValues } from "./validation";
import { UserRole } from "@prisma/client";

const roleRoutes: Record<UserRole, string> = {
  [UserRole.USER]: "/register-success",
  [UserRole.CUSTOMER]: "/customer",
  [UserRole.PROCUSTOMER]: "/pro",
  [UserRole.EDITOR]: "/editor",
  [UserRole.ADMIN]: "/admin",
  [UserRole.SUPERADMIN]: "/super-admin",
} as const;

export async function login(
  credentials: LoginFormValues,
): Promise<{ error?: string; redirectTo?: string } | void> {
  try {
    const { email, password } = credentials;

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Invalid email or password",
      };
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return {
        error: "Invalid email or password",
      };
    }

    if (!existingUser.agreeTerms) {
      return {
        error: "Please accept the terms and conditions to continue.",
      };
    }

    ////////////////////// THIS IS THE PART WHERE THE FUNCTION IS IN A POSITIVE STATE//////////

    // Create session in the database
    const dbSession = await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId: existingUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days, 24 HOURS, 60 SEC, 60 MIN, 1000 MIL SEC
      },
    });

    const sessionCookie = lucia.createSessionCookie(dbSession.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    const redirectPath = roleRoutes[existingUser.role];
    if (!redirectPath) {
      return {
        error: "Unable to determine user access. Please contact support.",
      };
    }

    return {
      redirectTo: redirectPath,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Login error:", error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
