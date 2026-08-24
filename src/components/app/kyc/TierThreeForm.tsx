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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKycHook } from "@/hooks/useKycHook";
import { useState } from "react";
import FileUploadField from "./FileUploadField";
import { CapturedSummary, maskId, Notice, SectionHeading } from "./KycUi";
import { PROOF_OF_ADDRESS_TYPES } from "./tiers";

interface Tier3FormProps {
  onComplete: () => void;
  kyc: ReturnType<typeof useKycHook>;
}

/**
 * Tier 3 is proof of address: the street address itself, captured through the
 * same geocoded autocomplete as the order flow, plus a utility bill or bank
 * statement backing it. Picking a suggestion is what fills city and state,
 * which the provider requires.
 */
const Tier3Form = ({ onComplete, kyc }: Tier3FormProps) => {
  const {
    createIndividualAcctForm,
    isPending,
    submitTier,
    proofOfAddressFile,
    setProofOfAddressFile,
    proofOfAddressError,
    setProofOfAddressError,
  } = kyc;
  const [hasCoordinates, setHasCoordinates] = useState(false);

  const nin = createIndividualAcctForm.watch("nin");
  const bvn = createIndividualAcctForm.watch("bvn");
  const documentType = createIndividualAcctForm.watch("proof_of_address_type");

  const documentLabel =
    PROOF_OF_ADDRESS_TYPES.find((type) => type.value === documentType)?.label ??
    "document";

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
        <CapturedSummary
          items={[
            { label: "NIN", value: maskId(nin) },
            { label: "BVN", value: maskId(bvn) },
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

        <div className="space-y-4">
          <SectionHeading
            title="Proof of address"
            description="A utility bill or bank statement in your name, issued within the last 3 months."
          />

          <FormField
            control={createIndividualAcctForm.control}
            name="proof_of_address_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12! min-h-0 w-full rounded-md border-grey-5">
                      <SelectValue placeholder="Select the document you are uploading" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROOF_OF_ADDRESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FileUploadField
            id="individual-proof-of-address"
            label={documentType ? `Upload ${documentLabel}` : "Upload document"}
            hint="The name and address on the document must match the details above."
            value={proofOfAddressFile}
            onChange={(file) => {
              setProofOfAddressFile(file);
              setProofOfAddressError(null);
            }}
            error={proofOfAddressError ?? undefined}
          />
        </div>

        <Notice>
          Documents are reviewed manually and usually clear within one business
          day. You keep your Tier 2 limit while the review is running.
        </Notice>

        <Button type="submit" disabled={isPending} size="lg" className="w-full">
          {isPending ? <Spinner /> : "Submit Tier 3 verification"}
        </Button>
      </form>
    </Form>
  );
};

export default Tier3Form;
