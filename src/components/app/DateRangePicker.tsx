// components/DateRangePicker.tsx
"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
}: DatePickerWithRangeProps) {
  const currentYear = new Date().getFullYear();
  const formatCompact = (d: Date) =>
    format(d, d.getFullYear() === currentYear ? "MMM d" : "MMM d, yy");

  const label = date?.from
    ? date.to
      ? `${formatCompact(date.from)} – ${formatCompact(date.to)}`
      : formatCompact(date.from)
    : "Date range";

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            title={
              date?.from
                ? `${format(date.from, "LLL dd, y")}${
                    date.to ? ` – ${format(date.to, "LLL dd, y")}` : ""
                  }`
                : undefined
            }
            className={cn(
              "w-full justify-start text-left font-normal bg-white hover:bg-secondary-6 border-grey-5",
              !date && "text-grey-3",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-primary-green-300" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white border-grey-5 shadow-lg"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            className="bg-white rounded-md"
            modifiersStyles={{
              selected: {
                backgroundColor: "#329661",
                color: "white",
                borderRadius: "6px",
              },
              range_start: {
                backgroundColor: "#329661",
                color: "white",
                borderRadius: "6px",
              },
              range_end: {
                backgroundColor: "#329661",
                color: "white",
                borderRadius: "6px",
              },
              range_middle: {
                backgroundColor: "rgba(50, 150, 97, 0.2)",
                color: "#329661",
              },
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
