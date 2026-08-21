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
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

interface Tier3FormProps {
  onComplete: () => void;
  kyc: ReturnType<typeof useKycHook>;
}

// Tier 3 captures proof of address using the same geocoded autocomplete as the
// order flow. Only the resolved address string and state are sent — picking a
// suggestion is what fills `state`, which the provider requires.
const Tier3Form = ({ onComplete, kyc }: Tier3FormProps) => {
  const { createIndividualAcctForm, isPending, submitTier } = kyc;
  const [hasCoordinates, setHasCoordinates] = useState(false);

  const nin = createIndividualAcctForm.watch("nin");
  const bvn = createIndividualAcctForm.watch("bvn");

  const handleSubmit = async () => {
    const ok = await submitTier(3);
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
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/60 p-3">
          <ShieldCheck className="text-green-600 shrink-0" size={20} />
          <div className="text-sm">
            <p className="font-medium text-gray-800">Verified so far</p>
            <p className="text-gray-600">
              NIN {nin ? `••••${nin.slice(-4)}` : "—"} · BVN{" "}
              {bvn ? `••••${bvn.slice(-4)}` : "—"}
            </p>
          </div>
        </div>

        <FormField
          control={createIndividualAcctForm.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Residential Address</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  multiline
                  rows={2}
                  value={field.value ?? ""}
                  placeholder="Start typing your address..."
                  hasCoordinates={hasCoordinates}
                  // Typing invalidates a previously picked suggestion, so drop
                  // the state that came with it until a new one is chosen.
                  onChange={(value) => {
                    field.onChange(value);
                    setHasCoordinates(false);
                    createIndividualAcctForm.setValue("state", "");
                  }}
                  onSelect={(suggestion) => {
                    field.onChange(suggestion.address || suggestion.label);
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
                  className="bg-gray-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="mt-4 w-full">
          {isPending ? <Spinner /> : "Submit Tier 3 Verification"}
        </Button>
      </form>
    </Form>
  );
};

export default Tier3Form;
