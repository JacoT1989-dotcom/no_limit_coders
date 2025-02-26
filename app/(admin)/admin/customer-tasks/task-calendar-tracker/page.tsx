import React from "react";
import TasksCalendar from "./TaskCalendar";

const CustomerTasksPage = () => {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-red-600 dark:text-red-500">
        Task Calendar
      </h1>
      <TasksCalendar />
    </div>
  );
};

export default CustomerTasksPage;
