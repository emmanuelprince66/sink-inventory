import { cn } from "@/lib/utils";
import * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "file:text-foreground p-3 placeholder:text-grey-4 selection:bg-primary-green-300 selection:text-white",
        "flex w-full min-w-0 rounded-xl bg-white border border-grey-5 text-sm shadow-xs transition-all outline-none",
        "min-h-[100px] focus:border-primary-green-300 focus:outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
