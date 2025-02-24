// LoginForm.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginFormValues, loginSchema } from "./validation";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { login } from "./actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LoginFormProps {
  onClose: () => void;
  onLoginSuccess: (redirectPath: string) => Promise<void>;
}

const LoginForm = ({ onClose, onLoginSuccess }: LoginFormProps) => {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsPending(true);
      const result = await login(data);

      if (result?.error) {
        toast.error(result.error);
        if (result.error.includes("Invalid email or password")) {
          form.setError("email", { message: "Invalid credentials" });
          form.setError("password", { message: "Invalid credentials" });
        }
        return;
      }

      if (result?.redirectTo) {
        if (result.redirectTo !== "/register-success") {
          toast.success("Logged in successfully!");
        }
        setIsPending(true);
        await router.replace(result.redirectTo);
        return;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6 bg-background dark:bg-black/40 dark:backdrop-blur-sm p-6 rounded-lg">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-foreground dark:text-white pt-3">
          Welcome to Genius Humans
        </h2>
        <p className="text-muted-foreground dark:text-white/60">
          Please sign in with your account credentials
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground dark:text-white font-medium">
                    Email*
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.name@geniushumans.com"
                      {...field}
                      disabled={isPending}
                      autoComplete="email"
                      type="email"
                      className="bg-background dark:bg-black/40 
                               border-input dark:border-white/10
                               focus:border-accent focus:ring-accent 
                               text-foreground dark:text-white 
                               placeholder:text-muted-foreground dark:placeholder:text-white/40
                               shadow-sm hover:border-accent/50 
                               transition-colors dark:backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive dark:text-red-300" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-foreground dark:text-white font-medium">
                      Password*
                    </FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground dark:text-white/60 hover:text-accent dark:hover:text-white transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-background dark:bg-black/80 text-foreground dark:text-white border-border dark:border-white/10">
                          <p className="font-medium mb-2">
                            Password must contain:
                          </p>
                          <ul className="space-y-1 text-sm text-muted-foreground dark:text-white/60">
                            <li>- At least 8 characters</li>
                            <li>- One uppercase letter</li>
                            <li>- One lowercase letter</li>
                            <li>- One number</li>
                            <li>- One special character</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      disabled={isPending}
                      autoComplete="current-password"
                      className="bg-background dark:bg-black/40 
                               border-input dark:border-white/10
                               focus:border-accent focus:ring-accent 
                               text-foreground dark:text-white
                               shadow-sm hover:border-accent/50
                               transition-colors dark:backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive dark:text-red-300" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                      className="border-input dark:border-white/10 
                               text-accent dark:text-white 
                               focus:ring-accent 
                               bg-background dark:bg-black/40 hover:border-accent/50
                               transition-colors"
                    />
                  </FormControl>
                  <div className="pb-2 leading-none">
                    <FormLabel className="text-sm text-muted-foreground dark:text-white/60">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Link
              href="/forgot-password"
              className="text-accent dark:text-white hover:text-accent/90 
                       dark:hover:text-white/90 
                       font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 
                     dark:bg-white dark:text-black dark:hover:bg-white/90
                     font-medium shadow-md hover:shadow-lg
                     transition-all duration-200"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin mr-2" />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
