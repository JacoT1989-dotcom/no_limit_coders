"use client";

import React, { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Priority } from "@prisma/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "./actions";

interface CreateProjectDialogProps {
  children: ReactNode;
  customerId: string;
}

interface FormValues {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: Priority;
  meetingDate: string;
  meetingTime: string;
}

const CreateProjectDialog = ({
  children,
  customerId,
}: CreateProjectDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of ["00", "30"]) {
        const time = `${hour.toString().padStart(2, "0")}:${minute}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      priority: Priority.MEDIUM,
      meetingDate: "",
      meetingTime: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      const formattedDate = new Date(
        `${data.meetingDate}T${data.meetingTime}`,
      ).toISOString();

      const result = await createProject({
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        priority: data.priority,
        preferredMeeting: formattedDate,
        customerId,
      });

      if (result.error) {
        toast.error(result.error);
        form.setError("root", { message: result.error });
        return;
      }

      if (result.success) {
        toast.success("Project created successfully");
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
      form.setError("root", {
        message: "Failed to create project. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) form.reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create New Project
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill in the project details and select your preferred meeting
                time for the initial discussion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Name and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{
                    required: "Project name is required",
                    minLength: {
                      value: 3,
                      message: "Project name must be at least 3 characters",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter project name"
                          className="bg-background dark:bg-card"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  rules={{ required: "Priority is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background dark:bg-card">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(Priority).map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority.charAt(0) +
                                priority.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Start Date and End Date */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  rules={{
                    required: "Start date is required",
                    validate: (value) => {
                      const date = new Date(value);
                      const today = new Date();
                      return (
                        date >= today || "Start date must not be in the past"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-background dark:bg-card"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  rules={{
                    required: "End date is required",
                    validate: (value) => {
                      const endDate = new Date(value);
                      const startDate = new Date(form.getValues("startDate"));
                      return (
                        endDate > startDate ||
                        "End date must be after start date"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-background dark:bg-card"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                rules={{
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project description"
                        className="bg-background dark:bg-card min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Meeting Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="meetingDate"
                  rules={{
                    required: "Meeting date is required",
                    validate: (value) => {
                      const date = new Date(value);
                      const today = new Date();
                      return (
                        date >= today || "Meeting date must be in the future"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-background dark:bg-card"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meetingTime"
                  rules={{ required: "Meeting time is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Time</FormLabel>
                      <FormControl>
                        <select
                          aria-label="Select meeting time"
                          title="Meeting time selection"
                          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="">Select time</option>
                          {generateTimeSlots().map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {form.formState.errors.root && (
              <p className="text-sm text-red-500 mt-2">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
