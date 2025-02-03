"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface TasksCalendarProps {
  status?: string;
  assignee?: string;
  project?: string;
  dueDate?: string;
}

const TasksCalendar = ({
  status,
  assignee,
  project,
  dueDate,
}: TasksCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock tasks data
  const tasks = [
    {
      id: 1,
      title: "Conduct usability testing",
      project: "Mobile App Development",
      assignee: "John",
      dueDate: new Date("2024-10-15"),
      status: "Backlog",
    },
    {
      id: 2,
      title: "Implement offline mode",
      project: "Mobile App Development",
      assignee: "Antonio",
      dueDate: new Date("2024-10-14"),
      status: "Todo",
    },
    // Add more tasks as needed
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isSameDay(task.dueDate, date));
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-card-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
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

        {monthDays.map((day) => {
          const dayTasks = getTasksForDate(day);
          return (
            <div
              key={day.toISOString()}
              className="aspect-square red-gradient rounded-lg p-[1px]"
            >
              <div
                className={`
                h-full rounded-lg bg-card p-2
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

                <div className="space-y-2 overflow-auto max-h-[calc(100%-2rem)]">
                  {dayTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="hover-lift transition-all duration-300 bg-background/50 backdrop-blur-sm border-border"
                    >
                      <CardHeader className="p-2">
                        <CardTitle className="text-xs font-medium truncate">
                          {task.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/10 text-accent text-xs">
                            M
                          </span>
                          <span className="truncate">{task.project}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-2 pt-0">
                        <div className="flex items-center justify-between">
                          <Avatar className="h-4 w-4">
                            <AvatarImage
                              src={`/avatars/${task.assignee.toLowerCase()}.png`}
                            />
                            <AvatarFallback className="text-[10px] bg-accent/10 text-accent">
                              {task.assignee[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`
                            inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium
                            ${getStatusColor(task.status)}
                          `}
                          >
                            {task.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksCalendar;
