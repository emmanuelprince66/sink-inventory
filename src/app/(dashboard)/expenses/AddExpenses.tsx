"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PopoverContent } from "@radix-ui/react-popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { useFieldArray, useWatch } from "react-hook-form";
import { ExpenseKindChooser, type ExpenseKind } from "@/components/app/EntryType";
import { useExpensePermissions } from "@/hooks/useExpensePermissions";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatToNaira } from "@/utils/formatMoney";
const AddExpenses = ({
  closeModal,
  handleOpenNotSubscribeModal,
}: {
  closeModal: () => void;
  handleOpenNotSubscribeModal?: () => void;
}) => {
  const {
    form,
    onSubmit,
    createExpensesLoading,
    CategoriesData,
    CategoriesDataLoading,
  } = useExpensesHook({ closeModal, handleOpenNotSubscribeModal });
  const router = useRouter();
  const { canTransfer } = useExpensePermissions();
  // Step one picks what this is; only a manual expense or purchase continues to the form here.
  const [kind, setKind] = useState<ExpenseKind | null>(null);
  const pick = (next: ExpenseKind) => {
    if (next === "WALLET_TRANSFER") {
      closeModal();
      router.push("/expenses/transfer");
      return;
    }
    form.setValue("entry_type", next);
    setKind(next);
  };
  const lines = useFieldArray({ control: form.control, name: "items" });
  const entryType = useWatch({ control: form.control, name: "entry_type" });
  const items = useWatch({ control: form.control, name: "items" });
  const several = lines.fields.length > 1;
  const [openItems, setOpenItems] = useState<string[]>([]);
  const previousItemIds = useRef<string[]>([]);
  useEffect(() => {
    const itemIds = lines.fields.map((line) => line.id);
    const addedItemIds = itemIds.filter(
      (id) => !previousItemIds.current.includes(id),
    );
    if (previousItemIds.current.length === 0 && itemIds.length > 0) {
      setOpenItems([itemIds[0]]);
    } else if (addedItemIds.length > 0) {
      setOpenItems(addedItemIds);
    }
    setOpenItems((open) => open.filter((id) => itemIds.includes(id)));
    previousItemIds.current = itemIds;
  }, [lines.fields]);
  const total = (items ?? []).reduce(
    (sum, line) => sum + (Number(line?.amount) || 0),
    0,
  );
  return (
    <>
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full max-w-xl bg-white p-4 rounded shadow-md">
          {!kind ? (
            <ExpenseKindChooser
              onPick={pick}
              transferBlockedReason={
                canTransfer
                  ? undefined
                  : "You don't have permission to move money. Ask the business owner."
              }
            />
          ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Which manual entry this is, and the way back to the three choices. */}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-grey-6 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-grey-1">
                    {kind === "PURCHASE" ? "Log Purchase" : "Log Expense"}
                  </p>
                  <p className="text-xs text-grey-3">
                    {kind === "PURCHASE"
                      ? "Spent to buy goods to sell. Recorded only: no money moves."
                      : "Spent to run the business. Recorded only: no money moves."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setKind(null)}
                  className="shrink-0 text-xs font-bold text-primary-green-300 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              <Accordion
                type="multiple"
                value={openItems}
                onValueChange={setOpenItems}
                className="space-y-3"
              >
                {lines.fields.map((line, index) => {
                  const name = items?.[index]?.name?.trim();
                  const amount = Number(items?.[index]?.amount) || 0;
                  const categoryName = CategoriesData?.data?.find(
                    (category: any) =>
                      category.id === items?.[index]?.category_id,
                  )?.name;
                  return (
                    <AccordionItem
                      key={line.id}
                      value={line.id}
                      className="rounded-xl border border-grey-5 px-3"
                    >
                      <div className="flex items-center gap-2">
                        <AccordionTrigger className="min-w-0 py-3 hover:no-underline">
                          <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate font-bold text-grey-1">
                                {name || `Item ${index + 1}`}
                              </span>
                              {categoryName && (
                                <span className="truncate text-xs font-normal text-grey-3">
                                  {categoryName}
                                </span>
                              )}
                            </span>
                            {amount > 0 && (
                              <span className="shrink-0 text-xs font-semibold text-grey-3">
                                {formatToNaira(amount)}
                              </span>
                            )}
                          </span>
                        </AccordionTrigger>
                        {several && (
                          <button
                            type="button"
                            aria-label={`Remove item ${index + 1}`}
                            onClick={() => lines.remove(index)}
                            className="rounded-md p-1 text-grey-3 hover:bg-error-2 hover:text-error-1 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <AccordionContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {entryType === "PURCHASE"
                                  ? "Item or supplier"
                                  : "Name"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    entryType === "PURCHASE"
                                      ? "e.g. Flour, 20 bags"
                                      : "Enter expense name"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.amount`}
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
                          name={`items.${index}.category_id`}
                          render={({ field }) => (
                            <FormItem className="flex-1 w-full bg-white">
                              <FormLabel>
                                {entryType === "TRANSFER"
                                  ? "Category (Optional)"
                                  : "Category"}
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full border border-green-300">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white cursor-pointer border border-green-100">
                                  {!CategoriesDataLoading
                                    ? CategoriesData?.data?.map(
                                        (category: any) => (
                                          <SelectItem
                                            key={category.id}
                                            value={category.id}
                                            className="hover:bg-primary-green-300 hover:text-white cursor-pointer"
                                          >
                                            {category.name}
                                          </SelectItem>
                                        ),
                                      )
                                    : "Loading..."}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              {/* Several items at once, e.g. fuel and data on the same day.
                  Each becomes its own entry under its own category. */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    lines.append({ name: "", category_id: "", amount: "" })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary-green-300/60 px-3 py-2 text-xs font-bold text-primary-green-300 hover:bg-secondary-6 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add another {entryType === "PURCHASE" ? "purchase" : "expense"}
                </button>
                {several && (
                  <p className="text-sm font-bold text-grey-1">
                    Total {formatToNaira(total)}
                  </p>
                )}
              </div>

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
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0); // Set to start of today
                            return date < today; // Disable if date is before today
                          }}
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
                disabled={createExpensesLoading}
                type="submit"
                className="w-full h-[48px] mt-6"
              >
                {createExpensesLoading ? (
                  <Spinner />
                ) : several ? (
                  `Add ${lines.fields.length} items`
                ) : (
                  `Add ${entryType === "PURCHASE" ? "Purchase" : entryType === "TRANSFER" ? "Transfer" : "Expense"}`
                )}
              </Button>
            </form>
          </Form>
          )}
        </div>
      </div>
    </>
  );
};

export default AddExpenses;
