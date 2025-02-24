import React from "react";
import Link from "next/link";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PackageSelect } from "@/app/(public)/_components/(section-1)/PackageSelect";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "./validation";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AccountDetailsFormProps {
  form: UseFormReturn<RegisterFormValues>;
  isPending: boolean;
}

const AccountDetailsForm = ({ form, isPending }: AccountDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground dark:text-white font-medium">
                Username*
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="johndoe"
                  {...field}
                  autoComplete="username"
                  disabled={isPending}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground dark:text-white font-medium">
                Email*
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="john@example.com"
                  type="email"
                  {...field}
                  autoComplete="email"
                  disabled={isPending}
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
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground dark:text-white font-medium">
                Display Name*
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  {...field}
                  disabled={isPending}
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
      </div>

      <FormField
        control={form.control}
        name="package"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground dark:text-white font-medium">
              Package Selection*
            </FormLabel>
            <FormControl>
              <PackageSelect field={field} disabled={isPending} />
            </FormControl>
            <FormMessage className="text-destructive dark:text-red-300" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
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
                  autoComplete="new-password"
                  disabled={isPending}
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

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground dark:text-white font-medium">
                Confirm Password*
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  autoComplete="new-password"
                  disabled={isPending}
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

      <FormField
        control={form.control}
        name="agreeTerms"
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
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-accent dark:text-white hover:text-accent/90 
                           dark:hover:text-white/90 
                           font-medium transition-colors"
                >
                  terms and conditions
                </Link>
                *
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default AccountDetailsForm;