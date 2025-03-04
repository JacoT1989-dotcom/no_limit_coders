import { z } from "zod";

// Personal Information Update Schema
export const updatePersonalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
});

// Address Update Schema
export const updateAddressSchema = z.object({
  streetAddress: z.string().min(1, "Street address is required"),
  suburb: z.string().optional().or(z.literal("")),
  townCity: z.string().min(1, "Town/City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  country: z.string().min(1, "Country is required"),
});

// Image Upload Schema
export const updateImagesSchema = z.object({
  avatarImage: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "Profile image must be less than 5MB",
    )
    .refine(
      (file) =>
        !file ||
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          file.type,
        ),
      "Profile image must be JPEG, PNG, or WebP format",
    ),
  backgroundImage: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024,
      "Background image must be less than 10MB",
    )
    .refine(
      (file) =>
        !file ||
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          file.type,
        ),
      "Background image must be JPEG, PNG, or WebP format",
    ),
});

// Password Update Schema
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

// Combined profile update schema
export const profileUpdateSchema = z.object({
  personal: updatePersonalInfoSchema,
  address: updateAddressSchema,
});

// Type exports
export type UpdatePersonalInfoValues = z.infer<typeof updatePersonalInfoSchema>;
export type UpdateAddressValues = z.infer<typeof updateAddressSchema>;
export type UpdateImagesValues = z.infer<typeof updateImagesSchema>;
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

// Partial schemas for when only some fields are being updated
export const partialPersonalInfoSchema = updatePersonalInfoSchema.partial();
export const partialAddressSchema = updateAddressSchema.partial();

// Partial types
export type PartialPersonalInfoValues = z.infer<
  typeof partialPersonalInfoSchema
>;
export type PartialAddressValues = z.infer<typeof partialAddressSchema>;
