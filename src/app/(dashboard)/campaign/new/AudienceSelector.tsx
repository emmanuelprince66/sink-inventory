"use client";

import { SearchInput } from "@/components/app/SearchInput";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AddCampaignFormValues } from "@/hooks/useCampaignHook";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

type Customer = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
};

type Group = {
  id: string;
  name?: string;
  user_counts?: number;
};

/**
 * Who the campaign goes to. Customers and groups are independent selections —
 * the API takes both lists and unions them — so the counts here are shown per
 * list rather than as one number the merchant would have to reverse-engineer.
 */
const AudienceSelector = ({
  form,
  customers,
  customersLoading,
  groups,
  groupsLoading,
  searchInput,
  onSearchChange,
  sendToAll,
  onSendToAllChange,
  segments,
  segmentIds,
  onSegmentIdsChange,
}: {
  form: UseFormReturn<AddCampaignFormValues>;
  customers: Customer[];
  customersLoading: boolean;
  groups: Group[];
  groupsLoading: boolean;
  searchInput: string;
  onSearchChange: (value: string) => void;
  sendToAll: boolean;
  onSendToAllChange: (value: boolean) => void;
  segments: { id: string; name?: string; customer_count?: number }[];
  segmentIds: string[];
  onSegmentIdsChange: (ids: string[]) => void;
}) => {
  const selectedCustomerIds = form.watch("customer_ids") || [];
  const selectedGroupIds = form.watch("group_ids") || [];

  const toggleSegment = (id: string) =>
    onSegmentIdsChange(
      segmentIds.includes(id)
        ? segmentIds.filter((existing) => existing !== id)
        : [...segmentIds, id],
    );

  // The list endpoint is already searched server-side once the term reaches
  // three characters; this second pass covers the shorter terms, which never
  // reach the API.
  const visibleCustomers = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((customer) =>
      [customer.name, customer.email, customer.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [customers, searchInput]);

  const visibleIds = visibleCustomers.map((customer) => customer.id);

  // "Select all" acts on what is on screen, so a search term narrows what it
  // ticks. Selections made under a previous term are kept rather than wiped.
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedCustomerIds.includes(id));

  const toggleAllCustomers = (checked: boolean) => {
    const kept = selectedCustomerIds.filter((id) => !visibleIds.includes(id));
    form.setValue("customer_ids", checked ? [...kept, ...visibleIds] : kept, {
      shouldValidate: true,
    });
  };

  const toggleCustomer = (customerId: string, checked: boolean) => {
    form.setValue(
      "customer_ids",
      checked
        ? [...selectedCustomerIds, customerId]
        : selectedCustomerIds.filter((id) => id !== customerId),
      { shouldValidate: true },
    );
  };

  const toggleGroup = (groupId: string, checked: boolean) => {
    form.setValue(
      "group_ids",
      checked
        ? [...selectedGroupIds, groupId]
        : selectedGroupIds.filter((id) => id !== groupId),
      { shouldValidate: true },
    );
  };

  const allGroupsSelected =
    groups.length > 0 &&
    groups.every((group) => selectedGroupIds.includes(group.id));

  const toggleAllGroups = (checked: boolean) => {
    form.setValue(
      "group_ids",
      checked ? groups.map((group) => group.id) : [],
      { shouldValidate: true },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="flex items-center gap-2 text-sm font-extrabold text-grey-1">
          <Users className="w-4 h-4 shrink-0 text-grey-3" />
          Target Audience
        </p>
        <span className="text-xs font-bold text-grey-3">
          {selectedCustomerIds.length} / {customers.length} selected
        </span>
      </div>

      {/* The shortcut, first and on its own: it overrides everything below,
          so offering it after the pickers invites someone to choose carefully
          and then have that selection quietly ignored. */}
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
          sendToAll
            ? "border-primary-green-300 bg-primary-green-500"
            : "border-grey-5 bg-white",
        )}
      >
        <Checkbox
          checked={sendToAll}
          onCheckedChange={(checked) => onSendToAllChange(checked === true)}
          className="mt-0.5"
        />
        <span className="min-w-0">
          <span className="block text-sm font-bold text-grey-1">
            Send to all customers
          </span>
          <span className="mt-0.5 block text-xs text-grey-3">
            Everyone on file who can be reached on this channel. Anything
            picked below is ignored.
          </span>
        </span>
      </label>

      {/* Everything below selects a subset, which "everyone" has already
          settled — dimmed rather than unmounted so the selection survives
          unticking the box. */}
      <div
        className={cn(
          "space-y-3 transition-opacity",
          sendToAll && "pointer-events-none opacity-40",
        )}
      >
        {segments.length > 0 && (
          <div className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-5">
            <p className="text-sm font-extrabold text-grey-1">Segments</p>
            <p className="mt-0.5 text-xs text-grey-3">
              Membership is worked out when the campaign sends, so a segment
              always reaches whoever qualifies at that moment.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {segments.map((segment) => {
                const selected = segmentIds.includes(segment.id);
                return (
                  <button
                    key={segment.id}
                    type="button"
                    onClick={() => toggleSegment(segment.id)}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                      selected
                        ? "border-primary-green-300 bg-secondary-6 text-primary-green-300"
                        : "border-grey-5 text-grey-2 hover:border-primary-green-300/50",
                    )}
                  >
                    {segment.name ?? "Segment"}
                    {segment.customer_count != null && (
                      <span className="ml-1 font-medium text-grey-4">
                        {segment.customer_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      <div className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="text-sm font-extrabold text-grey-1">Customers</p>

          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-bold text-primary-green-300">
            <Checkbox
              checked={allVisibleSelected}
              disabled={visibleCustomers.length === 0}
              onCheckedChange={(checked) => toggleAllCustomers(!!checked)}
            />
            Select All ({visibleCustomers.length})
          </label>
        </div>

        <div className="mt-3">
          <SearchInput
            placeholder="Search by customer name..."
            value={searchInput}
            onValueChange={onSearchChange}
            className="bg-white"
          />
        </div>

        {customersLoading ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-10 rounded-xl bg-grey-6" />
            ))}
          </div>
        ) : visibleCustomers.length > 0 ? (
          // Capped height with its own scroll: an account with a thousand
          // customers must not push the send button off the page.
          <div className="mt-4 grid max-h-64 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
            {visibleCustomers.map((customer) => {
              const checked = selectedCustomerIds.includes(customer.id);

              return (
                <label
                  key={customer.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                    checked
                      ? "border-primary-green-300 bg-secondary-6/50"
                      : "border-grey-5 hover:border-primary-green-300/40",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      toggleCustomer(customer.id, !!value)
                    }
                  />
                  <span className="min-w-0 truncate text-grey-2">
                    {customer.name || customer.email || customer.phone}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-grey-4">
            {searchInput
              ? `No customers found matching "${searchInput}"`
              : "No customers available"}
          </p>
        )}
      </div>

      {/* Groups collapse by default — most sends target individual customers,
          and an expanded second list would bury the send button. */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="groups"
          className="rounded-2xl border border-grey-5 bg-white px-4 sm:px-5"
        >
          <AccordionTrigger className="cursor-pointer py-4 hover:no-underline">
            <span className="flex items-center gap-2 text-sm font-extrabold text-grey-1">
              <Users className="w-4 h-4 text-grey-3" />
              Groups
              {selectedGroupIds.length > 0 && (
                <span className="rounded-full bg-secondary-6 px-2 py-0.5 text-[10px] font-bold text-primary-green-300">
                  {selectedGroupIds.length} selected
                </span>
              )}
            </span>
          </AccordionTrigger>

          <AccordionContent className="pb-5">
            {groupsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-10 rounded-xl bg-grey-6" />
                ))}
              </div>
            ) : groups.length > 0 ? (
              <>
                <label className="mb-3 flex cursor-pointer items-center gap-2 text-xs font-bold text-primary-green-300">
                  <Checkbox
                    checked={allGroupsSelected}
                    onCheckedChange={(checked) => toggleAllGroups(!!checked)}
                  />
                  Select All ({groups.length})
                </label>

                <div className="grid max-h-52 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
                  {groups.map((group) => {
                    const checked = selectedGroupIds.includes(group.id);

                    return (
                      <label
                        key={group.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                          checked
                            ? "border-primary-green-300 bg-secondary-6/50"
                            : "border-grey-5 hover:border-primary-green-300/40",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleGroup(group.id, !!value)
                          }
                        />
                        <span className="min-w-0 truncate text-grey-2">
                          {group.name}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-grey-4">
                          {group.user_counts ?? 0}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-grey-4">
                No customer groups available
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      </div>
    </div>
  );
};

export default AudienceSelector;
