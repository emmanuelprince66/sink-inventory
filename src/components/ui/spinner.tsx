"use client";

import React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin inline-block rounded-full border-2 border-solid border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-[2px]",
        default: "h-5 w-5 border-[2px]",
        lg: "h-6 w-6 border-[3px]",
        xl: "h-8 w-8 border-[3px]",
        xxl: "h-15 w-15 border-[5px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {
  color?: string; // Optional custom color class
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, color = "text-primary", ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="status"
        className={cn(
          spinnerVariants({ size, className }),
          color // Apply color class
        )}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </span>
    );
  }
);

Spinner.displayName = "Spinner";
