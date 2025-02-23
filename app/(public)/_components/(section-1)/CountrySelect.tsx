import React, { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on a mobile device
    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <SelectTrigger className="bg-background border-input hover:bg-accent hover:text-accent-foreground">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="bg-background border-input"
      >
        <div className="sticky top-0 bg-background px-3 pb-2 z-50">
          <Input
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-background text-foreground placeholder:text-muted-foreground"
            placeholder="Search country..."
            value={searchQuery}
            onClick={(e) => {
              e.stopPropagation();
              if (isMobile) {
                e.currentTarget.focus();
              }
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSearchQuery(e.target.value);
            }}
            onFocus={(e) => {
              if (isMobile) {
                e.target.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            autoFocus={!isMobile}
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
