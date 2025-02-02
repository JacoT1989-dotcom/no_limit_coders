// contact-section.tsx
"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
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
import { MessageFormValues, countries } from "./types";
import { submitMessage } from "./actions";
import { messageSchema } from "./validations";

function CountrySelect({ field }: { field: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCountries = countries.filter((country) =>
    country.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <SelectTrigger className="bg-background">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        <div className="flex items-center px-3 pb-2">
          <Input
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Search country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

export function ContactSection() {
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      country: "",
      message: "",
    },
  });

  async function onSubmit(values: MessageFormValues) {
    console.log("Form submitted with values:", values);
    try {
      const result = await submitMessage(values);
      console.log("Server response:", result);

      if (result.error) {
        console.error("Submission error:", result.error);
        toast.error(result.error);
      } else {
        toast.success("Message sent successfully");
        form.reset();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to send message. Please try again.");
    }
  }

  return (
    <section
      id="contact"
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
              Contact Us
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Ready to start your project? Get in touch with us today.
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
                          <CountrySelect field={field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your project..."
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
                    className="w-full md:w-auto bg-red-700 text-white hover:bg-black"
                  >
                    Send Message
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
