import { useKycHook } from "@/hooks/useKycHook";

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
                  <Input placeholder="Enter First Name" {...field} />
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
                  <Input placeholder="Enter Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expiry Date */}
          <FormField
            control={createCorporateAcctForm.control}
            name="reg_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Reg Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal border border-primary-green-300",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      className="bg-white"
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString() : "")
                      }
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
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
