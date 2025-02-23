import React, { useState, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = countries.filter((country) =>
    country.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleInputClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchQuery(e.target.value);
  };

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
      <SelectTrigger className="bg-background border-input hover:bg-accent hover:text-accent-foreground">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent className="bg-background border-input">
        <div
          className="sticky top-0 bg-background px-3 pb-2 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            ref={inputRef}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-background text-foreground placeholder:text-muted-foreground"
            placeholder="Search country..."
            value={searchQuery}
            onClick={handleInputClick}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            type="search"
          />
        </div>
        <div className="max-h-[200px] overflow-auto">
          {filteredCountries.map((country) => (
            <SelectItem
              key={country.value}
              value={country.value}
              className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              {country.label}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}
