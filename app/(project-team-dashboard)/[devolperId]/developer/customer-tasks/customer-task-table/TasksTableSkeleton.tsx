"use client";

import React from "react";

const TasksTableSkeleton = () => {
  const skeletonRows = Array(5).fill(null);

  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full caption-bottom text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="h-12 px-4 text-left align-middle w-[50px]">
                <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle w-[180px]">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle w-[200px]">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle w-[100px]">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle w-[100px]">
                <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle w-[100px]">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle w-[100px]">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle w-[100px]">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
            </tr>
          </thead>
          <tbody>
            {skeletonRows.map((_, index) => (
              <tr key={index} className="border-b">
                <td className="p-4 align-middle">
                  <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksTableSkeleton;
