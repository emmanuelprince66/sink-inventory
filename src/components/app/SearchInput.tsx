// components/ui/search-input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchInputProps extends React.ComponentProps<"input"> {
  containerClassName?: string;
  iconClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, iconClassName, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <input
          ref={ref}
          type="search"
          className={cn(
            "flex w-full rounded-md bg-[#EEF4EF] px-10 text-base shadow-xs transition-all outline-none",
            "h-12 border-0 focus:border-0 focus:outline-none focus:ring-2 focus:ring-[#52b661]",
            "placeholder:text-muted-foreground disabled:opacity-50",
            className
          )}
          {...props}
        />
        <Search
          className={cn(
            "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400",
            iconClassName
          )}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
