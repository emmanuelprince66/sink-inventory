"use client";

import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignHook } from "@/hooks/useCampaignHook";
import { useEffect, useMemo, useState } from "react";

const EditGroup = ({
  closeModal,
  editGroupData,
}: {
  closeModal: () => void;
  editGroupData: any;
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [selectAllCustomers, setSelectAllCustomers] = useState(false);

  const {
    CustomersLoading,
    CreateGroupLoading,
    onSubmitAddGroupForm,
    CustomersData,
    addGroupForm: form,
  } = useCampaignHook({ closeModal, searchInput, editGroupData });

  const watchedCustomerIds = form.watch("customer_ids") || [];

  const filteredCustomers = useMemo(() => {
    if (!CustomersData?.data || !searchInput.trim()) {
      return CustomersData?.data || [];
    }

    return CustomersData.data.filter((customer: any) => {
      const searchableText = [customer.name, customer.email, customer.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchInput.toLowerCase());
    });
  }, [CustomersData?.data, searchInput]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSelectAllCustomers = (checked: boolean) => {
    setSelectAllCustomers(checked);
    if (checked && filteredCustomers.length > 0) {
      const allFilteredCustomerIds = filteredCustomers.map(
        (customer: any) => customer.id
      );
      // Merge with existing non-filtered selections
      const existingIds = form.getValues("customer_ids") || [];
      const allCustomerIds =
        CustomersData?.data?.map((customer: any) => customer.id) || [];
      const nonFilteredSelectedIds = existingIds.filter(
        (id: string) =>
          !allCustomerIds.includes(id) ||
          !filteredCustomers.some((customer: any) => customer.id === id)
      );

      form.setValue("customer_ids", [
        ...nonFilteredSelectedIds,
        ...allFilteredCustomerIds,
      ]);
    } else {
      // Remove only filtered customer IDs
      const existingIds = form.getValues("customer_ids") || [];
      const filteredIds = filteredCustomers.map((customer: any) => customer.id);
      const remainingIds = existingIds.filter(
        (id: string) => !filteredIds.includes(id)
      );
      form.setValue("customer_ids", remainingIds);
    }
  };

  const handleCustomerSelection = (customerId: string, checked: boolean) => {
    const currentIds = form.getValues("customer_ids") || [];
    if (checked) {
      form.setValue("customer_ids", [...currentIds, customerId]);
    } else {
      form.setValue(
        "customer_ids",
        currentIds.filter((id) => id !== customerId)
      );
      setSelectAllCustomers(false);
    }
  };

  useEffect(() => {
    if (filteredCustomers.length > 0) {
      const allFilteredIds = filteredCustomers.map(
        (customer: any) => customer.id
      );
      setSelectAllCustomers(
        allFilteredIds.every((id: any) => watchedCustomerIds.includes(id))
      );
    }
  }, [watchedCustomerIds, filteredCustomers]);

  return (
    <div className="w-full h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitAddGroupForm)}
          className="space-y-6"
        >
          {/* Campaign Basic Info */}
          <div className="bg-white rounded-lg  space-y-6">
            <div className="space-y-4 w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Accordion type="multiple" className="w-full ">
                {/* Customers Accordion */}
                <AccordionItem
                  value="customers"
                  className="rounded-lg bg-primary-green-200 p-2"
                >
                  <AccordionTrigger className="hover:no-underline cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium"> Customers</span>
                      {watchedCustomerIds.length > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {watchedCustomerIds.length} selected
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="w-full  pt-2">
                    {/* Select All Customers */}
                    <div className="flex items-center  gap-2">
                      <Checkbox
                        className="cursor-pointer"
                        id="select-all-customers"
                        checked={selectAllCustomers}
                        onCheckedChange={handleSelectAllCustomers}
                      />
                      <label
                        htmlFor="select-all-customers"
                        className="text-sm pt-[2px] font-medium font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Select All Customers ({filteredCustomers.length})
                      </label>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <div className="w-full px-1 mb-4 mt-4">
                        <SearchInput
                          className="bg-white"
                          placeholder="Search by customer name ..."
                          value={searchInput}
                          onValueChange={handleSearchChange}
                        />
                        {searchInput.length > 0 && searchInput.length < 3 && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            Type at least 3 characters to search
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customers List */}
                    {CustomersLoading || !CustomersData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 space-x-2 p-2"
                          >
                            <Skeleton className="h-4 w-4 rounded bg-white" />
                            <Skeleton className="h-4 w-full rounded bg-white" />
                          </div>
                        ))}
                      </div>
                    ) : filteredCustomers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                        {filteredCustomers.map((customer: any) => (
                          <div
                            key={customer.id}
                            className="flex items-center gap-2 space-x-2 p-2 hover:bg-gray-100 rounded"
                          >
                            <Checkbox
                              className="cursor-pointer "
                              id={`customer-${customer.id}`}
                              checked={watchedCustomerIds.includes(customer.id)}
                              onCheckedChange={(checked) =>
                                handleCustomerSelection(
                                  customer.id,
                                  checked as boolean
                                )
                              }
                            />
                            <label
                              htmlFor={`customer-${customer.id}`}
                              className="text-sm  pt-[2px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate flex-1 cursor-pointer"
                            >
                              {customer.name ||
                                customer.email ||
                                customer.phone}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : CustomersData?.data && CustomersData.data.length > 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No customers found matching "{searchInput}"
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No customers available
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={CreateGroupLoading}
              className="min-w-[120px] items-center flex"
            >
              {CreateGroupLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  updating...
                </>
              ) : (
                "Update Group"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditGroup;
