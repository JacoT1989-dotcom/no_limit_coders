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

const LoginForm = () => {
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
        toast.success("Logged in successfully!");
        router.push(result.redirectTo);
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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Welcome to Genius Humans
        </h2>
        <p className="text-gray-600">
          Please sign in with your account credentials
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.name@geniushumans.com"
                      {...field}
                      disabled={isPending}
                      autoComplete="email"
                      type="email"
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-gray-700">Password*</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-gray-700 border-gray-200">
                          <p>Password must contain:</p>
                          <p>- At least 8 characters</p>
                          <p>- One uppercase letter</p>
                          <p>- One lowercase letter</p>
                          <p>- One number</p>
                          <p>- One special character</p>
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
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                      className="border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-gray-600">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Link
              href="/forgot-password"
              className="text-sm text-red-600 hover:text-red-500 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
