"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ProjectOption } from "@/app/(customer)/customer/tasks/types";

interface TaskFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  selectedTasks: string[];
  filteredTasksCount: number;
  currentProject?: ProjectOption;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  assigneeFilter,
  setAssigneeFilter,
  dateFilter,
  setDateFilter,
  selectedTasks,
  filteredTasksCount,
  currentProject,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-statuses">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-assignees">All assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {currentProject?.team.map((member) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.user.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
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
          {selectedTasks.length} of {filteredTasksCount} row(s) selected
        </span>
        <div className="flex items-center space-x-4">
          <span className="text-red-600">{format(new Date(), "MMM d")}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
