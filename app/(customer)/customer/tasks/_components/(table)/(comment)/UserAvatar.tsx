"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface UserAvatarProps {
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  fallbackClassName?: string;
  initials?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  size = 40,
  className = "",
  fallbackClassName = "bg-gradient-to-r from-blue-500 to-indigo-600",
  initials = "UN",
}) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Log component initialization
  useEffect(() => {
    console.log("[UserAvatar] Component initialized with:", {
      avatarUrl,
      size,
      initials,
      hasAvatarUrl: !!avatarUrl,
    });
  }, [avatarUrl, size, initials]);

  // Reset error state when avatarUrl changes
  useEffect(() => {
    console.log("[UserAvatar] avatarUrl changed:", {
      avatarUrl,
      type: typeof avatarUrl,
      length: avatarUrl?.length,
    });

    // Reset error state when avatarUrl changes
    setImgError(false);

    // Only set loading to true if we have a valid URL string
    if (typeof avatarUrl === "string" && avatarUrl.trim() !== "") {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [avatarUrl]);

  const handleImageError = (): void => {
    console.error("[UserAvatar] Image failed to load:", avatarUrl);
    setImgError(true);
    setLoading(false);
  };

  const handleImageLoad = (): void => {
    console.log("[UserAvatar] Image loaded successfully:", avatarUrl);
    setLoading(false);
  };

  // Show fallback if:
  // 1. No avatarUrl provided
  // 2. avatarUrl is null
  // 3. avatarUrl is an empty string
  // 4. There was an error loading the image
  if (!avatarUrl || imgError) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-full text-white ${fallbackClassName} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${Math.max(size / 2.5, 12)}px`,
        }}
        title={initials}
      >
        {initials}
      </div>
    );
  }

  // Attempt to display the image avatar
  return (
    <div
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {loading && (
        // Loading indicator shown while image loads
        <div
          className={`absolute inset-0 flex items-center justify-center ${fallbackClassName}`}
          style={{ fontSize: `${Math.max(size / 2.5, 12)}px` }}
        >
          {initials}
        </div>
      )}

      <Image
        src={avatarUrl}
        alt={initials || "User avatar"}
        width={size}
        height={size}
        className="object-cover w-full h-full transition-opacity duration-200"
        style={{ opacity: loading ? 0 : 1 }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        unoptimized={true}
      />
    </div>
  );
};

export default UserAvatar;
