import { cn } from "@/lib/utils";
import * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "file:text-foreground p-2 placeholder:text-muted-foreground selection:bg-none selection:text-primary-foreground",
        "flex w-full min-w-0 rounded-md bg-[#EEF4EF] px-4 text-base shadow-xs transition-all outline-none",
        // "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        // "min-h-[100px] border-0", // Keep border-0 here for initial state
        // "focus:ring-2 focus:ring-[#52b661]",
        // // Added: Explicitly remove all focus-related borders/outlines
        // "focus:border-transparent focus:outline-none focus:ring-offset-0",
        // "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
