"use client";

import { isThisWeek, isThisMonth } from "date-fns";
import { Priority } from "../../types";
import { TaskStatus } from "@prisma/client";

// Helper function to check if a task is within the selected due date range
export const isWithinDueDate = (
  dueDate: Date | null,
  createdAt: Date,
  selectedRange: string | undefined,
) => {
  if (!selectedRange || selectedRange === "all") return true;

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const dueDateStart = dueDate
    ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
    : null;
  const createdAtStart = new Date(
    createdAt.getFullYear(),
    createdAt.getMonth(),
    createdAt.getDate(),
  );

  switch (selectedRange.toLowerCase()) {
    case "today":
      return (
        dueDateStart?.getTime() === todayStart.getTime() ||
        createdAtStart.getTime() === todayStart.getTime()
      );
    case "week":
      return (
        (dueDate && isThisWeek(dueDate, { weekStartsOn: 1 })) ||
        isThisWeek(createdAt, { weekStartsOn: 1 })
      );
    case "month":
      return (dueDate && isThisMonth(dueDate)) || isThisMonth(createdAt);
    case "next-month":
      if (!dueDate) return false;
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const nextMonthEnd = new Date(
        today.getFullYear(),
        today.getMonth() + 2,
        0,
      );
      return dueDate >= nextMonth && dueDate <= nextMonthEnd;
    default:
      return true;
  }
};

// Helper function to convert column state to task status
export const mapColumnStateToTaskStatus = (columnState: string): TaskStatus => {
  const statusMap: { [key: string]: TaskStatus } = {
    todo: TaskStatus.TODO,
    backlog: TaskStatus.REVIEW,
    "in-progress": TaskStatus.IN_PROGRESS,
    done: TaskStatus.COMPLETED,
  };
  return statusMap[columnState.toLowerCase()] || TaskStatus.TODO;
};

// Style helper functions
export const getStatusColor = (status: TaskStatus) => {
  const statusColors = {
    [TaskStatus.TODO]: "bg-red-100 text-red-700",
    [TaskStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-700",
    [TaskStatus.REVIEW]: "bg-blue-100 text-blue-700",
    [TaskStatus.COMPLETED]: "bg-green-100 text-green-700",
  };
  return statusColors[status] || "bg-gray-100 text-gray-700";
};

export const getPriorityColor = (priority: Priority) => {
  const priorityColors = {
    URGENT: "bg-red-100 text-red-700",
    HIGH: "bg-orange-100 text-orange-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-green-100 text-green-700",
  };
  return priorityColors[priority] || priorityColors.MEDIUM;
};

// Helper function to check if task matches selected status
export const matchesTaskStatus = (
  taskStatus: TaskStatus,
  selectedStatus: string,
): boolean => {
  if (!selectedStatus || selectedStatus === "all") return true;

  const mappedStatus = mapColumnStateToTaskStatus(selectedStatus);
  return taskStatus === mappedStatus;
};
