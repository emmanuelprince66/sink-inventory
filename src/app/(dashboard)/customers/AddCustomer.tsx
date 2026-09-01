import { CircleAlert, UserCheck } from "lucide-react";

import AddressAutocomplete from "@/components/app/AddressAutocomplete";
import { Spinner } from "@/components/app/Spinner";
import SegmentTag from "@/components/SegmentTag";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerHook } from "@/hooks/useCustomerHook";
import { useCustomerPhoneLookup } from "@/hooks/useCustomerPhoneLookup";

const AddCustomer = ({
  closeOpenCustomerModal,
  handleOpenNotSubscribeModal,
  onUseExisting,
}: {
  closeOpenCustomerModal: any;
  handleOpenNotSubscribeModal?: () => void;
  /**
   * Given where a caller can put an existing customer straight to work — the
   * till puts them on the sale. Without it the match is still shown and its
   * details can still be pulled in; there is just nowhere to hand them off to.
   */
  onUseExisting?: (customer: any) => void;
}) => {
  const {
    form,
    onSubmit,
    createCustomerLoading,
    stateList,
    cityList,
    handleStateChange,
    applyAddressSuggestion,
    clearAddressCoordinates,
  } = useCustomerHook({
    closeModal: closeOpenCustomerModal,
    handleOpenNotSubscribeModal,
  });
  const selectedState = form.watch("state");
  const hasAddressCoordinates = Boolean(
    form.watch("latitude") && form.watch("longitude"),
  );

  // The number is what the attendant asks for first, so it is also the first
  // chance to notice this is not a new customer at all.
  const { matches, isSearching } = useCustomerPhoneLookup(form.watch("phone"));

  /**
   * Copies an existing customer's details onto the form.
   *
   * Only ever on request. An automatic fill would fight whoever is typing, and
   * a phone prefix can match several people — which one it filled from would
   * be anyone's guess.
   */
  const fillFrom = (customer: any) => {
    const address =
      customer.addresses?.find((a: any) => a.is_default) ??
      customer.addresses?.[0];
    // The form holds the ISO code, the API sends the state's name.
    const matchedState = stateList.find(
      (s) => s.name.toLowerCase() === String(address?.state ?? "").toLowerCase(),
    );

    form.setValue("name", customer.name ?? "", { shouldValidate: true });
    form.setValue("phone", customer.phone ?? "", { shouldValidate: true });
    form.setValue("email", customer.email ?? "");
    if (address?.address) form.setValue("address", address.address);
    if (matchedState) form.setValue("state", matchedState.isoCode);
    if (address?.city) form.setValue("city", address.city);
    // Whatever coordinates the old address was saved with are not on this
    // payload, so the autocomplete has to resolve them again if it is edited.
    clearAddressCoordinates();
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* First Name and Last Name in same row */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Customer Name...." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number...." {...field} />
                </FormControl>
                {isSearching && (
                  <p className="text-[11px] text-grey-4">
                    Checking for an existing customer…
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sits directly under the number that produced it, above the rest of
              the form — the point is to be seen before the attendant fills in
              details for a record that already exists. */}
          {matches.length > 0 && (
            <div className="rounded-xl border border-info-1/30 bg-info-2 p-3">
              <p className="flex items-center gap-2 text-xs font-bold text-info-1">
                <UserCheck className="h-4 w-4 shrink-0" />
                {matches.length === 1
                  ? "This number is already on file"
                  : `${matches.length} customers have this number`}
              </p>

              <div className="mt-2 space-y-2">
                {matches.map((customer: any) => (
                  <div
                    key={customer.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-grey-1">
                        {customer.name}
                      </p>
                      <p className="truncate text-[11px] text-grey-3">
                        {customer.phone}
                        {customer.email ? ` · ${customer.email}` : ""}
                      </p>
                      {/* What the attendant would lose by starting a second
                          record: the standing they have already built up. */}
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {customer.tier_name && (
                          <span className="rounded-full bg-grey-6 px-2 py-0.5 text-[10px] font-bold text-grey-2">
                            {customer.tier_name}
                          </span>
                        )}
                        <SegmentTag
                          name={customer.segment}
                          segmentType={customer.segment_type}
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 text-[11px]"
                        onClick={() => fillFrom(customer)}
                      >
                        Fill in details
                      </Button>
                      {onUseExisting && (
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 text-[11px]"
                          onClick={() => onUseExisting(customer)}
                        >
                          Use this customer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email...." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address search sits above State/City on purpose: picking a
              suggestion fills both of them and pins the coordinates saved on
              the customer, so asking for them first makes the user do work
              the search would have done. The selects below are for confirming
              or correcting what the search resolved.

              Autocomplete rather than free text so the saved address is one a
              geocoder can actually resolve — that's what stops Shipbubble
              rejecting it later at rate time. */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <AddressAutocomplete
                    multiline
                    rows={2}
                    value={field.value || ""}
                    placeholder="Start typing an address..."
                    hasCoordinates={hasAddressCoordinates}
                    onChange={(v) => {
                      field.onChange(v);
                      if (hasAddressCoordinates) clearAddressCoordinates();
                    }}
                    onSelect={applyAddressSuggestion}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* State and City — same NG state/city flow as the order delivery
              address (useOrderDeliveryHook) */}
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>State</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleStateChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stateList.map((s) => (
                        <SelectItem key={s.isoCode} value={s.isoCode}>
                          {s.name}
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
              name="city"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>City</FormLabel>
                  {selectedState && cityList.length === 0 ? (
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                  ) : (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedState}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              selectedState
                                ? "Select city"
                                : "Select state first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cityList.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-[48px] "
            disabled={createCustomerLoading}
          >
            {createCustomerLoading ? <Spinner /> : "Save"}
          </Button>
        </form>
      </Form>

      <div className="flex w-full border border-info-1/30 mt-4 rounded-xl items-start gap-3 bg-info-2 text-info-1 p-3">
        <CircleAlert className="h-5 w-5 shrink-0 mt-0.5" />

        <p className="text-info-1 text-sm font-medium">
          You should ask your customers for permission before you subscribe them
          to your marketing emails or SMS
        </p>
      </div>
    </div>
  );
};

export default AddCustomer;
