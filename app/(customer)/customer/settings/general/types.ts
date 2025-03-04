// Types for user profile updates
import { UserRole } from "@prisma/client";

// Base User Interface matching your Prisma schema
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  streetAddress: string;
  suburb?: string | null;
  townCity: string;
  postcode: string;
  country: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  agreeTerms: boolean;
  package: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// UserData for form population
export interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  suburb?: string | null;
  townCity: string;
  postcode: string;
  country: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
}

// Update DTOs for different sections
export interface UpdatePersonalInfoValues {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
}

export interface UpdateAddressValues {
  streetAddress: string;
  suburb?: string;
  townCity: string;
  postcode: string;
  country: string;
}

export interface UpdateImagesValues {
  avatarImage?: File;
  backgroundImage?: File;
}

export interface UpdatePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Combined values for partial updates
export type ProfileUpdateValues = UpdatePersonalInfoValues &
  UpdateAddressValues;

// Form props
export interface UpdateUserFormProps {
  user: UserData;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface UploadImageResult {
  url: string;
  fileName: string;
}

export interface UpdateStatus {
  success?: string;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
