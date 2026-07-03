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
import { usePinHook } from "@/hooks/usePinHook";
const Pin = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { pinForm, onSubmitPinForm, CreatePinLoading } = usePinHook();
  return (
    <div className="w-full">
      <Form {...pinForm}>
        <form
          onSubmit={pinForm.handleSubmit(onSubmitPinForm)}
          className="space-y-4 flex flex-col items-center justify-center"
        >
          <p className="text-2xl font-extrabold text-grey-1">Create Pin</p>

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
            className="w-[220px] mt-9"
          >
            {CreatePinLoading ? <Spinner /> : "Save Pin"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Pin;
