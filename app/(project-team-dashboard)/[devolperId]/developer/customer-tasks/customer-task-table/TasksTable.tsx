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

const TasksTable = () => {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const tasks: Task[] = [
    {
      id: 1,
      name: "Design UI Components",
      project: "Mobile App",
      assignee: "John",
      dueDate: "Mar 15, 2025",
      status: "In Progress",
    },
    {
      id: 2,
      name: "Implement Authentication",
      project: "Mobile App",
      assignee: "Sarah",
      dueDate: "Mar 20, 2025",
      status: "Todo",
    },
    {
      id: 3,
      name: "Create Documentation",
      project: "Mobile App",
      assignee: "Michael",
      dueDate: "Mar 25, 2025",
      status: "Backlog",
    },
    {
      id: 4,
      name: "Performance Testing",
      project: "Mobile App",
      assignee: "Antonio",
      dueDate: "Mar 30, 2025",
      status: "Done",
    },
  ];

  const toggleTaskSelection = (taskId: number) => {
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
        {selectedTasks.length} of {tasks.length} row(s) selected
      </div>
    </div>
  );
};

export default TasksTable;
