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
import { useKycHook } from "@/hooks/useKycHook";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

const IndividualAcct = () => {
  const { createIndividualAcctForm, isPending, onSubmitIndividualAcct } =
    useKycHook();
  return (
    <div className="w-full flex justify-center items-start flex-col gap-1">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Individual Account Verification
      </h2>

      <Form {...createIndividualAcctForm}>
        <form
          className="w-full space-y-5"
          onSubmit={createIndividualAcctForm.handleSubmit(
            onSubmitIndividualAcct
          )}
        >
          <FormField
            control={createIndividualAcctForm.control}
            name="first_name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={createIndividualAcctForm.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Improved Date of Birth Field */}
          <FormField
            control={createIndividualAcctForm.control}
            name="dob"
            render={({ field }) => {
              const [date, setDate] = useState<Date | undefined>(
                field.value ? new Date(field.value) : undefined
              );
              const [viewDate, setViewDate] = useState<Date>(
                field.value ? new Date(field.value) : new Date()
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
                  <FormLabel>Date Of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal border border-primary-green-300",
                            !date && "text-muted-foreground"
                          )}
                        >
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick your date of birth</span>
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
                              (_, i) => 1900 + i
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
                            selectedDate ? selectedDate.toISOString() : ""
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
            control={createIndividualAcctForm.control}
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

export default IndividualAcct;
