"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import avatarPlaceholder from "../assets/avatar-placeholder.png";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
  fallbackClassName?: string;
  initials?: string;
}

export default function UserAvatar({
  avatarUrl,
  size = 48,
  className,
  fallbackClassName,
  initials,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Normalize the URL for Next.js Image component
  const normalizeUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;

    // If it's already an absolute URL (starts with http or https)
    if (url.startsWith("http")) return url;

    // Make sure relative URLs start with a slash
    return url.startsWith("/") ? url : `/${url}`;
  };

  // Reset error state when avatarUrl changes
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  // Handle image load error
  const handleError = () => {
    console.log("Image load error for:", avatarUrl);
    setImgError(true);
  };

  // Ensure we have a valid URL and no previous errors
  const validImageUrl = normalizeUrl(avatarUrl);

  // If we have a valid image URL and no error, display the image
  if (validImageUrl && !imgError) {
    return (
      <div
        className={cn("overflow-hidden rounded-full relative", className)}
        style={{ width: size, height: size }}
      >
        <Image
          src={validImageUrl}
          alt="User avatar"
          width={size}
          height={size}
          className="aspect-square object-cover h-full w-full"
          onError={handleError}
          priority
          unoptimized // This prevents Next.js optimization that might break some URLs
        />
      </div>
    );
  }

  // Otherwise, display the placeholder or initials
  return (
    <div
      className={cn(
        "overflow-hidden rounded-full relative flex items-center justify-center",
        fallbackClassName,
      )}
      style={{ width: size, height: size }}
    >
      {initials ? (
        <div className="flex items-center justify-center h-full w-full text-white text-xs font-medium">
          {initials}
        </div>
      ) : (
        <Image
          src={avatarPlaceholder}
          alt="User avatar"
          width={size}
          height={size}
          className="aspect-square object-cover"
          priority
        />
      )}
    </div>
  );
}
