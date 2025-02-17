"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, isThisWeek, isThisMonth } from "date-fns";
import { Priority, ProjectOption, ProjectTeamMember, Task } from "../types";
import { getCustomerProjects } from "../actions";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Helper function to check if a task is within the selected due date range
const isWithinDueDate = (
  dueDate: Date | null,
  createdAt: Date,
  selectedRange: string | undefined,
) => {
  if (!selectedRange || selectedRange === "all") return true;

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const dueDateStart = dueDate
    ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
    : null;
  const createdAtStart = new Date(
    createdAt.getFullYear(),
    createdAt.getMonth(),
    createdAt.getDate(),
  );

  switch (selectedRange.toLowerCase()) {
    case "today":
      return (
        dueDateStart?.getTime() === todayStart.getTime() ||
        createdAtStart.getTime() === todayStart.getTime()
      );
    case "week":
      return (
        (dueDate && isThisWeek(dueDate, { weekStartsOn: 1 })) ||
        isThisWeek(createdAt, { weekStartsOn: 1 })
      );
    case "month":
      return (dueDate && isThisMonth(dueDate)) || isThisMonth(createdAt);
    default:
      return true;
  }
};

// AssigneesDisplay component for showing assignees in the table
const AssigneesDisplay = ({
  assignees,
}: {
  assignees: ProjectTeamMember[];
}) => {
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0]}${lastName[0]}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-[140px]">
          <div className="flex items-center">
            {assignees.length > 0 ? (
              <div className="flex -space-x-2 mr-2">
                {assignees.slice(0, 3).map((assignee) => (
                  <Avatar
                    key={assignee.id}
                    className="h-6 w-6 border-2 border-background"
                  >
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        assignee.user.firstName,
                        assignee.user.lastName,
                      )}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              <Users className="h-4 w-4 mr-2" />
            )}
            <span>
              {assignees.length}{" "}
              {assignees.length === 1 ? "Assignee" : "Assignees"}
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task Assignees</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {assignees.map((assignee) => (
            <div
              key={assignee.id}
              className="flex items-center justify-between p-2 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10">
                    {getInitials(
                      assignee.user.firstName,
                      assignee.user.lastName,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-medium">
                    {assignee.user.firstName} {assignee.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {assignee.user.email}
                  </p>
                </div>
              </div>
              <Badge variant="outline">{assignee.role}</Badge>
            </div>
          ))}
          {assignees.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No assignees for this task
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface TasksTableProps {
  status?: string;
  assignee?: string;
  project?: string;
  dueDate?: string;
  projects: ProjectOption[];
  onAvailableDates: (dates: string[]) => void;
}

const TasksTable = ({
  status,
  assignee,
  project,
  dueDate,
  projects,
  onAvailableDates,
}: TasksTableProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize tasks when project changes
  useEffect(() => {
    if (!project || project === "all") {
      setTasks([]);
      return;
    }

    const selectedProject = projects.find((p) => p.id === project);
    if (selectedProject) {
      setTasks(selectedProject.tasks);
    }
  }, [project, projects]);

  // Update available dates based on tasks
  useEffect(() => {
    const availableDates = ["all"];
    const hasTasksForToday = tasks.some((task) =>
      isWithinDueDate(task.dueDate, task.createdAt, "today"),
    );
    const hasTasksForWeek = tasks.some((task) =>
      isWithinDueDate(task.dueDate, task.createdAt, "week"),
    );
    const hasTasksForMonth = tasks.some((task) =>
      isWithinDueDate(task.dueDate, task.createdAt, "month"),
    );

    if (hasTasksForToday) availableDates.push("today");
    if (hasTasksForWeek) availableDates.push("week");
    if (hasTasksForMonth) availableDates.push("month");

    onAvailableDates(availableDates);
  }, [tasks, onAvailableDates]);

  // Refresh tasks function
  const refreshTasks = async () => {
    if (!project || project === "all") return;

    setIsRefreshing(true);
    try {
      const result = await getCustomerProjects();
      if (result.projects) {
        const updatedProject = result.projects.find((p) => p.id === project);
        if (updatedProject) {
          setTasks(updatedProject.tasks);
        }
      }
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Task selection handlers
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const toggleAllTasks = () => {
    setSelectedTasks((prev) =>
      prev.length === filteredTasks.length
        ? []
        : filteredTasks.map((task) => task.id),
    );
  };

  // Style helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-red-100 text-red-700";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700";
      case "REVIEW":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-green-100 text-green-700";
    }
  };

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        !status ||
        status === "all" ||
        task.status.toLowerCase() === status.toLowerCase();
      const matchesAssignee =
        !assignee ||
        assignee === "all" ||
        task.assignees.some((a) => a.userId === assignee);
      const matchesDueDate = isWithinDueDate(
        task.dueDate,
        task.createdAt,
        dueDate,
      );

      return matchesStatus && matchesAssignee && matchesDueDate;
    });
  }, [tasks, status, assignee, dueDate]);

  if (!project || project === "all") {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Please select a project to view tasks
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {selectedTasks.length} of {filteredTasks.length} row(s) selected
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTasks}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Tasks"}
          </Button>
          <span className="text-red-600 font-semibold">
            {format(new Date(), "dd MMMM yyyy")}
          </span>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className={cn("w-full caption-bottom text-sm border-collapse")}>
          <thead>
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium w-[50px]">
                <Checkbox
                  checked={
                    filteredTasks.length > 0 &&
                    selectedTasks.length === filteredTasks.length
                  }
                  onCheckedChange={toggleAllTasks}
                />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[180px]">
                Title
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[200px]">
                Description
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Priority
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Due Date
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Created
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Updated
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[120px]">
                Assignees
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Comments
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Attachments
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr
                key={task.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                  />
                </td>
                <td className="p-4 align-middle">
                  <div className="relative">
                    <div className="truncate font-medium cursor-pointer hover:text-primary peer">
                      {task.title}
                    </div>
                    <div className="invisible peer-hover:visible absolute left-0 top-full z-50 bg-popover text-popover-foreground p-4 rounded-md shadow-md w-[300px]">
                      {task.title}
                    </div>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="relative">
                    <div className="truncate cursor-pointer hover:text-primary peer">
                      {task.description || "-"}
                    </div>
                    {task.description && (
                      <div className="invisible peer-hover:visible absolute left-0 top-full z-50 bg-popover text-popover-foreground p-4 rounded-md shadow-md w-[400px]">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </td>
                <td className="p-4 align-middle whitespace-nowrap">
                  {task.dueDate
                    ? format(new Date(task.dueDate), "dd MMM")
                    : "-"}
                </td>
                <td className="p-4 align-middle whitespace-nowrap">
                  {format(new Date(task.createdAt), "dd MMM")}
                </td>
                <td className="p-4 align-middle whitespace-nowrap">
                  {format(new Date(task.updatedAt), "dd MMM")}
                </td>
                <td className="p-4 align-middle">
                  <AssigneesDisplay assignees={task.assignees} />
                </td>
                <td className="p-4 align-middle">
                  <Badge variant="outline">
                    {task.comments.length} comments
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  <Badge variant="outline">
                    {task.attachments.length} files
                  </Badge>
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="p-4 text-center text-muted-foreground"
                >
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(TasksTable);
