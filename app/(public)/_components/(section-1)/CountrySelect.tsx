// CountrySelect.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { countries } from "./types";

interface CountrySelectProps {
  field: any;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  disabled?: boolean;
}

const CountrySelect = ({
  field,
  searchQuery,
  setSearchQuery,
  disabled,
}: CountrySelectProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries
    .filter((country) =>
      country.label.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 5);

  const handleChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);

    const matchingCountry = countries.find(
      (country) => country.label.toLowerCase() === value.toLowerCase(),
    );

    field.onChange(matchingCountry ? matchingCountry.value : value);
  };

  const handleSelectCountry = (country: { value: string; label: string }) => {
    setSearchQuery(country.label);
    field.onChange(country.value);
    setShowSuggestions(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (field.value && !searchQuery) {
      const matchingCountry = countries.find(
        (country) => country.value === field.value,
      );
      if (matchingCountry) {
        setSearchQuery(matchingCountry.label);
      }
    }
  }, [field.value, searchQuery, setSearchQuery]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        type="search"
        value={searchQuery}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Search country..."
        className="dark:bg-black/40 dark:border-white/10 
                  focus:border-accent focus:ring-accent 
                  dark:text-white dark:placeholder-white/60
                  shadow-sm hover:border-accent/50 
                  transition-colors backdrop-blur-sm"
        disabled={disabled}
      />

      {!disabled &&
        showSuggestions &&
        searchQuery &&
        filteredCountries.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background dark:bg-black/40 border dark:border-white/10 rounded-md shadow-lg backdrop-blur-sm">
            <div className="max-h-48 overflow-y-auto py-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.value}
                  onClick={() => handleSelectCountry(country)}
                  className="w-full px-3 py-2 text-left text-foreground
                         dark:text-white dark:hover:bg-white/10 
                         hover:bg-accent/10 hover:text-accent
                         transition-colors"
                  type="button"
                  disabled={disabled}
                >
                  {country.label}
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default CountrySelect;
