// components/searchable-select.tsx
"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  options: Option[];
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchTerm?: string;
  isLoading?: boolean;
  disabled?: boolean;
};

export function SearchableSelect({
  options,
  placeholder = "Select...",
  value = "",
  onValueChange,
  onSearchChange,
  searchTerm: externalSearchTerm = "",
  isLoading = false,
  disabled = false,
}: SearchableSelectProps) {
  const [internalSearchTerm, setInternalSearchTerm] =
    useState(externalSearchTerm);
  const [isOpen, setIsOpen] = useState(false);

  // Sync internal search term with external prop
  useEffect(() => {
    setInternalSearchTerm(externalSearchTerm);
  }, [externalSearchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setInternalSearchTerm(newSearchTerm);
    onSearchChange?.(newSearchTerm);
  };

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(internalSearchTerm.toLowerCase())
    );
  }, [options, internalSearchTerm]);

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Search input */}
        <div className="p-2 sticky top-0 bg-white z-10">
          <Input
            placeholder="Search..."
            value={internalSearchTerm}
            onChange={handleSearchChange}
            className="mb-2"
            autoFocus
          />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-2 text-sm text-gray-500 text-center">
            Loading...
          </div>
        )}

        {/* Filtered options */}
        {!isLoading &&
          filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}

        {/* No results */}
        {!isLoading && filteredOptions.length === 0 && (
          <div className="p-2 text-sm text-gray-500 text-center">
            {internalSearchTerm ? "No results found" : "Start typing to search"}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
