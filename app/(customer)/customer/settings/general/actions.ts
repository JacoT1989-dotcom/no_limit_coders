"use server";

import prisma from "@/lib/prisma";
import { hash, verify } from "@node-rs/argon2";
import { validateRequest } from "@/auth";
import { UserRole } from "@prisma/client";
import {
  updatePersonalInfoSchema,
  updateAddressSchema,
  updateImagesSchema,
  updatePasswordSchema,
  type UpdatePersonalInfoValues,
  type UpdateAddressValues,
  type UpdateImagesValues,
  type UpdatePasswordValues,
} from "./validations";
import { uploadFile } from "../../_components/(quick-actions)/(message_tech_team)/upload";

// Helper function to verify user is authenticated and has CUSTOMER role
async function validateCustomerAccess(): Promise<{
  isAuthorized: boolean;
  userId: string | undefined;
  error: string | undefined;
}> {
  const { user } = await validateRequest();

  if (!user) {
    return {
      isAuthorized: false,
      error: "Not authenticated",
      userId: undefined,
    };
  }

  if (user.role !== UserRole.CUSTOMER && user.role !== UserRole.PROCUSTOMER) {
    return {
      isAuthorized: false,
      error: "Access denied. Customers only.",
      userId: undefined,
    };
  }

  return { isAuthorized: true, userId: user.id, error: undefined };
}

// Update personal information
export async function updatePersonalInfo(
  formData: UpdatePersonalInfoValues,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { isAuthorized, userId, error } = await validateCustomerAccess();
    if (!isAuthorized || !userId) {
      return { error: error || "Authorization failed" };
    }

    const validatedData = updatePersonalInfoSchema.parse(formData);

    // Check if email is being changed and if it's already taken
    if (validatedData.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          AND: [
            {
              email: {
                equals: validatedData.email,
                mode: "insensitive",
              },
            },
            {
              id: {
                not: userId,
              },
            },
          ],
        },
      });

      if (existingEmail) {
        return {
          error: "Email already taken",
        };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        displayName: validatedData.displayName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating personal info:", error);
    return {
      error: "Failed to update personal information. Please try again.",
    };
  }
}

// Update address information
export async function updateAddress(
  formData: UpdateAddressValues,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { isAuthorized, userId, error } = await validateCustomerAccess();
    if (!isAuthorized || !userId) {
      return { error: error || "Authorization failed" };
    }

    const validatedData = updateAddressSchema.parse(formData);

    await prisma.user.update({
      where: { id: userId },
      data: {
        streetAddress: validatedData.streetAddress,
        suburb: validatedData.suburb || null,
        townCity: validatedData.townCity,
        postcode: validatedData.postcode,
        country: validatedData.country,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating address:", error);
    return {
      error: "Failed to update address information. Please try again.",
    };
  }
}

// Update avatar and background images
export async function updateImages(formData: FormData): Promise<{
  success?: boolean;
  error?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
}> {
  try {
    const { isAuthorized, userId, error } = await validateCustomerAccess();
    if (!isAuthorized || !userId) {
      return { error: error || "Authorization failed" };
    }

    // Extract files from FormData
    const avatarFile = formData.get("avatarImage") as File | null;
    const backgroundFile = formData.get("backgroundImage") as File | null;

    // Validate using Zod schema
    const validatedData = updateImagesSchema.parse({
      avatarImage: avatarFile || undefined,
      backgroundImage: backgroundFile || undefined,
    });

    const updates: {
      avatarUrl?: string;
      backgroundUrl?: string;
    } = {};

    // Upload avatar image if provided
    if (validatedData.avatarImage && validatedData.avatarImage.size > 0) {
      try {
        const result = await uploadFile(
          validatedData.avatarImage,
          `users/${userId}/avatar`,
        );
        updates.avatarUrl = result.url;
      } catch (error) {
        console.error("Error uploading avatar image:", error);
        return { error: "Failed to upload avatar image. Please try again." };
      }
    }

    // Upload background image if provided
    if (
      validatedData.backgroundImage &&
      validatedData.backgroundImage.size > 0
    ) {
      try {
        const result = await uploadFile(
          validatedData.backgroundImage,
          `users/${userId}/background`,
        );
        updates.backgroundUrl = result.url;
      } catch (error) {
        console.error("Error uploading background image:", error);
        return {
          error: "Failed to upload background image. Please try again.",
        };
      }
    }

    // Only update if we have changes
    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updates,
      });
    }

    return {
      success: true,
      avatarUrl: updates.avatarUrl,
      backgroundUrl: updates.backgroundUrl,
    };
  } catch (error) {
    console.error("Error updating profile images:", error);
    return {
      error: "Failed to update profile images. Please try again.",
    };
  }
}

// Update password
export async function updatePassword(
  formData: UpdatePasswordValues,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { isAuthorized, userId, error } = await validateCustomerAccess();
    if (!isAuthorized || !userId) {
      return { error: error || "Authorization failed" };
    }

    const validatedData = updatePasswordSchema.parse(formData);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Verify current password
    const validPassword = await verify(
      user.passwordHash,
      validatedData.currentPassword,
    );

    if (!validPassword) {
      return { error: "Current password is incorrect" };
    }

    // Hash new password
    const newPasswordHash = await hash(validatedData.newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      error: "Failed to update password. Please try again.",
    };
  }
}

// Helper function to handle partial updates
export async function updatePartialUserInfo(
  data: Partial<UpdatePersonalInfoValues & UpdateAddressValues>,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { isAuthorized, userId, error } = await validateCustomerAccess();
    if (!isAuthorized || !userId) {
      return { error: error || "Authorization failed" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.displayName !== undefined && {
          displayName: data.displayName,
        }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phoneNumber !== undefined && {
          phoneNumber: data.phoneNumber,
        }),
        ...(data.streetAddress !== undefined && {
          streetAddress: data.streetAddress,
        }),
        ...(data.suburb !== undefined && { suburb: data.suburb || null }),
        ...(data.townCity !== undefined && { townCity: data.townCity }),
        ...(data.postcode !== undefined && { postcode: data.postcode }),
        ...(data.country !== undefined && { country: data.country }),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user info:", error);
    return {
      error: "Failed to update information. Please try again.",
    };
  }
}

// Get the current user's profile data
export async function getCurrentUserData() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return null;
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        displayName: true,
        email: true,
        phoneNumber: true,
        streetAddress: true,
        suburb: true,
        townCity: true,
        postcode: true,
        country: true,
        avatarUrl: true,
        backgroundUrl: true,
      },
    });

    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}
