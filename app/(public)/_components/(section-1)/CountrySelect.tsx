import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { countries } from "./types";

interface CountrySearchProps {
  field: any;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function CountrySearch({
  field,
  searchQuery,
  setSearchQuery,
}: CountrySearchProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search query
  const filteredCountries = countries
    .filter((country) =>
      country.label.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 5); // Limit to 5 suggestions

  const handleChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
    field.onChange(value);
  };

  const handleSelectCountry = (country: { value: string; label: string }) => {
    setSearchQuery(country.label);
    field.onChange(country.value);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
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

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        type="search"
        value={searchQuery}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Search country..."
        className="bg-background w-full"
      />

      {showSuggestions && searchQuery && filteredCountries.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <div className="max-h-[200px] overflow-y-auto py-1">
            {filteredCountries.map((country) => (
              <button
                key={country.value}
                onClick={() => handleSelectCountry(country)}
                className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                type="button"
              >
                {country.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CountrySearch;
