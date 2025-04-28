// components/ui/search-input.tsx
import * as React from "react";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface SearchInputProps extends React.ComponentProps<"input"> {
  containerClassName?: string;
  iconClassName?: string;
  clearButtonClassName?: string;
  value: string | number;
  onValueChange: (value: string) => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      iconClassName,
      clearButtonClassName,
      value,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const handleClear = () => {
      onValueChange("");
    };

    return (
      <div className={cn("relative w-full", containerClassName)}>
        <input
          ref={ref}
          type="search"
          value={value}
          className={cn(
            "flex w-full rounded-md bg-[#EEF4EF] px-10 py-3 text-base shadow-xs transition-all outline-none",
            "h-12 border-0 focus:border-0 focus:outline-none focus:ring-2 focus:ring-[#52b661]",
            "placeholder:text-muted-foreground disabled:opacity-50",
            className
          )}
          onChange={(e) => onValueChange(e.target.value)}
          {...props}
        />
        <Search
          className={cn(
            "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400",
            iconClassName
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 hover:text-gray-600",
              clearButtonClassName
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
