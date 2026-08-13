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

interface Tier1FormProps {
  onComplete: () => void;
  kyc: ReturnType<typeof useKycHook>;
}

// Tier 1 establishes identity with the NIN. BVN comes at tier 2 and proof of
// address at tier 3. The hook is owned by IndividualTierFlow and passed in, so
// all three tiers share one form instance — without that, a cumulative submit
// at tier 3 would have no access to the NIN captured here.
const Tier1Form = ({ onComplete, kyc }: Tier1FormProps) => {
  const { createIndividualAcctForm, isPending, submitTier } = kyc;

  const handleSubmit = async () => {
    const ok = await submitTier(1);
    if (ok) onComplete();
  };

  return (
    <Form {...createIndividualAcctForm}>
      <form
        className="w-full space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
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

        <FormField
          control={createIndividualAcctForm.control}
          name="dob"
          render={({ field }) => <DobField field={field} />}
        />

        <FormField
          control={createIndividualAcctForm.control}
          name="nin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>National Identity Number (NIN)</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="Enter 11-digit NIN"
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(/\D/g, ""))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="mt-4 w-full">
          {isPending ? <Spinner /> : "Submit Tier 1 Verification"}
        </Button>
      </form>
    </Form>
  );
};

// Extracted so the hooks it needs are not declared inside a render callback.
const DobField = ({ field }: { field: any }) => {
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
      <FormLabel>Date Of Birth</FormLabel>
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
              {date ? format(date, "PPP") : <span>Pick your date of birth</span>}
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
              field.onChange(selectedDate ? selectedDate.toISOString() : "");
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
};

export default Tier1Form;
