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
import { countries } from "../_components/(section-1)/types";
import { submitBooking } from "./actions";

function CountrySelect({
  field,
  searchQuery,
  setSearchQuery,
}: {
  field: any;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const filteredCountries = countries.filter((country) =>
    country.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      onValueChange={(value) => {
        field.onChange(value);
        setSearchQuery("");
        setOpen(false);
      }}
      value={field.value}
    >
      <SelectTrigger className="bg-background">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="sticky top-0 bg-background px-3 pb-2">
          <Input
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Search country..."
            value={searchQuery}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSearchQuery(e.target.value);
            }}
            autoFocus
          />
        </div>
        <div className="max-h-[200px] overflow-auto">
          {filteredCountries.map((country) => (
            <SelectItem key={country.value} value={country.value}>
              {country.label}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

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
      <div className="section-block">
        <div className="container-block relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Book a Consultation
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
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
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john@example.com"
                            {...field}
                            type="email"
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1234567890"
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <CountrySelect
                            field={field}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="package"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select a package" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.value} value={pkg.value}>
                              {pkg.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your project requirements..."
                          className="resize-none bg-background"
                          {...field}
                          rows={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center md:justify-start">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-red-700 text-white hover:bg-black"
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
