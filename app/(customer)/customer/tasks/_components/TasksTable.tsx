"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, isThisWeek, isThisMonth } from "date-fns";
import { Priority, ProjectOption, ProjectTeamMember, Task } from "../types";
import { getCustomerProjects } from "../actions";

interface TasksTableProps {
  status?: string;
  assignee?: string;
  project?: string;
  dueDate?: string;
  projects: ProjectOption[];
  onAvailableDates: (dates: string[]) => void;
}

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

  const getAssigneeInitials = (assignee: ProjectTeamMember) => {
    return assignee.userId.slice(0, 2).toUpperCase();
  };

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
    <div className="w-full space-y-4">
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
      <div className="relative w-full overflow-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] sticky left-0 bg-background">
                <Checkbox
                  checked={
                    filteredTasks.length > 0 &&
                    selectedTasks.length === filteredTasks.length
                  }
                  onCheckedChange={toggleAllTasks}
                />
              </TableHead>
              <TableHead className="w-[180px]">Title</TableHead>
              <TableHead className="w-[200px]">Description</TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Due Date</TableHead>
              <TableHead className="w-[100px]">Created</TableHead>
              <TableHead className="w-[100px]">Updated</TableHead>
              <TableHead className="w-[120px]">Assignees</TableHead>
              <TableHead className="w-[100px]">Comments</TableHead>
              <TableHead className="w-[100px]">Attachments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id} className="group hover:bg-muted/50">
                <TableCell className="w-[50px] sticky left-0 bg-background">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                  />
                </TableCell>
                <TableCell className="w-[180px]">
                  <div className="relative">
                    <div className="truncate font-medium cursor-pointer hover:text-primary peer">
                      {task.title
                        ? task.title.split(" ").slice(0, 2).join(" ") + "..."
                        : "-"}
                    </div>
                    {task.title && task.title.length > 0 && (
                      <div className="invisible peer-hover:visible absolute left-0 top-full z-50 bg-popover text-popover-foreground p-4 rounded-md shadow-md w-[300px]">
                        {task.title}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-[200px]">
                  <div className="relative">
                    <div className="truncate cursor-pointer hover:text-primary peer">
                      {task.description
                        ? task.description.split(" ").slice(0, 4).join(" ") +
                          "..."
                        : "-"}
                    </div>
                    {task.description && task.description.length > 0 && (
                      <div className="invisible peer-hover:visible absolute left-0 top-full z-50 bg-popover text-popover-foreground p-4 rounded-md shadow-md w-[400px]">
                        {task.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-[100px]">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell className="w-[100px]">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className="w-[100px] whitespace-nowrap">
                  {task.dueDate
                    ? format(new Date(task.dueDate), "dd MMM")
                    : "-"}
                </TableCell>
                <TableCell className="w-[100px] whitespace-nowrap">
                  {format(new Date(task.createdAt), "dd MMM")}
                </TableCell>
                <TableCell className="w-[100px] whitespace-nowrap">
                  {format(new Date(task.updatedAt), "dd MMM")}
                </TableCell>
                <TableCell className="w-[120px]">
                  <div className="flex -space-x-2">
                    {task.assignees.map((assignee) => (
                      <Avatar
                        key={assignee.id}
                        className="h-8 w-8 border-2 border-background"
                      >
                        <AvatarFallback className="bg-primary/10">
                          {getAssigneeInitials(assignee)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="w-[100px]">
                  <Badge variant="outline">
                    {task.comments.length} comments
                  </Badge>
                </TableCell>
                <TableCell className="w-[100px]">
                  <Badge variant="outline">
                    {task.attachments.length} files
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default React.memo(TasksTable);
