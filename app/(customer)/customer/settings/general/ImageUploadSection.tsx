"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { updateImages } from "./actions";
import Image from "next/image";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface ImageUploadSectionProps {
  userData: {
    displayName: string;
    avatarUrl?: string | null;
    backgroundUrl?: string | null;
  };
  onSuccess?: () => void;
}

export function ImageUploadSection({
  userData,
  onSuccess,
}: ImageUploadSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    userData.avatarUrl || null,
  );
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
    userData.backgroundUrl || null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP formats are supported");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Background image must be less than 10MB");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP formats are supported");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setBackgroundPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setBackgroundFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If no changes, do nothing
    if (!avatarFile && !backgroundFile) {
      toast.info("No images selected for upload");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (avatarFile) formData.append("avatarImage", avatarFile);
      if (backgroundFile) formData.append("backgroundImage", backgroundFile);

      const result = await updateImages(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Images updated successfully");
        // Reset the file inputs but keep the previews
        setAvatarFile(null);
        setBackgroundFile(null);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error("Failed to update images");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAvatarPreview = () => {
    setAvatarPreview(userData.avatarUrl || null);
    setAvatarFile(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const removeBackgroundPreview = () => {
    setBackgroundPreview(userData.backgroundUrl || null);
    setBackgroundFile(null);
    if (backgroundInputRef.current) backgroundInputRef.current.value = "";
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const name = userData.displayName || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="w-full overflow-hidden border border-border/40 bg-card/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-accent" />
          <CardTitle className="text-xl font-semibold">
            Profile Images
          </CardTitle>
        </div>
        <CardDescription>
          Upload your profile avatar and background images
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Profile Avatar</h3>
              <p className="text-xs text-muted-foreground">
                Max size: 5MB (JPEG, PNG, WebP)
              </p>
            </div>

            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 ring-2 ring-border ring-offset-2 ring-offset-background">
                <AvatarImage src={avatarPreview || ""} />
                <AvatarFallback className="bg-muted text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="flex gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {avatarFile ? "Change" : "Select"} Avatar
                  </Button>

                  {avatarFile && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeAvatarPreview}
                      disabled={isSubmitting}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isSubmitting}
                />

                <p className="text-xs text-muted-foreground">
                  Recommended size: 500x500px. Will be cropped to a circle.
                </p>
              </div>
            </div>
          </div>

          {/* Background Image Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Profile Background</h3>
              <p className="text-xs text-muted-foreground">
                Max size: 10MB (JPEG, PNG, WebP)
              </p>
            </div>

            <div className="relative aspect-[3/1] w-full overflow-hidden rounded-md bg-muted">
              {backgroundPreview ? (
                <Image
                  src={backgroundPreview}
                  alt="Background preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => backgroundInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                {backgroundFile ? "Change" : "Select"} Background
              </Button>

              {backgroundFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={removeBackgroundPreview}
                  disabled={isSubmitting}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <Input
                ref={backgroundInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBackgroundChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Recommended size: 1500x500px. A high-quality landscape image works
              best.
            </p>
          </div>

          <CardFooter className="flex justify-end px-0 pt-4">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || (!avatarFile && !backgroundFile)}
              className="bg-accent hover:bg-accent/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Images
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
