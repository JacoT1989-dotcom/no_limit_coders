"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ProjectOption } from "@/app/(customer)/customer/tasks/types";
import { getDeveloperProjects } from "./actions";
import TasksTableSkeleton from "./TasksTableSkeleton";

const TasksTable = () => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flatten all tasks from all projects
  const tasks = projects.flatMap((project) =>
    project.tasks.map((task) => ({
      ...task,
      projectName: project.name,
      assignees: task.assignees.map((assignee) => assignee.user),
    })),
  );

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getDeveloperProjects();
        if (result.error) {
          setError(result.error);
        } else if (result.projects) {
          setProjects(result.projects);
        }
      } catch (err) {
        setError("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const toggleAllTasks = () => {
    setSelectedTasks((prev) =>
      prev.length === tasks.length ? [] : tasks.map((task) => task.id),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "review":
        return "bg-purple-100 text-purple-700";
      case "todo":
        return "bg-red-100 text-red-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return <TasksTableSkeleton />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-full p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedTasks.length === tasks.length}
                onCheckedChange={toggleAllTasks}
              />
            </TableHead>
            <TableHead className="min-w-[200px]">Task Name</TableHead>
            <TableHead className="min-w-[200px]">Project</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="group hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={() => toggleTaskSelection(task.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-700">
                    {task.projectName[0]}
                  </span>
                  {task.projectName}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {task.assignees.length > 0 ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`/avatars/${task.assignees[0].displayName.toLowerCase()}.png`}
                          alt={task.assignees[0].displayName}
                        />
                        <AvatarFallback>
                          {task.assignees[0].displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                      {task.assignees[0].displayName}
                      {task.assignees.length > 1 && (
                        <span className="text-xs text-muted-foreground">
                          +{task.assignees.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {task.dueDate
                  ? format(new Date(task.dueDate), "MMM dd, yyyy")
                  : "No due date"}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                    task.status,
                  )}`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 text-sm text-muted-foreground">
        {selectedTasks.length} of {tasks.length} row(s) selected
      </div>
    </div>
  );
};

export default TasksTable;
