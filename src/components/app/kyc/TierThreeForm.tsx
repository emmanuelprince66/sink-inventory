"use client";

import AddressAutocomplete from "@/components/app/AddressAutocomplete";
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
import { useKycHook } from "@/hooks/useKycHook";
import { useState } from "react";
import { CapturedSummary, Notice, SectionHeading } from "./KycUi";

interface Tier3FormProps {
  onComplete: () => void;
  kyc: ReturnType<typeof useKycHook>;
}

/**
 * Tier 3 is the residential address, captured through the same geocoded
 * autocomplete as the order flow.
 *
 * No document upload: upgrade_account takes a single address string and has
 * nowhere to put a utility bill, so asking for one would be asking for a file
 * that goes straight in the bin. Picking a suggestion rather than typing a
 * line is what keeps the address a real, resolvable place.
 */
const Tier3Form = ({ onComplete, kyc }: Tier3FormProps) => {
  const { createIndividualAcctForm, isPending, submitTier, verification } = kyc;
  const [hasCoordinates, setHasCoordinates] = useState(false);

  const handleSubmit = async () => {
    const ok = await submitTier(3);
    if (ok) onComplete();
  };

  return (
    <Form {...createIndividualAcctForm}>
      <form
        className="w-full space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Read from the account payload, not the form: by Tier 3 the numbers
            may have been submitted in an earlier session. */}
        <CapturedSummary
          items={[
            { label: "NIN", value: verification.hasNin ? "Verified" : "—" },
            { label: "BVN", value: verification.hasBvn ? "Verified" : "—" },
            {
              label: "Tier",
              value: verification.tierLabel ?? `Tier ${verification.tier}`,
            },
          ]}
        />

        <div className="space-y-4">
          <SectionHeading
            title="Street address"
            description="Start typing and pick your address from the list — the suggestion is what confirms the city and state we send."
          />

          <FormField
            control={createIndividualAcctForm.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Residential address</FormLabel>
                <FormControl>
                  <AddressAutocomplete
                    multiline
                    rows={2}
                    value={field.value ?? ""}
                    placeholder="Start typing your address..."
                    hasCoordinates={hasCoordinates}
                    // Typing invalidates a previously picked suggestion, so drop
                    // the city/state that came with it until a new one is chosen.
                    onChange={(value) => {
                      field.onChange(value);
                      setHasCoordinates(false);
                      createIndividualAcctForm.setValue("city", "");
                      createIndividualAcctForm.setValue("state", "");
                    }}
                    onSelect={(suggestion) => {
                      field.onChange(suggestion.address || suggestion.label);
                      createIndividualAcctForm.setValue(
                        "city",
                        suggestion.city ?? "",
                      );
                      createIndividualAcctForm.setValue(
                        "state",
                        suggestion.state ?? "",
                      );
                      setHasCoordinates(true);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={createIndividualAcctForm.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      readOnly
                      placeholder="Filled in when you pick an address"
                      className="bg-grey-6/60"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createIndividualAcctForm.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input
                      readOnly
                      placeholder="Filled in when you pick an address"
                      className="bg-grey-6/60"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Notice>
          Your address is checked against the details already on file. You keep
          your Tier 2 limit while that runs.
        </Notice>

        <Button type="submit" disabled={isPending} size="lg" className="w-full">
          {isPending ? <Spinner /> : "Submit Tier 3 verification"}
        </Button>
      </form>
    </Form>
  );
};

export default Tier3Form;
