"use client";
import React, { ReactNode } from "react";
import { useForm } from "react-hook-form";
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

interface CreateProjectDialogProps {
  children: ReactNode;
}

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

interface FormValues {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: Priority;
  meetingDateTime: string;
}

const CreateProjectDialog = ({ children }: CreateProjectDialogProps) => {
  const [open, setOpen] = React.useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      priority: Priority.MEDIUM,
      meetingDateTime: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Form data:", data);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
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
                Fill in the project details below. Please select your preferred
                meeting time for the initial project discussion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Project Name and Priority Row */}
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

              {/* Start Date and End Date Row */}
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

              {/* Description Field (Full Width) */}
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

              {/* Meeting Date/Time Field (Full Width) */}
              <FormField
                control={form.control}
                name="meetingDateTime"
                rules={{
                  required: "Meeting time is required",
                  validate: (value) => {
                    const meetingDate = new Date(value);
                    const now = new Date();
                    const hours = meetingDate.getHours();

                    if (meetingDate <= now) {
                      return "Meeting time must be in the future";
                    }

                    if (hours < 9 || hours >= 17) {
                      return "Meeting must be scheduled between 9 AM and 5 PM";
                    }

                    return true;
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Meeting Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="bg-background dark:bg-card"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              >
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
