"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema, UpdatePasswordValues } from "./validations";
import { updatePassword } from "./actions";
import { toast } from "sonner";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Eye, EyeOff, LockKeyhole, Loader2 } from "lucide-react";

interface PasswordSectionProps {
  onSuccess?: () => void;
}

export function PasswordSection({ onSuccess }: PasswordSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: UpdatePasswordValues) => {
    setIsSubmitting(true);
    try {
      const result = await updatePassword(data);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Password updated successfully");
        form.reset();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error("Failed to update password");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  return (
    <Card className="w-full overflow-hidden border border-border/40 bg-card/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-accent" />
          <CardTitle className="text-xl font-semibold">Change Password</CardTitle>
        </div>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showCurrentPassword ? "text" : "password"}
                        className="pl-9 pr-10"
                        placeholder="Enter current password"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 rounded-md p-0"
                        onClick={() => togglePasswordVisibility('current')}
                        disabled={isSubmitting}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showCurrentPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showNewPassword ? "text" : "password"}
                        className="pl-9 pr-10"
                        placeholder="Enter new password"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 rounded-md p-0"
                        onClick={() => togglePasswordVisibility('new')}
                        disabled={isSubmitting}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showNewPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        className="pl-9 pr-10"
                        placeholder="Confirm new password"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 rounded-md p-0"
                        onClick={() => togglePasswordVisibility('confirm')}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-1 pt-2">
              <p className="text-xs font-medium">Password requirements:</p>
              <ul className="text-xs text-muted-foreground">
                <li className="flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                  At least 8 characters long
                </li>
                <li className="flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                  Both passwords must match
                </li>
              </ul>
            </div>
            
            <CardFooter className="flex justify-end px-0 pt-4">
              <Button 
                type="submit" 
                size="sm"
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}