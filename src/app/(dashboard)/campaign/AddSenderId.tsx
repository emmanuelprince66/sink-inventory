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

const AddSenderId = ({ closeModal }: { closeModal: () => void }) => {
  const {
    senderIdForm: form,
    onSubmitSenderIdForm: onSubmit,
    CreateSenderIdLoading,
  } = useCampaignHook({ closeModal });
  return (
    <>
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full max-w-xl bg-white p-4 rounded shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Bank Name */}
              <FormField
                control={form.control}
                name="sender_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Sender ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Sender ID ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={CreateSenderIdLoading}
                type="submit"
                className="w-full h-[48px] mt-6"
              >
                {CreateSenderIdLoading ? <Spinner /> : "Add Sender ID"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default AddSenderId;
