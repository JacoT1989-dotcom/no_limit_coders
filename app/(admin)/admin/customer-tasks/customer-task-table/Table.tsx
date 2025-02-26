"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Paperclip, RefreshCcw } from "lucide-react";

// Define types for our task data
type TaskPriority = "HIGH" | "MEDIUM" | "LOW";
type TaskStatus = "COMPLETED" | "REVIEW" | "IN_PROGRESS" | "TODO";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  created: string;
  updated: string;
  dueDate: string;
  assignees: number;
  comments: number;
  attachments: number;
}

// Sample data based on the screenshot
const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Int...",
    description: "sal...",
    priority: "HIGH",
    status: "COMPLETED",
    created: "Feb 10",
    updated: "Feb 21",
    dueDate: "Feb 21",
    assignees: 1,
    comments: 0,
    attachments: 1,
  },
  {
    id: "2",
    title: "Cre...",
    description: "Thi...",
    priority: "LOW",
    status: "REVIEW",
    created: "Feb 26",
    updated: "Feb 26",
    dueDate: "Feb 28",
    assignees: 1,
    comments: 0,
    attachments: 1,
  },
  {
    id: "3",
    title: "dff...",
    description: "saf...",
    priority: "MEDIUM",
    status: "COMPLETED",
    created: "Feb 10",
    updated: "Feb 26",
    dueDate: "Feb 20",
    assignees: 1,
    comments: 12,
    attachments: 0,
  },
];

// Helper function to get color classes for priority and status
const getPriorityColorClass = (priority: TaskPriority) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-100 text-red-700";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700";
    case "LOW":
      return "bg-green-100 text-green-700";
    default:
      return "";
  }
};

const getStatusColorClass = (status: TaskStatus) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "REVIEW":
      return "bg-blue-100 text-blue-700";
    case "IN_PROGRESS":
      return "bg-orange-100 text-orange-700";
    case "TODO":
      return "bg-gray-100 text-gray-700";
    default:
      return "";
  }
};

const TasksTable: React.FC = () => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewType, setViewType] = useState<"Table" | "Kanban" | "Calendar">(
    "Table",
  );

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  // Select/deselect all tasks
  const toggleSelectAll = () => {
    if (selectedTasks.length === sampleTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(sampleTasks.map((task) => task.id));
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers Project Tasks Table</h1>
      </div>

      <p className="text-gray-600">Viewing 3 tasks in Caught Online</p>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Select defaultValue="Caught Online">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Caught Online">Caught Online</SelectItem>
              <SelectItem value="Other Project">Other Project</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Select defaultValue="all-statuses">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-assignees">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-assignees">All assignees</SelectItem>
              <SelectItem value="me">Me</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-dates">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-dates">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This week</SelectItem>
              <SelectItem value="this-month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {selectedTasks.length} of {sampleTasks.length} row(s) selected
          </span>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-600 flex items-center space-x-2"
              size="sm"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Refresh Tasks</span>
            </Button>
            <span className="text-red-600">Feb 26</span>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedTasks.length === sampleTasks.length &&
                      sampleTasks.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assignees</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Attachments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => toggleTaskSelection(task.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColorClass(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColorClass(task.status)}`}
                    >
                      {task.status}
                    </span>
                  </TableCell>
                  <TableCell>{task.created}</TableCell>
                  <TableCell>{task.updated}</TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">U</AvatarFallback>
                      </Avatar>
                      <span className="ml-2">{task.assignees}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{task.comments}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{task.attachments}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TasksTable;
