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
import {
  IDENTITY_LABELS,
  IDENTITY_SHORT,
  useKycHook,
} from "@/hooks/useKycHook";
import { CheckCircle2 } from "lucide-react";
import { Notice, SectionHeading } from "./KycUi";

interface Tier2FormProps {
  onComplete: () => void;
  kyc: ReturnType<typeof useKycHook>;
}

/**
 * Tier 2 completes the pair. Which number it asks for is read off the account
 * payload — verified BVN means this asks for the NIN, and the other way round
 * — so nothing already on file is requested twice, even in a fresh session
 * where the Tier 1 form state is long gone.
 */
const Tier2Form = ({ onComplete, kyc }: Tier2FormProps) => {
  const {
    createIndividualAcctForm,
    isPending,
    submitTier,
    verification,
    tier2Identity,
  } = kyc;

  const onFile = tier2Identity === "nin" ? "bvn" : "nin";
  const onFileVerified =
    onFile === "nin" ? verification.hasNin : verification.hasBvn;

  const handleSubmit = async () => {
    const ok = await submitTier(2);
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
        {/* What Tier 1 already cleared — shown as a state, not as a field to
            re-enter. The number itself is never returned to the browser. */}
        <div className="flex items-center gap-3 rounded-xl border border-secondary-3 bg-secondary-6/50 p-4">
          <CheckCircle2
            size={18}
            className="shrink-0 text-primary-green-300"
          />
          <div className="text-sm">
            <p className="font-bold text-primary-green-100">
              {IDENTITY_SHORT[onFile]} verified
            </p>
            <p className="text-grey-2">
              {onFileVerified
                ? `Your ${IDENTITY_SHORT[onFile]} cleared at Tier 1. Add your ${IDENTITY_SHORT[tier2Identity]} to finish Tier 2.`
                : `Submitted at Tier 1. Add your ${IDENTITY_SHORT[tier2Identity]} to finish Tier 2.`}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading
            title={`Add your ${IDENTITY_SHORT[tier2Identity]}`}
            description="This is the only thing Tier 2 still needs."
          />

          <FormField
            control={createIndividualAcctForm.control}
            name={tier2Identity}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{IDENTITY_LABELS[tier2Identity]}</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    maxLength={11}
                    placeholder={`Enter your 11-digit ${IDENTITY_SHORT[tier2Identity]}`}
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

        <Notice>
          Both numbers are checked against government databases. Neither is ever
          shown in full anywhere in the app.
        </Notice>

        <Button type="submit" disabled={isPending} size="lg" className="w-full">
          {isPending ? <Spinner /> : "Submit Tier 2 verification"}
        </Button>
      </form>
    </Form>
  );
};

export default Tier2Form;
