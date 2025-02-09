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
}

// Define column type with initial empty arrays
const initialColumns = (): Column[] => [
  { id: "TODO", title: "Todo", tasks: [] as Task[] },
  { id: "BACKLOG", title: "Backlog", tasks: [] as Task[] },
  { id: "IN_PROGRESS", title: "In Progress", tasks: [] as Task[] },
  { id: "DONE", title: "Done", tasks: [] as Task[] },
];

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
    return selectedProject?.tasks || [];
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BACKLOG":
        return "bg-purple-100 text-purple-700";
      case "TODO":
        return "bg-red-100 text-red-700";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700";
      case "DONE":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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
    return teamMember.userId.slice(0, 2).toUpperCase();
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
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">
                  {column.title}
                </h3>
                <span className="rounded-full bg-accent/10 text-accent px-2 py-1 text-sm">
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
                    <CardDescription className="text-xs">
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
                        {task.status.replace("_", " ")}
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
