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
import { CapturedSummary, maskId, Notice, SectionHeading } from "./KycUi";

interface Tier2FormProps {
  onComplete: () => void;
  kyc: ReturnType<typeof useKycHook>;
}

/**
 * Tier 2 requires both identifiers. Tier 1 accepted either one, so whichever
 * was left blank is the one being asked for here — the other is shown masked
 * in the recap. The submit is cumulative, so both go up together.
 */
const Tier2Form = ({ onComplete, kyc }: Tier2FormProps) => {
  const { createIndividualAcctForm, isPending, submitTier } = kyc;
  const nin = createIndividualAcctForm.watch("nin");
  const bvn = createIndividualAcctForm.watch("bvn");

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
        <CapturedSummary
          items={[
            {
              label: "Name",
              value:
                [
                  createIndividualAcctForm.watch("first_name"),
                  createIndividualAcctForm.watch("last_name"),
                ]
                  .filter(Boolean)
                  .join(" ") || "—",
            },
            { label: "NIN", value: maskId(nin) },
            { label: "BVN", value: maskId(bvn) },
          ]}
        />

        <div className="space-y-4">
          <SectionHeading
            title="Both identity numbers"
            description="Tier 2 needs your NIN and BVN on file. Fill in whichever is still missing."
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

        <Notice>
          Both numbers are checked against government databases. They are never
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
