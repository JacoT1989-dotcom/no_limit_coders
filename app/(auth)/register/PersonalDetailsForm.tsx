import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CountrySelect from "@/app/(public)/_components/(section-1)/CountrySelect";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "./validation";

interface PersonalDetailsFormProps {
  form: UseFormReturn<RegisterFormValues>;
  isPending: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const PersonalDetailsForm = ({
  form,
  isPending,
  searchQuery,
  setSearchQuery,
}: PersonalDetailsFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground dark:text-white font-medium">
              First Name*
            </FormLabel>
            <FormControl>
              <Input
                placeholder="John"
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

      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground dark:text-white font-medium">
              Last Name*
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Doe"
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

      <FormField
        control={form.control}
        name="streetAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground dark:text-white font-medium">
              Street Address*
            </FormLabel>
            <FormControl>
              <Input
                placeholder="123 Main St"
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

      <FormField
        control={form.control}
        name="townCity"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground dark:text-white font-medium">
              Town/City*
            </FormLabel>
            <FormControl>
              <Input
                placeholder="New York"
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

      <FormField
        control={form.control}
        name="postcode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground dark:text-white font-medium">
              Postcode*
            </FormLabel>
            <FormControl>
              <Input
                placeholder="12345"
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

      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground dark:text-white font-medium">
              Country*
            </FormLabel>
            <FormControl>
              <CountrySelect
                field={field}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                disabled={isPending}
              />
            </FormControl>
            <FormMessage className="text-destructive dark:text-red-300" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PersonalDetailsForm;
