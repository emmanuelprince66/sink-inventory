import { OtpInput } from "@/components/app/OtpInput";
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
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
const Pin = ({ closeModal }: any) => {
  const { pinForm, onSubmitPinForm, CreatePinLoading } = useTransactionsHook({
    closeModal,
  });
  return (
    <div className="w-full">
      <Form {...pinForm}>
        <form
          onSubmit={pinForm.handleSubmit(onSubmitPinForm)}
          className="space-y-4 flex flex-col items-center justify-center"
        >
          <FormField
            control={pinForm.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New 4-digit Pin</FormLabel>
                <FormControl>
                  <OtpInput
                    value={field.value}
                    onChange={field.onChange}
                    length={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={pinForm.control}
            name="confirmPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm 4-digit Pin</FormLabel>
                <FormControl>
                  <OtpInput
                    value={field.value}
                    onChange={field.onChange}
                    length={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={CreatePinLoading}
            type="submit"
            className="w-[220px] mt-9  hover:bg-primary-green-700"
          >
            {CreatePinLoading ? <Spinner /> : "Save Pin"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Pin;
