// lib/upload.ts
import { put } from "@vercel/blob";

export interface UploadResult {
  url: string;
  name: string;
}

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadFile(file: File, pathPrefix: string = 'uploads'): Promise<UploadResult> {
  try {
    if (!file || !file.size) {
      throw new Error("No file provided");
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}`);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size must be less than 10MB");
    }

    const timestamp = Date.now();
    const path = `${pathPrefix}/${timestamp}_${file.name}`;

    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });

    if (!blob.url) {
      throw new Error("Failed to upload file");
    }

    return {
      url: blob.url,
      name: file.name,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}