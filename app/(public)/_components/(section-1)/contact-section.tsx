// ContactSection.tsx
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageFormValues } from "./types";
import { submitMessage } from "./actions";
import { messageSchema } from "./validations";
import { Loader2 } from "lucide-react";
import CountrySearch from "./CountrySelect";

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    setIsSubmitting(true);
    try {
      const result = await submitMessage(values);

      if (result.error) {
        console.error("Submission error:", result.error);
        toast.error(result.error);
      } else {
        toast.success("Message sent successfully");
        form.reset();
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="contact"
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
              Contact Us
            </h2>
            <p className="text-base md:text-lg text-muted-foreground dark:text-white/60 max-w-2xl mx-auto">
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
                        <FormLabel className="dark:text-white">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="dark:bg-black/40 dark:border-white/10 dark:text-white dark:placeholder-white/60"
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
                            className="dark:bg-black/40 dark:border-white/10 dark:text-white dark:placeholder-white/60"
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
                            className="dark:bg-black/40 dark:border-white/10 dark:text-white dark:placeholder-white/60"
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
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-white">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your project..."
                          className="resize-none dark:bg-black/40 dark:border-white/10 dark:text-white dark:placeholder-white/60"
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
                    className="w-full md:w-auto bg-accent hover:bg-accent/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
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
