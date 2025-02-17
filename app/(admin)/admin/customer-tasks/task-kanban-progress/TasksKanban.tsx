"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import TaskMembersModal from "./TaskMembersModal";
import {
  Priority,
  ProjectOption,
  Task,
} from "@/app/(customer)/customer/tasks/types";
import { ColumnState, TaskStatus } from "@prisma/client";
import { updateTaskColumn } from "./update-actions";
import { Toaster } from "sonner";
import { getCustomerProjects } from "./get-actions";

const ProjectKanban = () => {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [columns, setColumns] = useState<{
    [key in TaskStatus]: Task[];
  }>({
    TODO: [],
    REVIEW: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  });

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      [TaskStatus.TODO]: "bg-gray-100 text-gray-800",
      [TaskStatus.REVIEW]: "bg-yellow-100 text-yellow-800",
      [TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
      [TaskStatus.COMPLETED]: "bg-green-100 text-green-800",
    };
    return colors[status];
  };

  const getHeaderStatusColor = (status: TaskStatus) => {
    const colors = {
      [TaskStatus.TODO]: "bg-gray-500/10",
      [TaskStatus.REVIEW]: "bg-yellow-500/10",
      [TaskStatus.IN_PROGRESS]: "bg-blue-500/10",
      [TaskStatus.COMPLETED]: "bg-green-500/10",
    };
    return colors[status];
  };

  const organizeTasksByStatus = useCallback((tasks: Task[]) => {
    const newColumns = {
      TODO: [] as Task[],
      REVIEW: [] as Task[],
      IN_PROGRESS: [] as Task[],
      COMPLETED: [] as Task[],
    };

    tasks.forEach((task) => {
      newColumns[task.status].push(task);
    });

    setColumns(newColumns);
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const response = await getCustomerProjects();
      if (response.projects) {
        setProjects(response.projects);
        // If there's a selected project, refresh its tasks
        if (selectedProject) {
          const project = response.projects.find(
            (p) => p.id === selectedProject,
          );
          if (project) {
            organizeTasksByStatus(project.tasks);
          }
        }
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    }
  }, [selectedProject, organizeTasksByStatus]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleProjectChange = useCallback(
    (projectId: string) => {
      setSelectedProject(projectId);
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        organizeTasksByStatus(project.tasks);
      }
    },
    [projects, organizeTasksByStatus],
  );

  const getColumnState = (status: TaskStatus): ColumnState => {
    switch (status) {
      case TaskStatus.TODO:
        return ColumnState.TODO;
      case TaskStatus.REVIEW:
        return ColumnState.BACKLOG;
      case TaskStatus.IN_PROGRESS:
        return ColumnState.IN_PROGRESS;
      case TaskStatus.COMPLETED:
        return ColumnState.DONE;
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("fromStatus", task.status);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    newStatus: TaskStatus,
  ) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const fromStatus = e.dataTransfer.getData("fromStatus") as TaskStatus;

    if (fromStatus === newStatus) return;

    // Optimistically update UI
    setColumns((prev) => {
      const newColumns = { ...prev };
      const task = newColumns[fromStatus].find((t) => t.id === taskId);

      if (task) {
        newColumns[fromStatus] = newColumns[fromStatus].filter(
          (t) => t.id !== taskId,
        );
        newColumns[newStatus] = [
          ...newColumns[newStatus],
          { ...task, status: newStatus },
        ];
      }

      return newColumns;
    });

    try {
      const newColumnState = getColumnState(newStatus);
      const response = await updateTaskColumn(taskId, newColumnState);

      if (response.success) {
        toast.success("Task updated successfully");
        // Refresh projects to get updated data
        await loadProjects();
      } else {
        // Revert optimistic update if server update fails
        setColumns((prev) => {
          const newColumns = { ...prev };
          const task = newColumns[newStatus].find((t) => t.id === taskId);

          if (task) {
            newColumns[newStatus] = newColumns[newStatus].filter(
              (t) => t.id !== taskId,
            );
            newColumns[fromStatus] = [
              ...newColumns[fromStatus],
              { ...task, status: fromStatus },
            ];
          }

          return newColumns;
        });

        toast.error(response.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      [Priority.LOW]: "bg-blue-100 text-blue-800",
      [Priority.MEDIUM]: "bg-yellow-100 text-yellow-800",
      [Priority.HIGH]: "bg-orange-100 text-orange-800",
      [Priority.URGENT]: "bg-red-100 text-red-800",
    };
    return colors[priority];
  };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-right" />
      <TaskMembersModal
        onUpdate={loadProjects}
        selectedProjectId={selectedProject}
      />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Select value={selectedProject} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}{" "}
                  {project.customer?.displayName
                    ? `[${project.customer.displayName}]`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(columns).map(([status, tasks]) => (
            <div
              key={status}
              className="flex flex-col rounded-lg red-gradient p-[1px] shadow-lg"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status as TaskStatus)}
            >
              <div className="bg-card rounded-lg flex flex-col h-full">
                <div
                  className={`p-4 border-b border-border ${getHeaderStatusColor(status as TaskStatus)}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-card-foreground">
                      {status.replace("_", " ")}
                    </h3>
                    <span className="rounded-full bg-accent/10 text-accent px-2 py-1 text-sm">
                      {tasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-3 min-h-[calc(100vh-300px)]">
                  {tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="hover-lift transition-all duration-300 bg-background/50 backdrop-blur-sm border-border cursor-move"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
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
                          <div className="flex gap-2">
                            {task.assignees.map((assignee) => (
                              <div key={assignee.id} className="relative group">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback
                                    className="bg-accent/10 text-accent"
                                    title={`${assignee.user.displayName} (${assignee.user.role.toLowerCase()})`}
                                  >
                                    {assignee.user.displayName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute hidden group-hover:block bottom-full mb-2 z-50 bg-popover text-popover-foreground text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
                                  {assignee.user.displayName} (
                                  {assignee.user.role.toLowerCase()})
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 items-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                            >
                              {task.status.replace("_", " ")}
                            </span>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                          </div>
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
      </div>
    </div>
  );
};

export default ProjectKanban;
