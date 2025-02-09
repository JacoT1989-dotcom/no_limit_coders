"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Column, TasksKanbanProps } from "./types";
import TaskMembersModal from "./TaskMembersModal";

const TasksKanban = ({
  status,
  assignee,
  project,
  dueDate,
}: TasksKanbanProps) => {
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "backlog",
      title: "Backlog",
      tasks: [
        {
          id: 1,
          title: "Implement user authentication",
          project: "Mobile App Development",
          assignee: "John",
          dueDate: "March 15th, 2025",
          status: "Backlog",
        },
        {
          id: 2,
          title: "Design dashboard layout",
          project: "Mobile App Development",
          assignee: "Sarah",
          dueDate: "March 20th, 2025",
          status: "Backlog",
        },
      ],
    },
    {
      id: "todo",
      title: "Todo",
      tasks: [],
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: [],
    },
    {
      id: "done",
      title: "Done",
      tasks: [],
    },
  ]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    taskId: number,
    fromColumn: string,
  ) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData("fromColumn", fromColumn);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, toColumn: string) => {
    e.preventDefault();

    if (draggingTaskId === null) return;

    const fromColumn = e.dataTransfer.getData("fromColumn");
    if (fromColumn === toColumn) return;

    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];

      const sourceColumn = newColumns.find((col) => col.id === fromColumn);
      const targetColumn = newColumns.find((col) => col.id === toColumn);

      if (!sourceColumn || !targetColumn) return prevColumns;

      const taskIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === draggingTaskId,
      );
      if (taskIndex === -1) return prevColumns;

      // Remove task from source column
      const [taskToMove] = sourceColumn.tasks.splice(taskIndex, 1);

      // Update task status and add to target column
      const updatedTask = { ...taskToMove, status: targetColumn.title };
      targetColumn.tasks.push(updatedTask);

      return newColumns;
    });
  };

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

  const renderAssigneeAvatar = (assignee: string | null) => {
    if (!assignee) {
      return (
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-accent/10 text-accent">
            NA
          </AvatarFallback>
        </Avatar>
      );
    }

    return (
      <Avatar className="h-6 w-6">
        <AvatarFallback className="bg-accent/10 text-accent">
          {assignee.charAt(0)}
        </AvatarFallback>
      </Avatar>
    );
  };

  return (
    <>
      <TaskMembersModal />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex flex-col rounded-lg red-gradient p-[1px] shadow-lg"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
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
                    className="hover-lift transition-all duration-300 bg-background/50 backdrop-blur-sm border-border cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                    onDragEnd={handleDragEnd}
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
                        {renderAssigneeAvatar(task.assignee)}
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
    </>
  );
};

export default TasksKanban;
