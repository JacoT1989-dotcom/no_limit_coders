"use client";

import { isThisWeek, isThisMonth } from "date-fns";
import { Priority } from "../../types";

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
    default:
      return true;
  }
};

// Style helper functions
export const getStatusColor = (status: string) => {
  switch (status) {
    case "TODO":
      return "bg-red-100 text-red-700";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-700";
    case "REVIEW":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700";
    case "LOW":
      return "bg-green-100 text-green-700";
  }
};
