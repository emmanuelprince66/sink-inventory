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
import { ShieldCheck } from "lucide-react";

interface Tier2FormProps {
  onComplete: () => void;
  kyc: ReturnType<typeof useKycHook>;
}

// Tier 2 adds the BVN on top of the NIN captured at tier 1. The submit is
// cumulative, so both are sent together.
const Tier2Form = ({ onComplete, kyc }: Tier2FormProps) => {
  const { createIndividualAcctForm, isPending, submitTier } = kyc;
  const nin = createIndividualAcctForm.watch("nin");

  const handleSubmit = async () => {
    const ok = await submitTier(2);
    if (ok) onComplete();
  };

  return (
    <Form {...createIndividualAcctForm}>
      <form
        className="w-full space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Read-only recap so the user can see what tier 2 will re-submit. */}
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/60 p-3">
          <ShieldCheck className="text-green-600 shrink-0" size={20} />
          <div className="text-sm">
            <p className="font-medium text-gray-800">NIN from Tier 1</p>
            <p className="text-gray-600">
              {nin ? `••••••• ${nin.slice(-4)}` : "Not provided yet"}
            </p>
          </div>
        </div>

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
                  placeholder="Enter 11-digit BVN"
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

        <Button type="submit" disabled={isPending} className="mt-4 w-full">
          {isPending ? <Spinner /> : "Submit Tier 2 Verification"}
        </Button>
      </form>
    </Form>
  );
};

export default Tier2Form;
