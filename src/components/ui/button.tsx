import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

// font-bold matches Figma reference: Convert Mobile Screens to Desktop/src/app/App.tsx,
// DSButton (~line 151) — every variant (primary/secondary/outline/ghost/danger) is font-bold (700)
// with no exceptions. This used to default to font-medium (500) — fixed to match.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-md text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary-green-300 text-white hover:bg-primary-green-300/90 shadow-xs border border-primary-green-300",
        destructive:
          "bg-error-1 text-white hover:bg-error-1/90 focus-visible:ring-error-1/20 dark:focus-visible:ring-error-1/40 dark:bg-error-1/60 border border-error-1",
        outline:
          "border border-grey-5 bg-transparent text-grey-2 shadow-xs hover:bg-grey-6 hover:text-grey-2 dark:border-grey-5 dark:hover:bg-grey-6",
        secondary:
          "bg-secondary-6 text-primary-green-100 hover:bg-secondary-6/80 border border-secondary-6",
        ghost:
          "hover:bg-primary-green-300/10 hover:text-primary-green-300 dark:hover:bg-primary-green-300/20",
        link: "text-primary-green-300 underline-offset-4 hover:underline hover:text-primary-green-300/80",
        success:
          "bg-success-1 text-white hover:bg-success-1/90 border border-success-1 shadow-xs",
        light:
          "bg-secondary-6 text-primary-green-100 hover:bg-secondary-5 border border-secondary-6",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
