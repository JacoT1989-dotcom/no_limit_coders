"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Task {
  id: number;
  title: string;
  project: string;
  assignee: string;
  dueDate: string;
  status: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface TasksKanbanProps {
  status?: string;
  assignee?: string;
  project?: string;
  dueDate?: string;
}

const TasksKanban = ({
  status,
  assignee,
  project,
  dueDate,
}: TasksKanbanProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!project || project === "all") {
        setTasks([]);
        return;
      }

      setLoading(true);
      try {
        // Temporary: Return empty array until API is implemented
        setTasks([]);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [project]);

  const columns: Column[] = [
    { id: "backlog", title: "Backlog", tasks: [] },
    { id: "todo", title: "Todo", tasks: [] },
    { id: "in-progress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ];

  // Filter and distribute tasks to columns
  tasks.forEach((task) => {
    const column = columns.find(
      (col) => col.id === task.status.toLowerCase().replace(" ", "-"),
    );
    if (column) {
      if (
        (!status ||
          status === "all" ||
          task.status.toLowerCase() === status.toLowerCase()) &&
        (!assignee ||
          assignee === "all" ||
          task.assignee.toLowerCase() === assignee.toLowerCase()) &&
        (!dueDate || dueDate === "all")
      ) {
        column.tasks.push(task);
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "backlog":
        return "bg-purple-100 text-purple-700";
      case "todo":
        return "bg-red-100 text-red-700";
      case "in progress":
        return "bg-yellow-100 text-yellow-700";
      case "done":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!project || project === "all") {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Please select a project to view tasks
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Loading tasks...
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
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/10 text-accent text-xs">
                        {task.project[0]}
                      </span>
                      {task.project}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex justify-between items-center">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`/avatars/${task.assignee.toLowerCase()}.png`}
                        />
                        <AvatarFallback className="bg-accent/10 text-accent">
                          {task.assignee[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Due {task.dueDate}
                    </div>
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
