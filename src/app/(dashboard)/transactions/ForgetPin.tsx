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
import { Input } from "@/components/ui/input";
import { usePinHook } from "@/hooks/usePinHook";
import { useState } from "react";

const ForgetPin = ({ onSuccess }: { onSuccess?: () => void }) => {
  const {
    businessData,
    requestPinResetForm,
    onRequestPinReset,
    onVerifyPinResetCode,
    onResetPin,
    requestPinResetLoading,
    verifyPinResetLoading,
    resetPinLoading,
    verifyPinResetForm,
    resetPinForm,
  } = usePinHook();
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [resetToken, setResetToken] = useState<string>("");
  const [uid64, setUid64] = useState<string>("");

  // console.log("uid64 state:", uid64);

  // Form for verifying reset code
  const verifyForm = (
    <Form {...verifyPinResetForm}>
      <form
        onSubmit={verifyPinResetForm.handleSubmit(async (data) => {
          const result = await onVerifyPinResetCode(data.token);
          if (result.success) {
            console.log("response", result);
            setUid64(result.uid64);
            setStep("reset");
          }
        })}
        className="space-y-4 flex flex-col items-center justify-center"
      >
        <p className="text-2xl font-extrabold text-grey-1">Verify Reset Code</p>
        <p className="text-sm text-grey-3 text-center">
          Enter the verification code sent to your email
        </p>
        <FormField
          control={verifyPinResetForm.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter code"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setResetToken(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={verifyPinResetLoading}
          type="submit"
          className="w-[220px] mt-6 "
        >
          {verifyPinResetLoading ? <Spinner /> : "Verify Code"}
        </Button>
      </form>
    </Form>
  );

  // Form for resetting pin
  const resetForm = (
    <Form {...resetPinForm}>
      <form
        onSubmit={resetPinForm.handleSubmit(async (data) => {
          const result = await onResetPin(uid64, data.new_pin);
          if (result.success) {
            onSuccess?.();
          }
        })}
        className="space-y-4 flex flex-col items-center justify-center"
      >
        <p className="text-2xl font-extrabold text-grey-1">Reset Pin</p>
        <p className="text-sm text-grey-3 text-center">
          Enter your new 4-digit pin
        </p>
        <FormField
          control={resetPinForm.control}
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
          disabled={resetPinLoading}
          type="submit"
          className="w-[220px] mt-6 "
        >
          {resetPinLoading ? <Spinner /> : "Reset Pin"}
        </Button>
      </form>
    </Form>
  );

  // Form for requesting reset
  const requestForm = (
    <Form {...requestPinResetForm}>
      <form
        onSubmit={requestPinResetForm.handleSubmit(async () => {
          const result = await onRequestPinReset();
          if (result.success) {
            setStep("verify");
          }
        })}
        className="space-y-4 flex flex-col items-center justify-center"
      >
        <p className="text-2xl font-extrabold text-grey-1">Forgot Pin</p>
        <p className="text-sm text-grey-3 text-center">
          Click below to receive a verification code to your email
        </p>
        <Button
          disabled={requestPinResetLoading}
          type="submit"
          className="w-[220px] mt-6 "
        >
          {requestPinResetLoading ? <Spinner /> : "Send Verification Code"}
        </Button>
      </form>
    </Form>
  );

  // Main render
  return (
    <div className="w-full max-w-md mx-auto p-6">
      {step === "request" && requestForm}
      {step === "verify" && verifyForm}
      {step === "reset" && resetForm}
    </div>
  );
};

export default ForgetPin;
