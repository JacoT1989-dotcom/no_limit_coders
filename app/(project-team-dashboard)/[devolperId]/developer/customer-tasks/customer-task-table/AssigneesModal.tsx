import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectTeamMember, Task } from "@/app/(customer)/customer/tasks/types";

interface AssigneesModalProps {
  task: Task;
}

const AssigneesModal = ({ task }: AssigneesModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label={`${task.assignees.length} assignees`}
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs">{task.assignees.length}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Task Assignees
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-4">
            {task.assignees.map((assignee: ProjectTeamMember) => (
              <div
                key={assignee.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${assignee.user.displayName}`}
                    alt={assignee.user.displayName}
                  />
                  <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {assignee.user.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {assignee.user.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {assignee.user.email}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {assignee.role.toLowerCase()}
                </span>
              </div>
            ))}
            {task.assignees.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No assignees for this task
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AssigneesModal;
