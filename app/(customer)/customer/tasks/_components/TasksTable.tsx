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

interface Task {
  id: number;
  name: string;
  project: string;
  assignee: string;
  dueDate: string;
  status: string;
}

interface TasksTableProps {
  status?: string;
  assignee?: string;
  project?: string;
  dueDate?: string;
}

const TasksTable = ({
  status,
  assignee,
  project,
  dueDate,
}: TasksTableProps) => {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
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
        // Replace with your actual API call
        const response = await fetch(`/api/tasks?projectId=${project}`);
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [project]);

  const filteredTasks = tasks.filter((task) => {
    if (
      status &&
      status !== "all" &&
      task.status.toLowerCase() !== status.toLowerCase()
    ) {
      return false;
    }
    if (
      assignee &&
      assignee !== "all" &&
      task.assignee.toLowerCase() !== assignee.toLowerCase()
    ) {
      return false;
    }
    if (dueDate && dueDate !== "all") {
      // Add due date filtering logic based on your requirements
      return true;
    }
    return true;
  });

  const toggleTaskSelection = (taskId: number) => {
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
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  filteredTasks.length > 0 &&
                  selectedTasks.length === filteredTasks.length
                }
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
          {filteredTasks.map((task) => (
            <TableRow key={task.id} className="group hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={() => toggleTaskSelection(task.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{task.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-700">
                    {task.project[0]}
                  </span>
                  {task.project}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={`/avatars/${task.assignee.toLowerCase()}.png`}
                      alt={task.assignee}
                    />
                    <AvatarFallback>{task.assignee[0]}</AvatarFallback>
                  </Avatar>
                  {task.assignee}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {task.dueDate}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                    task.status,
                  )}`}
                >
                  {task.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 text-sm text-muted-foreground">
        {selectedTasks.length} of {filteredTasks.length} row(s) selected
      </div>
    </div>
  );
};

export default TasksTable;
