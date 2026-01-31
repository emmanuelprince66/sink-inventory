"use client";
import { useKycHook } from "@/hooks/useKycHook";
import { useEffect, useState } from "react";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

const CorporateAcct = () => {
  const { createCorporateAcctForm, isPending, onSubmitCorporateAcct } =
    useKycHook();
  return (
    <div className="w-full flex justify-center items-start flex-col gap-1">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Corporate Account Verification
      </h2>

      <Form {...createCorporateAcctForm}>
        <form
          className="w-full space-y-5"
          onSubmit={createCorporateAcctForm.handleSubmit(onSubmitCorporateAcct)}
        >
          <FormField
            control={createCorporateAcctForm.control}
            name="business_name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={createCorporateAcctForm.control}
            name="registration_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your registration number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expiry Date */}
          <FormField
            control={createCorporateAcctForm.control}
            name="reg_date"
            render={({ field }) => {
              const [date, setDate] = useState<Date | undefined>(
                field.value ? new Date(field.value) : undefined,
              );
              const [viewDate, setViewDate] = useState<Date>(
                field.value ? new Date(field.value) : new Date(),
              );

              useEffect(() => {
                if (field.value) {
                  const newDate = new Date(field.value);
                  setDate(newDate);
                  setViewDate(newDate);
                } else {
                  setDate(undefined);
                  setViewDate(new Date());
                }
              }, [field.value]);

              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Reg Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal border border-primary-green-300",
                            !date && "text-muted-foreground",
                          )}
                        >
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick registration date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border border-gray-200"
                      align="start"
                    >
                      <div className="p-3 border-b z-10 bg-white flex items-center justify-between">
                        <Select
                          value={viewDate.getFullYear().toString()}
                          onValueChange={(value) => {
                            const year = parseInt(value);
                            const newViewDate = new Date(viewDate);
                            newViewDate.setFullYear(year);
                            setViewDate(newViewDate);
                          }}
                        >
                          <SelectTrigger className="w-[90px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              { length: new Date().getFullYear() - 1900 + 1 },
                              (_, i) => 1900 + i,
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
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          field.onChange(
                            selectedDate ? selectedDate.toISOString() : "",
                          );
                        }}
                        onMonthChange={setViewDate}
                        month={viewDate}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        className="rounded-md border border-gray-200 bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={createCorporateAcctForm.control}
            name="bvn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BVN</FormLabel>
                <FormControl>
                  <Input placeholder="Enter BVN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="mt-4 w-full">
            {isPending ? <Spinner /> : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CorporateAcct;
