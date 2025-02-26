"use client";
import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectOption, ProjectTeamMember, Task } from "../types";

interface TasksKanbanProps {
  status?: string;
  assignee?: string;
  project?: string;
  dueDate?: string;
  projects: ProjectOption[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  textColor: string;
}

// Keep all four columns, including Done, with colors
const initialColumns = (): Column[] => [
  {
    id: "TODO",
    title: "Todo",
    tasks: [],
    color: "bg-red-100",
    textColor: "text-red-700",
  },
  {
    id: "REVIEW",
    title: "Backlog",
    tasks: [],
    color: "bg-purple-100",
    textColor: "text-purple-700",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    tasks: [],
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  {
    id: "DONE",
    title: "Done",
    tasks: [],
    color: "bg-green-100",
    textColor: "text-green-700",
  },
];

// Helper function to map between status and display values
const getStatusDisplayName = (status: string): string => {
  switch (status) {
    case "TODO":
      return "Todo";
    case "REVIEW":
      return "Backlog";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Done";
    default:
      return status;
  }
};

const TasksKanban = ({
  status,
  assignee,
  project,
  dueDate,
  projects,
}: TasksKanbanProps) => {
  // Get tasks directly from the selected project using useMemo
  const tasks = useMemo(() => {
    if (!project || project === "all") return [];
    const selectedProject = projects.find((p) => p.id === project);

    // Filter out COMPLETED tasks immediately
    const nonCompletedTasks =
      selectedProject?.tasks.filter((task) => task.status !== "COMPLETED") ||
      [];
    return nonCompletedTasks;
  }, [project, projects]);

  // Define columns with memoization to prevent unnecessary recalculations
  const columns = useMemo(() => {
    const baseColumns = initialColumns();

    // Distribute tasks to columns
    tasks.forEach((task) => {
      const column = baseColumns.find((col) => col.id === task.status);
      if (column) {
        const matchesAssignee =
          !assignee ||
          assignee === "all" ||
          task.assignees.some((a) => a.userId === assignee);

        const matchesDueDate =
          !dueDate ||
          dueDate === "all" ||
          (task.dueDate && isWithinDueDate(task.dueDate, dueDate));

        if (matchesAssignee && matchesDueDate) {
          column.tasks.push(task);
        }
      }
    });

    return baseColumns;
  }, [tasks, assignee, dueDate]);

  // Get color for a task's status badge
  const getStatusColor = (status: string) => {
    const column = initialColumns().find((col) => col.id === status);
    if (column) {
      return `${column.color} ${column.textColor}`;
    }
    return "bg-gray-100 text-gray-700";
  };

  const isWithinDueDate = (dueDate: Date, selectedRange: string) => {
    const today = new Date();
    const dueDateTime = new Date(dueDate);

    switch (selectedRange) {
      case "today":
        return dueDateTime.toDateString() === today.toDateString();
      case "week":
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);
        return dueDateTime <= weekFromNow && dueDateTime >= today;
      case "month":
        const monthFromNow = new Date(today);
        monthFromNow.setMonth(today.getMonth() + 1);
        return dueDateTime <= monthFromNow && dueDateTime >= today;
      default:
        return true;
    }
  };

  // Helper function to get initials from team member ID
  const getAssigneeInitials = (teamMember: ProjectTeamMember) => {
    return teamMember.user.displayName.slice(0, 2).toUpperCase();
  };

  if (!project || project === "all") {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Please select a project to view tasks
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex flex-col rounded-lg red-gradient p-[1px] shadow-lg"
        >
          <div className="bg-card rounded-lg flex flex-col h-full">
            <div
              className={`p-4 border-b border-border rounded-t-lg ${column.color} ${column.textColor}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{column.title}</h3>
                <span className="rounded-full bg-white/80 px-2 py-1 text-sm">
                  {column.tasks.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3 min-h-[calc(100vh-300px)]">
              {column.tasks.map((task) => (
                <Card
                  key={task.id}
                  className="hover-lift transition-all duration-300 bg-background/50 backdrop-blur-sm border-border"
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">
                      {task.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-6 hover:line-clamp-none">
                      {task.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {task.assignees.map((assignee) => (
                          <Avatar
                            key={assignee.id}
                            className="h-6 w-6 border-2 border-background"
                          >
                            <AvatarFallback className="bg-accent/10 text-accent">
                              {getAssigneeInitials(assignee)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                      >
                        {getStatusDisplayName(task.status)}
                      </span>
                    </div>
                    {task.dueDate && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TasksKanban;
