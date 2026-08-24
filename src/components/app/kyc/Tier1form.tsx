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
import { useKycHook } from "@/hooks/useKycHook";
import KycDateField from "./KycDateField";
import { Notice, SectionHeading } from "./KycUi";

interface Tier1FormProps {
  onComplete: () => void;
  kyc: ReturnType<typeof useKycHook>;
}

/**
 * Tier 1 opens the account on a single identifier: NIN *or* BVN. Whichever one
 * is missing here is collected at Tier 2, so both inputs are shown and the
 * hook accepts either.
 *
 * The hook is owned by IndividualTierFlow and passed in, so all three tiers
 * share one form instance — without that, a cumulative submit at Tier 3 would
 * have no access to the identifiers captured here.
 */
const Tier1Form = ({ onComplete, kyc }: Tier1FormProps) => {
  const { createIndividualAcctForm, isPending, submitTier } = kyc;

  const handleSubmit = async () => {
    const ok = await submitTier(1);
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
        <div className="space-y-4">
          <SectionHeading title="Personal details" />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={createIndividualAcctForm.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
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
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={createIndividualAcctForm.control}
            name="dob"
            render={({ field }) => (
              <KycDateField
                field={field}
                label="Date of birth"
                placeholder="Pick your date of birth"
              />
            )}
          />
        </div>

        <div className="space-y-4">
          <SectionHeading
            title="Identity"
            description="Provide either number — you only need one to open the account."
          />

          <div className="grid gap-4 sm:grid-cols-2">
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
                      placeholder="11-digit NIN"
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

            <FormField
              control={createIndividualAcctForm.control}
              name="bvn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Verification Number (BVN)</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="11-digit BVN"
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
          </div>
        </div>

        <Notice title="After Tier 1">
          You can start using the account straight away, or continue to Tier 2
          for a higher daily limit.
        </Notice>

        <Button type="submit" disabled={isPending} size="lg" className="w-full">
          {isPending ? <Spinner /> : "Submit Tier 1 verification"}
        </Button>
      </form>
    </Form>
  );
};

export default Tier1Form;
