"use client";

import React from "react";

interface TaskDialogProps {
  title: string;
  description: string;
}

const TaskDialog = ({ title, description }: TaskDialogProps) => {
  return (
    <div className="relative group">
      <div className="cursor-pointer hover:text-primary">
        {`${title.slice(0, 3)}...`}
      </div>
      <div className="absolute left-0 bottom-full z-50 bg-popover text-popover-foreground p-4 rounded-md shadow-md w-[300px] hidden group-hover:block">
        <div className="text-sm font-medium mb-2 whitespace-pre-wrap break-words">
          {title}
        </div>
        {description && (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDialog;
