"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { ProjectOption, Task } from "../types";
import DayTasksDialog from "./DayTasksDialog";

interface TasksCalendarProps {
  status?: string;
  assignee?: string;
  project?: string;
  dueDate?: string;
  projects: ProjectOption[];
}

const TasksCalendar = ({
  status,
  assignee,
  project,
  dueDate,
  projects,
}: TasksCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"created" | "due">("created");

  // Gradient backgrounds array
  const gradientBackgrounds = [
    "bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/70 dark:to-pink-900/70",
    "bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/70 dark:to-amber-900/70",
    "bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/70 dark:to-red-900/70",
    "bg-gradient-to-br from-pink-100 to-fuchsia-100 dark:from-pink-900/70 dark:to-fuchsia-900/70",
    "bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/70 dark:to-orange-900/70",
    "bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/70 dark:to-pink-900/70",
    "bg-gradient-to-br from-amber-100 to-red-100 dark:from-amber-900/70 dark:to-red-900/70",
    "bg-gradient-to-br from-fuchsia-100 to-rose-100 dark:from-fuchsia-900/70 dark:to-rose-900/70",
  ];

  // Calculate calendar dates using useMemo
  const calendarDates = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    return {
      monthStart: start,
      monthEnd: end,
      monthDays: days,
    };
  }, [currentMonth]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!project || project === "all") {
        setTasks([]);
        return;
      }

      setLoading(true);
      try {
        const selectedProject = projects.find((p) => p.id === project);
        if (selectedProject) {
          setTasks(selectedProject.tasks);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [project, projects]);

  const getGradientForDate = (date: Date) => {
    // Use the date's day number to select a gradient
    const dayNumber = date.getDate();
    return gradientBackgrounds[dayNumber % gradientBackgrounds.length];
  };

  const getTasksForDate = (date: Date) => {
    const createdTasks = tasks.filter((task) => {
      const taskCreatedAt =
        task.createdAt instanceof Date
          ? task.createdAt
          : new Date(task.createdAt);
      return isSameDay(taskCreatedAt, date);
    });

    const dueTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDueDate =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      return isSameDay(taskDueDate, date);
    });

    return {
      createdTasks,
      dueTasks,
    };
  };

  const openDayDialog = (date: Date, type: "created" | "due") => {
    setSelectedDay(date);
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const renderDayContent = (date: Date) => {
    const { createdTasks, dueTasks } = getTasksForDate(date);

    return (
      <div className="space-y-2">
        {createdTasks.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-red-600/80 dark:text-red-400/80 truncate">
              You created:
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openDayDialog(date, "created");
              }}
              className="w-full text-xs py-1.5 h-auto 
                         bg-white/80 dark:bg-red-950/30
                         hover:bg-red-100 dark:hover:bg-red-900/50 
                         text-red-700 dark:text-red-300 
                         hover:text-red-800 dark:hover:text-red-200
                         font-medium 
                         border border-red-200 dark:border-white
                         hover:border-red-300 dark:hover:border-red-700
                         transition-all duration-200
                         shadow-sm"
            >
              {createdTasks.length}{" "}
              {createdTasks.length === 1 ? "Task" : "Tasks"}
            </Button>
          </div>
        )}
        {dueTasks.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-red-600/80 dark:text-red-400/80 truncate">
              Due date:
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openDayDialog(date, "due");
              }}
              className="w-full text-xs py-1.5 h-auto 
                         bg-white/80 dark:bg-red-950/30
                         hover:bg-red-100 dark:hover:bg-red-900/50 
                         text-red-700 dark:text-red-300 
                         hover:text-red-800 dark:hover:text-red-200
                         font-medium 
                         border border-red-200 dark:border-white
                         hover:border-red-300 dark:hover:border-red-700
                         transition-all duration-200
                         shadow-sm"
            >
              {dueTasks.length} {dueTasks.length === 1 ? "Task" : "Tasks"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (!project || project === "all") {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground border-2 border-red-100 dark:border-red-900 rounded-lg">
        Please select a project to view tasks
      </div>
    );
  }

  const { monthStart, monthDays } = calendarDates;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-500">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="border-2 border-red-600 dark:border-gray-600 text-red-600 dark:text-white hover:bg-red-50 dark:hover:bg-red-950 rounded"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="border-2 border-red-600 dark:border-gray-600 text-red-600 dark:text-white hover:bg-red-50 dark:hover:bg-red-950 rounded h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="border-2 border-red-600 dark:border-gray-600 text-red-600 dark:text-white hover:bg-red-50 dark:hover:bg-red-950 rounded h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-red-600/70 dark:text-white py-2"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {monthDays.map((day) => {
          const { createdTasks, dueTasks } = getTasksForDate(day);
          const hasAnyTasks = createdTasks.length > 0 || dueTasks.length > 0;
          const gradientClass = hasAnyTasks
            ? getGradientForDate(day)
            : "bg-white dark:bg-black";

          return (
            <div
              key={day.toISOString()}
              className="aspect-square border-[1px] border-red-100 dark:border-gray-600 rounded-lg overflow-hidden"
            >
              <div
                className={`
                  h-full p-2 
                  ${gradientClass}
                  hover:bg-opacity-90 dark:hover:bg-opacity-90
                  transition-colors duration-200
                  ${isToday(day) ? "ring-2 ring-red-600 dark:ring-red-500" : ""}
                `}
              >
                <div className="text-right mb-2">
                  <span
                    className={`
                      inline-block rounded w-6 h-6 text-center leading-6 text-sm font-medium
                      ${
                        isToday(day)
                          ? "bg-red-600 dark:bg-red-500 text-white"
                          : "text-red-600 dark:text-red-500"
                      }
                    `}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                {renderDayContent(day)}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <DayTasksDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          tasks={
            dialogType === "created"
              ? getTasksForDate(selectedDay).createdTasks
              : getTasksForDate(selectedDay).dueTasks
          }
          date={selectedDay}
          project={projects.find((p) => p.id === project)}
        />
      )}
    </div>
  );
};

export default TasksCalendar;
