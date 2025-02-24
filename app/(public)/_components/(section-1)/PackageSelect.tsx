// PackageSelect.tsx
"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackageSelection } from "@prisma/client";

interface PackageSelectProps {
  field: any;
  disabled?: boolean;
}

export function PackageSelect({ field, disabled }: PackageSelectProps) {
  return (
    <Select
      onValueChange={field.onChange}
      defaultValue={field.value}
      disabled={disabled}
    >
      <SelectTrigger className=" border-gray-200 focus:border-red-500 focus:ring-red-500">
        <SelectValue placeholder="Select a package" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={PackageSelection.NONE}>None</SelectItem>
        <SelectItem value={PackageSelection.STARTUPTEAM}>
          Startup Team
        </SelectItem>
        <SelectItem value={PackageSelection.PROFESSIONALTEAM}>
          Professional Team
        </SelectItem>
        <SelectItem value={PackageSelection.ENTERPRISE}>Enterprise</SelectItem>
      </SelectContent>
    </Select>
  );
}
