import React, { useState, useRef, useCallback } from "react";
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

  // Prevent select closing when input is interacted with
  const handleInputInteraction = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

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
      <SelectContent
        className="bg-background border-input"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div
          className="sticky top-0 bg-background px-3 pb-2 z-50"
          onPointerDown={handleInputInteraction}
          onMouseDown={handleInputInteraction}
          onClick={handleInputInteraction}
          onTouchStart={handleInputInteraction}
        >
          <Input
            ref={inputRef}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-background text-foreground placeholder:text-muted-foreground"
            placeholder="Search country..."
            value={searchQuery}
            onPointerDown={handleInputInteraction}
            onMouseDown={handleInputInteraction}
            onClick={handleInputInteraction}
            onTouchStart={handleInputInteraction}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              handleInputInteraction(e);
              setSearchQuery(e.target.value);
            }}
            onFocus={handleInputInteraction}
            onBlur={handleInputInteraction}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            type="text"
            inputMode="text"
          />
        </div>
        <div
          className="max-h-[200px] overflow-auto"
          onTouchStart={handleInputInteraction}
        >
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
