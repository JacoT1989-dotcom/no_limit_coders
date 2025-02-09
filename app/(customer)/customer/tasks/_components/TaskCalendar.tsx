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
          console.log("Selected Project:", {
            id: selectedProject.id,
            name: selectedProject.name,
            taskCount: selectedProject.tasks.length,
          });

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

  const getTasksForDate = (date: Date) => {
    // Filter tasks created on this day
    const createdTasks = tasks.filter((task) => {
      const taskCreatedAt =
        task.createdAt instanceof Date
          ? task.createdAt
          : new Date(task.createdAt);

      return isSameDay(taskCreatedAt, date);
    });

    // Filter tasks due on this day
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
      <div className="space-y-1">
        {createdTasks.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openDayDialog(date, "created");
            }}
            className="w-full text-xs py-1 h-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            View {createdTasks.length} Created
          </Button>
        )}
        {dueTasks.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openDayDialog(date, "due");
            }}
            className="w-full text-xs py-1 h-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            View {dueTasks.length} Due
          </Button>
        )}
      </div>
    );
  };

  if (!project || project === "all") {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Please select a project to view tasks
      </div>
    );
  }

  const { monthStart, monthDays } = calendarDates;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-card-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {monthDays.map((day) => (
          <div
            key={day.toISOString()}
            className="aspect-square red-gradient rounded-lg p-[1px]"
          >
            <div
              className={`
                h-full rounded-lg bg-card p-2 
                hover:bg-slate-100 dark:hover:bg-slate-800/50
                transition-colors
                ${isToday(day) ? "ring-2 ring-accent" : ""}
              `}
            >
              <div className="text-right mb-2">
                <span
                  className={`
                    inline-block rounded-full w-6 h-6 text-center leading-6 text-sm
                    ${isToday(day) ? "bg-accent text-white" : "text-muted-foreground"}
                  `}
                >
                  {format(day, "d")}
                </span>
              </div>
              {renderDayContent(day)}
            </div>
          </div>
        ))}
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
