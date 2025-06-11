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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCampaignHook } from "@/hooks/useCampaignHook";
import { MessageSquare, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const AddCampaign = ({ closeModal }: { closeModal: () => void }) => {
  const [searchInput, setSearchInput] = useState("");

  const {
    form,
    onSubmit,
    messageChannelOptions,
    CampaignGroupData,
    CampaignGroupLoading,
    CustomersData,
    CreateCampaignLoading,
    CustomersLoading,
  } = useCampaignHook({ closeModal, searchInput });

  const [selectAllCustomers, setSelectAllCustomers] = useState(false);
  const [selectAllGroups, setSelectAllGroups] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [remainingChars, setRemainingChars] = useState(150);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  // Watch form values
  const watchedCustomerIds = form.watch("customer_ids") || [];
  const watchedGroupIds = form.watch("group_ids") || [];
  const watchedMessage = form.watch("message") || "";

  // Filter customers based on search term
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

  useEffect(() => {
    const currentLength = watchedMessage.length; // Get the length of the string (character count)
    setCharCount(currentLength);
    setRemainingChars(150 - currentLength); // Calculate remaining characters
  }, [watchedMessage]);

  // Handle select all customers
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

  // Handle individual customer selection
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

  // Handle select all groups
  const handleSelectAllGroups = (checked: boolean) => {
    setSelectAllGroups(checked);
    if (checked && CampaignGroupData?.data) {
      const allGroupIds = CampaignGroupData.data.map((group: any) => group.id);
      form.setValue("group_ids", allGroupIds);
    } else {
      form.setValue("group_ids", []);
    }
  };

  // Handle individual group selection
  const handleGroupSelection = (groupId: string, checked: boolean) => {
    const currentIds = form.getValues("group_ids") || [];
    if (checked) {
      form.setValue("group_ids", [...currentIds, groupId]);
    } else {
      form.setValue(
        "group_ids",
        currentIds.filter((id) => id !== groupId)
      );
      setSelectAllGroups(false);
    }
  };

  // Update select all states when individual items change
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

  useEffect(() => {
    if (CampaignGroupData?.data) {
      const allGroupIds = CampaignGroupData.data.map((group: any) => group.id);
      setSelectAllGroups(
        allGroupIds.length > 0 &&
          allGroupIds.every((id: any) => watchedGroupIds.includes(id))
      );
    }
  }, [watchedGroupIds, CampaignGroupData]);

  // if (CampaignGroupLoading || CustomersLoading) {
  //   return (
  //     <div className="flex items-center justify-center p-8">
  //       <Spinner />
  //     </div>
  //   );
  // }

  return (
    <div className="w-full h-full  ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Campaign Basic Info */}
          <div className="bg-white rounded-lg  space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Campaign Details</h3>
            </div>

            <div className="space-y-4 w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full ">
                        <SelectTrigger className="border border-green-400">
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-gray-200">
                        {messageChannelOptions.map((option) => (
                          <SelectItem
                            className="cursor-pointer "
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign title.." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your campaign message..."
                        className="min-h-[120px]"
                        {...field}
                        maxLength={150} // Add maxLength attribute for native HTML limiting
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      {/* Display character count instead of word count */}
                      <span>Characters: {charCount}/150</span>
                      <span
                        className={remainingChars < 0 ? "text-red-500" : ""}
                      >
                        Remaining: {remainingChars}
                      </span>
                    </div>
                    {remainingChars < 0 && (
                      <p className="text-red-500 text-sm">
                        Message exceeds 150 character limit
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-white rounded-lg ">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Target Audience</h3>
            </div>

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
                            {customer.name || customer.email || customer.phone}
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

              {/* Groups Accordion */}
              <AccordionItem
                value="groups"
                className="rounded-lg bg-primary-green-200 p-2"
              >
                <AccordionTrigger className="hover:no-underline cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Groups</span>
                    {watchedGroupIds.length > 0 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {watchedGroupIds.length} selected
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {/* Select All Groups */}
                  <div className="flex items-center gap-2 space-x-2">
                    <Checkbox
                      className="cursor-pointer"
                      id="select-all-groups"
                      checked={selectAllGroups}
                      onCheckedChange={handleSelectAllGroups}
                    />
                    <label
                      htmlFor="select-all-groups"
                      className="text-sm font-bold pt-[2px] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Select All Groups ({CampaignGroupData?.data?.length || 0})
                    </label>
                  </div>

                  {/* Groups List */}
                  {CampaignGroupLoading || !CampaignGroupData ? (
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 space-x-1 p-1"
                        >
                          <Skeleton className="h-4 w-4 rounded" />
                          <div className="flex-1 pt-[2px] space-y-1 ">
                            <Skeleton className="h-4 w-3/4 rounded bg-white" />
                            <Skeleton className="h-3 w-1/2 rounded bg-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : CampaignGroupData?.data &&
                    CampaignGroupData.data.length > 0 ? (
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {CampaignGroupData.data.map((group: any) => (
                        <div
                          key={group.id}
                          className="flex items-center gap-2 space-x-1 p-1 hover:bg-gray-100 rounded-lg"
                        >
                          <Checkbox
                            className="cursor-pointer"
                            checked={watchedGroupIds.includes(group.id)}
                            onCheckedChange={(checked) =>
                              handleGroupSelection(group.id, checked as boolean)
                            }
                          />
                          <div className="flex-1 pt-[2px]">
                            <span className="font-medium">{group.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({group.user_counts} customers)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No customer groups available
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={CreateCampaignLoading || remainingChars < 0}
              className="min-w-[120px]"
            >
              {CreateCampaignLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                "Send Campaign"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddCampaign;
