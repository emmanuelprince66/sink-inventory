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
import { useCampaignHook } from "@/hooks/useCampaignHook";

const FundCampaign = ({ closeModal }: { closeModal: () => void }) => {
  const {
    onSubmitFundCampaign,
    fundCampaignForm: form,
    fundCampaignLoading,
  } = useCampaignHook({ closeModal });
  return (
    <>
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full max-w-xl bg-white p-4 rounded shadow-md">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitFundCampaign)}
              className="space-y-4"
            >
              {/* Bank Name */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Amount..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={fundCampaignLoading}
                type="submit"
                className="w-full h-[48px] mt-6"
              >
                {fundCampaignLoading ? <Spinner /> : "Fund Campaign"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default FundCampaign;
