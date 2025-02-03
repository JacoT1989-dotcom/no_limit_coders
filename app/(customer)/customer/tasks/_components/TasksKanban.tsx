"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const columns = [
    {
      id: "backlog",
      title: "Backlog",
      tasks: [
        {
          id: 1,
          title: "Conduct usability testing",
          project: "Mobile App Development",
          assignee: "John",
          dueDate: "October 15th, 2024",
          status: "Backlog",
        },
      ],
    },
    {
      id: "todo",
      title: "Todo",
      tasks: [
        {
          id: 2,
          title: "Implement offline mode",
          project: "Mobile App Development",
          assignee: "Antonio",
          dueDate: "October 14th, 2024",
          status: "Todo",
        },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: [
        {
          id: 3,
          title: "Design UI components",
          project: "Mobile App Development",
          assignee: "Antonio",
          dueDate: "October 10th, 2024",
          status: "In Progress",
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        {
          id: 4,
          title: "Create app wireframes",
          project: "Mobile App Development",
          assignee: "John",
          dueDate: "October 9th, 2024",
          status: "Done",
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Backlog":
        return "bg-purple-100 text-purple-700";
      case "Todo":
        return "bg-red-100 text-red-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Done":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
                        M
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
