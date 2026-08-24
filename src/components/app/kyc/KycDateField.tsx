"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

const FIRST_YEAR = 1900;

interface KycDateFieldProps {
  /** react-hook-form field — value is an ISO string, or "" when unset. */
  field: any;
  label: string;
  placeholder: string;
}

/**
 * Date of birth / registration date picker with a year jump.
 *
 * Its own component rather than an inline `render` callback: the year and
 * selection state need hooks, and declaring those inside a render prop
 * remounts them on every parent render.
 */
const KycDateField = ({ field, label, placeholder }: KycDateFieldProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    field.value ? new Date(field.value) : undefined,
  );
  const [viewDate, setViewDate] = useState<Date>(
    field.value ? new Date(field.value) : new Date(),
  );

  useEffect(() => {
    if (field.value) {
      const next = new Date(field.value);
      setDate(next);
      setViewDate(next);
    } else {
      setDate(undefined);
      setViewDate(new Date());
    }
  }, [field.value]);

  const thisYear = new Date().getFullYear();

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-12 w-full justify-start rounded-md border-grey-5 px-4 text-left text-sm font-normal",
                date ? "text-grey-1" : "text-grey-4",
              )}
            >
              {date ? format(date, "d MMMM yyyy") : placeholder}
              <CalendarIcon className="ml-auto size-4 text-grey-4" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto rounded-xl border-grey-5 p-0"
          align="start"
        >
          <div className="flex items-center justify-between border-b border-grey-6 bg-white p-3">
            <span className="text-xs font-semibold text-grey-3">Jump to year</span>
            <Select
              value={viewDate.getFullYear().toString()}
              onValueChange={(value) => {
                const next = new Date(viewDate);
                next.setFullYear(parseInt(value, 10));
                setViewDate(next);
              }}
            >
              <SelectTrigger className="h-8 w-[96px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: thisYear - FIRST_YEAR + 1 },
                  (_, i) => thisYear - i,
                ).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selected) => {
              setDate(selected);
              field.onChange(selected ? selected.toISOString() : "");
              if (selected) setOpen(false);
            }}
            onMonthChange={setViewDate}
            month={viewDate}
            disabled={(day) =>
              day > new Date() || day < new Date(`${FIRST_YEAR}-01-01`)
            }
            initialFocus
            fromYear={FIRST_YEAR}
            toYear={thisYear}
            className="rounded-b-xl bg-white"
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};

export default KycDateField;
