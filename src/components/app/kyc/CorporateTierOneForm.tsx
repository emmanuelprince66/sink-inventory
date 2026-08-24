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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKycHook } from "@/hooks/useKycHook";
import KycDateField from "./KycDateField";
import { Notice, SectionHeading } from "./KycUi";
import { NIGERIAN_STATES } from "./tiers";

interface CorporateTier1FormProps {
  onComplete: () => void;
  kyc: ReturnType<typeof useKycHook>;
}

/**
 * Corporate Tier 1: who is opening the account and which registered business
 * it belongs to. Tier 2 builds on these values, so the hook instance is owned
 * by CorporateAcct and shared between both tiers.
 */
const CorporateTier1Form = ({ onComplete, kyc }: CorporateTier1FormProps) => {
  const { createCorporateAcctForm, isPending, submitCorporateTier } = kyc;

  const handleSubmit = async () => {
    const ok = await submitCorporateTier(1);
    if (ok) onComplete();
  };

  return (
    <Form {...createCorporateAcctForm}>
      <form
        className="w-full space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="space-y-4">
          <SectionHeading
            title="Primary director"
            description="The director opening the account on the business's behalf."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={createCorporateAcctForm.control}
              name="firstname"
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
              control={createCorporateAcctForm.control}
              name="lastname"
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

            <FormField
              control={createCorporateAcctForm.control}
              name="dob"
              render={({ field }) => (
                <KycDateField
                  field={field}
                  label="Date of birth"
                  placeholder="Pick date of birth"
                />
              )}
            />

            <FormField
              control={createCorporateAcctForm.control}
              name="bvn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Director's BVN</FormLabel>
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

        <div className="space-y-4">
          <SectionHeading
            title="Business details"
            description="These must match the records held at CAC."
          />

          <FormField
            control={createCorporateAcctForm.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registered business name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={createCorporateAcctForm.control}
              name="registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RC / BN number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your registration number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createCorporateAcctForm.control}
              name="reg_date"
              render={({ field }) => (
                <KycDateField
                  field={field}
                  label="Registration date"
                  placeholder="Pick registration date"
                />
              )}
            />
          </div>

          <FormField
            control={createCorporateAcctForm.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={createCorporateAcctForm.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12! min-h-0 w-full rounded-md border-grey-5">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Notice title="After Tier 1">
          The account opens on a ₦100,000 daily limit. Tier 2 adds your CAC
          documents and director records to lift it.
        </Notice>

        <Button type="submit" disabled={isPending} size="lg" className="w-full">
          {isPending ? <Spinner /> : "Submit Tier 1 verification"}
        </Button>
      </form>
    </Form>
  );
};

export default CorporateTier1Form;
