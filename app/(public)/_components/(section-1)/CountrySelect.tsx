// CountrySelect.tsx
"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { countries } from "./types";

interface CountrySelectProps {
  field: any;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  disabled?: boolean;
}

export function CountrySelect({
  field,
  searchQuery,
  setSearchQuery,
  disabled,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);

  const filteredCountries = countries.filter((country) =>
    country.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      onValueChange={(value) => {
        field.onChange(value);
        setSearchQuery("");
        setOpen(false);
      }}
      value={field.value}
      disabled={disabled}
    >
      <SelectTrigger className="bg-white border-gray-200 focus:border-red-500 focus:ring-red-500">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="sticky top-0 bg-white px-3 pb-2">
          <Input
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Search country..."
            value={searchQuery}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSearchQuery(e.target.value);
            }}
            autoFocus
          />
        </div>
        <div className="max-h-[200px] overflow-auto">
          {filteredCountries.map((country) => (
            <SelectItem key={country.value} value={country.value}>
              {country.label}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}
