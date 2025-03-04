"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Priority as PrismaPriority, TaskStatus } from "@prisma/client";
import { toast } from "sonner";
import { ProjectTeamMember, Task } from "../../types";
import { editTask } from "./editTask";

const formSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  priority: z.nativeEnum(PrismaPriority),
  status: z.nativeEnum(TaskStatus),
  dueDate: z.date().nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
  projectId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskDialogProps {
  task: Task;
  projectId: string;
  teamMembers: ProjectTeamMember[];
  onTaskUpdated?: () => void;
}

export function EditTaskDialog({
  task,
  projectId,
  teamMembers = [], // Default to empty array
  onTaskUpdated,
}: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with task data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: task.id,
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assigneeIds: task.assignees.map((a) => a.userId),
      projectId: projectId,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Convert the date to string for the server action
      const formData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      };

      const result = await editTask(formData);

      if (result.success) {
        toast.success("Task updated successfully");
        setOpen(false);
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      } else {
        toast.error(result.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: PrismaPriority.LOW, label: "Low" },
    { value: PrismaPriority.MEDIUM, label: "Medium" },
    { value: PrismaPriority.HIGH, label: "High" },
    { value: PrismaPriority.URGENT, label: "Urgent" },
  ];

  const statusOptions = [
    { value: TaskStatus.TODO, label: "Todo" },
    { value: TaskStatus.REVIEW, label: "Review" },
    { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
    { value: TaskStatus.COMPLETED, label: "Completed" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 dark:text-slate-100">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Task title"
                      {...field}
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 dark:text-slate-100">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the task..."
                      {...field}
                      value={field.value || ""}
                      rows={4}
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-900 dark:text-slate-100">
                      Status
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-900 dark:text-slate-100">
                      Priority
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-slate-900 dark:text-slate-100">
                    Due Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {teamMembers && teamMembers.length > 0 ? (
              <FormField
                control={form.control}
                name="assigneeIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base text-slate-900 dark:text-slate-100">
                        Assignees
                      </FormLabel>
                    </div>
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <FormField
                          key={member.userId}
                          control={form.control}
                          name="assigneeIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={member.userId}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(
                                      member.userId,
                                    )}
                                    onCheckedChange={(checked) => {
                                      const currentIds = field.value || [];
                                      if (checked) {
                                        field.onChange([
                                          ...currentIds,
                                          member.userId,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentIds.filter(
                                            (id) => id !== member.userId,
                                          ),
                                        );
                                      }
                                    }}
                                    className="border-slate-300 dark:border-slate-600"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-slate-900 dark:text-slate-100">
                                  {member.user.displayName}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            ) : (
              <div className="text-sm text-muted-foreground dark:text-slate-400">
                No team members available to assign to this task.
              </div>
            )}

            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
