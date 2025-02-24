"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BookingFormValues } from "./types";
import { bookingSchema } from "./validations";
import { Loader2 } from "lucide-react";
import { submitBooking } from "./actions";
import CountrySearch from "../_components/(section-1)/CountrySelect";

const packages = [
  { value: "STARTUPTEAM", label: "Startup Team" },
  { value: "PROFESSIONALTEAM", label: "Professional Team" },
  { value: "ENTERPRISE", label: "Enterprise" },
];

export function BookingSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      country: "",
      package: "NONE",
      message: "",
    },
  });

  async function onSubmit(values: BookingFormValues) {
    setIsSubmitting(true);
    try {
      const result = await submitBooking(values);

      if (result.error) {
        console.error("Submission error:", result.error);
        toast.error(result.error);
      } else {
        toast.success("Booking submitted successfully");
        form.reset();
        setSearchQuery(""); // Clear the search query
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="booking"
      className="py-10 md:py-20 flex justify-center px-4 md:px-0"
    >
      <div className="bg-background dark:bg-black/40 backdrop-blur-sm border dark:border-white/10 rounded-2xl p-8 w-full max-w-4xl">
        <div className="container-block relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground dark:text-white">
              Book a Consultation
            </h2>
            <p className="text-base md:text-lg text-muted-foreground dark:text-white/60 max-w-2xl mx-auto">
              Choose your package and schedule a consultation with our team.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-white">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="bg-background dark:bg-black/40 dark:border-white/10 dark:text-white dark:placeholder-white/60"
                          />
                        </FormControl>
                        <FormMessage className="dark:text-red-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-white">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john@example.com"
                            {...field}
                            type="email"
                            className="bg-background dark:bg-black/40 dark:border-white/10 dark:text-white dark:placeholder-white/60"
                          />
                        </FormControl>
                        <FormMessage className="dark:text-red-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-white">
                          Mobile Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1234567890"
                            {...field}
                            className="bg-background dark:bg-black/40 dark:border-white/10 dark:text-white dark:placeholder-white/60"
                          />
                        </FormControl>
                        <FormMessage className="dark:text-red-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-white">
                          Country
                        </FormLabel>
                        <FormControl>
                          <CountrySearch
                            field={field}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                          />
                        </FormControl>
                        <FormMessage className="dark:text-red-300" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="package"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="dark:text-white">
                          Package
                        </FormLabel>
                        <a
                          href="http://localhost:3000/#pricing"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors dark:text-white/60 dark:hover:text-white"
                        >
                          See pricing →
                        </a>
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background dark:bg-black/40 dark:border-white/10 dark:text-white">
                            <SelectValue placeholder="Select your package type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-black/90 dark:border-white/10">
                          <SelectItem value="NONE" className="dark:text-white">
                            Select a package
                          </SelectItem>
                          {packages.map((pkg) => (
                            <SelectItem
                              key={pkg.value}
                              value={pkg.value}
                              className="dark:text-white"
                            >
                              {pkg.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="dark:text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-white">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your project requirements..."
                          className="resize-none bg-background dark:bg-black/40 dark:border-white/10 dark:text-white dark:placeholder-white/60"
                          {...field}
                          rows={6}
                        />
                      </FormControl>
                      <FormMessage className="dark:text-red-300" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center md:justify-start">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-red-700 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Booking"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
