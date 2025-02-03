"use client";
import React, { useState } from "react";
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

  // Mock data - Replace with actual data fetching
  const tasks: Task[] = [
    {
      id: 1,
      name: "Conduct usability testing",
      project: "Mobile App Development",
      assignee: "John",
      dueDate: "October 15th, 2024",
      status: "Backlog",
    },
    {
      id: 2,
      name: "Implement offline mode",
      project: "Mobile App Development",
      assignee: "Antonio",
      dueDate: "October 14th, 2024",
      status: "Todo",
    },
    {
      id: 3,
      name: "Design UI components",
      project: "Mobile App Development",
      assignee: "Antonio",
      dueDate: "October 10th, 2024",
      status: "In Progress",
    },
    {
      id: 4,
      name: "Create app wireframes",
      project: "Mobile App Development",
      assignee: "John",
      dueDate: "October 9th, 2024",
      status: "Done",
    },
  ];

  // Filter tasks based on props
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
    if (
      project &&
      project !== "all" &&
      task.project.toLowerCase() !== project.toLowerCase()
    ) {
      return false;
    }
    // Add due date filtering logic here based on your requirements
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
                    M
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
