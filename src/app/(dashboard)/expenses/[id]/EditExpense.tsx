"use client";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useExpensesHook } from "@/hooks/useExpensesHook";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PopoverContent } from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";

const EditExpense = () => {
  const {
    ExpenseData,
    ExpenseDataLoading,
    CategoriesData,
    CategoriesDataLoading,
    editForm: form,
    editExpenseLoading,
    onSubmitEditForm: onSubmit,
  } = useExpensesHook({});

  console.log("form", form.getValues());

  console.log("ExpenseData", ExpenseData);

  return (
    <>
      {ExpenseDataLoading ||
      !ExpenseData ||
      CategoriesDataLoading ||
      !CategoriesData ||
      (!form.formState.isDirty && !form.watch("category_id")) ? (
        <div className="w-1/2 mx-auto my-4 pb-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div className="flex flex-col gap-6 items-start">
              <Skeleton className="h-4 w-full bg-[#eef4ef]" />
              <Skeleton className="h-6 w-full bg-[#eef4ef]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-full flex-col w-full items-center justify-center">
          <div className="flex  max-w-xl  mb-3 w-full justify-start">
            <h2 className="text-lg font-bold text-[#1e1e1e] mt-6">
              Edit Expense
            </h2>
          </div>
          <div className="w-full max-w-xl bg-white p-4 rounded shadow-md">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Bank Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel> Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter expense name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Account Number */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => {
                    // Debugging
                    const selectedCategory = CategoriesData?.data?.find(
                      (c: any) => c.id === field.value
                    );

                    return (
                      <FormItem className="flex-1 w-full bg-white">
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full border border-green-300">
                              <SelectValue
                                placeholder={
                                  selectedCategory?.name || "Select a category"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white cursor-pointer border border-green-100">
                            {CategoriesData?.data?.map((category: any) => (
                              <SelectItem
                                key={category.id}
                                value={category.id}
                                className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
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
                                <span>Pick a due date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 z-999"
                          align="start"
                        >
                          <Calendar
                            className="bg-white"
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
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
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter note"
                          className="min-h-[100px] "
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  disabled={editExpenseLoading}
                  type="submit"
                  className="w-full h-[48px] mt-6"
                >
                  {editExpenseLoading ? <Spinner /> : "Edit"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditExpense;
