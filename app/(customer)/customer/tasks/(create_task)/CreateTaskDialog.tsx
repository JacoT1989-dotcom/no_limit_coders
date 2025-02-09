"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { CreateTaskDialogProps, Priority, TaskFormValues } from "../types";
import { createTask } from "./actions";

export function CreateTaskDialog({
  projectId,
  projectName,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormValues>({
    defaultValues: {
      name: "",
      projectId: projectId,
      description: "",
      priority: Priority.MEDIUM,
      attachments: null,
      dueDate: "",
    },
  });

  const handleClick = () => {
    if (projectId === "all") {
      toast.error("Please select a project first");
      return;
    }
    setOpen(true);
  };

  async function onSubmit(data: TaskFormValues) {
    try {
      setIsSubmitting(true);

      // Create FormData object
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("projectId", data.projectId);
      formData.append("description", data.description);
      formData.append("priority", data.priority);
      if (data.dueDate) {
        formData.append("dueDate", data.dueDate);
      }

      // Handle file attachments
      if (data.attachments) {
        Array.from(data.attachments).forEach((file) => {
          formData.append("attachments", file);
        });
      }

      // Call the server action
      const result = await createTask(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(
        "Task created successfully, Check your inbox to view confirmation for task creation received",
      );
      form.reset();
      setOpen(false);
      
      // Call the onTaskCreated callback if it exists
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create task",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={handleClick}
        >
          Create Task
        </Button>
      </DialogTrigger>
      {projectId !== "all" && (
        <DialogContent className="sm:max-w-[625px] bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Task Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter task name"
                        className="bg-background dark:bg-card"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project (readonly/disabled) */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <FormControl>
                      <Input
                        value={projectName}
                        className="bg-background dark:bg-card"
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        className="bg-background dark:bg-card min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
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
                        <SelectItem value={Priority.LOW}>Low</SelectItem>
                        <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={Priority.HIGH}>High</SelectItem>
                        <SelectItem value={Priority.URGENT}>Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachments */}
              <FormField
                control={form.control}
                name="attachments"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Attachments</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        className="bg-background dark:bg-card"
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
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

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  type="button"
                  className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      )}
    </Dialog>
  );
}