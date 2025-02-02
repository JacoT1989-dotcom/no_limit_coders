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
import { registerSchema, type RegisterFormValues } from "./validation";
import { signUp } from "./actions";
import { toast } from "sonner";

const RegisterForm = () => {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      displayName: "",
      streetAddress: "",
      townCity: "",
      postcode: "",
      country: "",
      password: "",
      confirmPassword: "",
      role: "USER",
      agreeTerms: false,
      avatarUrl: null,
      backgroundUrl: null,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsPending(true);
      const result = await signUp(data);
      if (result?.error) {
        toast.error(result.error);
        if (result.error.includes("Username")) {
          form.setError("username", { message: result.error });
        } else if (result.error.includes("Email")) {
          form.setError("email", { message: result.error });
        }
        return;
      }

      toast.success("Registration successful!");
      router.push("/register-success");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Create an Account
        </h2>
        <p className="text-gray-600">
          Please complete all required fields to register
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Username*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      {...field}
                      autoComplete="username"
                      disabled={isPending}
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                      autoComplete="email"
                      disabled={isPending}
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Display Name*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={isPending}
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">First Name*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
                      {...field}
                      disabled={isPending}
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Last Name*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
                      {...field}
                      disabled={isPending}
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Street Address*
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Main St"
                      {...field}
                      disabled={isPending}
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="townCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Town/City*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="New York"
                      {...field}
                      disabled={isPending}
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Postcode*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12345"
                      {...field}
                      disabled={isPending}
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Country*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="United States"
                      {...field}
                      disabled={isPending}
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
                  <FormLabel className="text-gray-700">Password*</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      autoComplete="new-password"
                      disabled={isPending}
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Confirm Password*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      autoComplete="new-password"
                      disabled={isPending}
                      className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="agreeTerms"
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
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-red-600 hover:text-red-500 underline"
                    >
                      terms and conditions
                    </Link>
                    *
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
