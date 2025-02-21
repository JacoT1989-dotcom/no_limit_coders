"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

const TasksTableSkeleton = () => {
  // Generate 5 skeleton rows
  const skeletonRows = Array(5).fill(null);

  return (
    <div className="w-full p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
            </TableHead>
            <TableHead className="min-w-[200px]">
              <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            </TableHead>
            <TableHead className="min-w-[200px]">
              <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            </TableHead>
            <TableHead>
              <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            </TableHead>
            <TableHead>
              <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            </TableHead>
            <TableHead>
              <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skeletonRows.map((_, index) => (
            <TableRow key={index} className="group">
              <TableCell>
                <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
                  <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                </div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TasksTableSkeleton;
