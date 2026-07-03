// components/app/DatePicker.tsx
"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  /** Local-timezone date string in "YYYY-MM-DD" format. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

// Matches the local-timezone-safe formatting already used in useOrdersHook —
// toISOString() shifts to UTC and silently changes the calendar day for
// users east of GMT.
const toDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDateString = (value: string) => {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  id,
}: DatePickerProps) {
  const selected = parseDateString(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-white hover:bg-secondary-6 border-grey-5",
            !selected && "text-grey-4",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary-green-300 shrink-0" />
          {selected ? (
            format(selected, "LLL dd, y")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white border-grey-5 shadow-lg"
        align="start"
      >
        <Calendar
          initialFocus
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => date && onChange(toDateString(date))}
          className="bg-white rounded-md"
          modifiersStyles={{
            selected: {
              backgroundColor: "#329661",
              color: "white",
              borderRadius: "6px",
            },
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
