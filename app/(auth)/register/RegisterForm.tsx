"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterFormValues } from "./validation";
import { signUp } from "./actions";
import { toast } from "sonner";
import PersonalDetailsForm from "./PersonalDetailsForm";
import AccountDetailsForm from "./AccountDetailsForm";

const RegisterForm = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStep, setCurrentStep] = useState<"personal" | "account">(
    "personal",
  );

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
      package: "NONE",
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

  const handleNext = async () => {
    const fields =
      currentStep === "personal"
        ? ([
            "firstName",
            "lastName",
            "streetAddress",
            "townCity",
            "postcode",
            "country",
          ] as const)
        : ([
            "username",
            "email",
            "displayName",
            "password",
            "confirmPassword",
            "agreeTerms",
            "package",
          ] as const);

    const isValid = await form.trigger(fields);
    if (!isValid) return;

    if (currentStep === "personal") {
      setCurrentStep("account");
    } else {
      await form.handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="space-y-6 bg-background dark:bg-black/40 dark:backdrop-blur-sm p-6 rounded-lg">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-foreground dark:text-white pt-3">
          Create an Account
        </h2>
        <p className="text-muted-foreground dark:text-white/60">
          Please complete all required fields to register
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6 p-6">
          {currentStep === "personal" ? (
            <PersonalDetailsForm
              form={form}
              isPending={isPending}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          ) : (
            <AccountDetailsForm form={form} isPending={isPending} />
          )}

          <div className="flex justify-between space-x-4">
            {currentStep === "account" && (
              <Button
                type="button"
                onClick={() => setCurrentStep("personal")}
                variant="outline"
                className="flex-1 bg-background dark:bg-black/40 
                         border-input dark:border-white/10
                         hover:bg-accent/10 dark:hover:bg-white/10
                         text-foreground dark:text-white
                         transition-colors"
                disabled={isPending}
              >
                Back
              </Button>
            )}

            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-accent hover:bg-accent/90 
                       dark:bg-white dark:text-black dark:hover:bg-white/90
                       font-medium shadow-md hover:shadow-lg
                       transition-all duration-200"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin mr-2" />
                  {currentStep === "personal"
                    ? "Saving..."
                    : "Creating Account..."}
                </div>
              ) : currentStep === "personal" ? (
                "Next"
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
