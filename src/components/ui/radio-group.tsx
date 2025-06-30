"use client";

import { cn } from "@/lib/utils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import * as React from "react";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupPrimitive.Item
        data-slot="radio-group-item"
        className={cn(
          "border-input text-primary cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:border-[#52B661] data-[state=checked]:bg-[#52B661]/10", // Added checked styles
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="relative flex items-center  cursor-pointer justify-center"
        >
          <CircleIcon className="fill-[#52B661] cursor-pointer absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {children && <label className="text-sm">{children}</label>}
    </div>
  );
}

export { RadioGroup, RadioGroupItem };
