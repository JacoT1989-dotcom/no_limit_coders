"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TasksTable = () => {
  const tasks = [
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
    // ... more tasks
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">View all of your tasks here</p>

        {/* View Type Tabs */}
        <div className="flex gap-2">
          <Button variant="secondary" className="bg-secondary">
            Table
          </Button>
          <Button variant="ghost">Kanban</Button>
          <Button variant="ghost">Calendar</Button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <span>All statuses</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <span>All assignees</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              <SelectItem value="john">John</SelectItem>
              <SelectItem value="antonio">Antonio</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <span>All projects</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              <SelectItem value="mobile">Mobile App Development</SelectItem>
              <SelectItem value="website">Website Redesign</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <span>Due date</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>{task.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-700">
                      M
                    </span>
                    {task.project}
                  </div>
                </TableCell>
                <TableCell>{task.assignee}</TableCell>
                <TableCell className="text-muted-foreground">
                  {task.dueDate}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
                    ${
                      task.status === "Backlog"
                        ? "bg-purple-100 text-purple-700"
                        : task.status === "Todo"
                          ? "bg-red-100 text-red-700"
                          : task.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                    }`}
                  >
                    {task.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        0 of 14 row(s) selected.
      </div>
    </div>
  );
};

export default TasksTable;
