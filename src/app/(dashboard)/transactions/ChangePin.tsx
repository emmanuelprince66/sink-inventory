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
const ChangePin = ({ closeModal }: any) => {
  const { changePinForm, onSubmitChangePinForm, ChangePinLoading } =
    useTransactionsHook({ closeModal });
  return (
    <div className="w-full">
      <Form {...changePinForm}>
        <form
          onSubmit={changePinForm.handleSubmit(onSubmitChangePinForm)}
          className="space-y-4 flex flex-col items-center justify-center"
        >
          <FormField
            control={changePinForm.control}
            name="old_pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Old Pin</FormLabel>
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
            control={changePinForm.control}
            name="new_pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Pin</FormLabel>
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
            disabled={ChangePinLoading}
            type="submit"
            className="w-[220px] mt-9  hover:bg-primary-green-700"
          >
            {ChangePinLoading ? <Spinner /> : "Update Pin"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ChangePin;
