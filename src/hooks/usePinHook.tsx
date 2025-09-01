import { useChangePinMutation } from "@/api/transactions/change-pin";
import { useRequestResetPinQuery } from "@/api/transactions/request-reset";
import { useResetPinMutation } from "@/api/transactions/reset-pin";
import { useCreatePinMutation } from "@/api/transactions/set-pin";
import { useVerifyPinTokenMutation } from "@/api/transactions/verify-token";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTransactionsHook } from "./useTransactionsHook";

const pinSchema = z
  .object({
    pin: z.string().length(4, "Pin must be 4 digits"),
    confirmPin: z.string().length(4, "Confirm Pin must be 4 digits"),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "Pins don't match",
    path: ["confirmPin"],
  });

const changePinSchema = z.object({
  old_pin: z.string().length(4, "Pin must be 4 digits"),
  new_pin: z.string().length(4, "Pin must be 4 digits"),
});

const verifyPinResetSchema = z.object({
  token: z.string().min(1, "Verification code is required"),
});

const resetPinSchema = z.object({
  new_pin: z.string().length(4, "New pin must be 4 digits"),
});

export type pinSetUpFormValues = z.infer<typeof pinSchema>;
export type changePinFormValues = z.infer<typeof changePinSchema>;
export type verifyPinResetFormValues = z.infer<typeof verifyPinResetSchema>;
export type resetPinFormValues = z.infer<typeof resetPinSchema>;

export const usePinHook = () => {
  const { businessData } = useBusinessDataStore();
  const business_id = useBusinessStore((state) => state.business_id);

  const {
    data: requestToken,
    isLoading: requestPinResetLoading,
    refetch: refetchRequestPinReset,
  } = useRequestResetPinQuery(business_id, { enabled: false }); // Disable auto-fetch
  const { mutate: verifyPinResetCode, isPending: verifyPinResetLoading } =
    useVerifyPinTokenMutation();
  const { mutate: CreatePin, isPending: CreatePinLoading } =
    useCreatePinMutation();
  const { mutate: ChangePin, isPending: ChangePinLoading } =
    useChangePinMutation();
  const { mutate: resetPin, isPending: resetPinLoading } =
    useResetPinMutation();

  const { TrxData } = useTransactionsHook({});

  const pinForm = useForm<pinSetUpFormValues>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
      confirmPin: "",
    },
  });

  const changePinForm = useForm<changePinFormValues>({
    resolver: zodResolver(changePinSchema),
    defaultValues: {
      old_pin: "",
      new_pin: "",
    },
  });

  const verifyPinResetForm = useForm<verifyPinResetFormValues>({
    resolver: zodResolver(verifyPinResetSchema),
    defaultValues: {
      token: "",
    },
  });

  const resetPinForm = useForm<resetPinFormValues>({
    resolver: zodResolver(resetPinSchema),
    defaultValues: {
      new_pin: "",
    },
  });

  const requestPinResetForm = useForm<{}>({
    resolver: zodResolver(z.object({})),
    defaultValues: {},
  });

  const onRequestPinReset = async () => {
    if (!businessData?.id) {
      console.error("No business ID available");
      return { success: false };
    }
    try {
      await refetchRequestPinReset();
      return { success: true };
    } catch (error) {
      console.error("Error requesting pin reset:", error);
      return { success: false, error };
    }
  };

  const onSubmitPinForm = (values: pinSetUpFormValues) => {
    const insert = {
      pin: values.pin,
    };

    CreatePin(
      { body: insert, businessId: business_id },
      {
        onSuccess: (data) => {},
      }
    );
  };

  const onSubmitChangePinForm = (values: changePinFormValues) => {
    ChangePin(
      { body: values, businessId: business_id },
      {
        onSuccess: (data) => {},
      }
    );
  };

  const onVerifyPinResetCode = async (token: string) => {
    if (!businessData?.id) {
      console.error("No business ID available");
      return { success: false, uid64: "" };
    }
    try {
      const response = await new Promise<{
        success: boolean;
        data: { uid64: string };
      }>((resolve, reject) => {
        verifyPinResetCode(
          { businessId: businessData.id, body: { token } },
          {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error),
          }
        );
      });

      console.log("Verify Pin Reset Response:", response);

      // Extract uid64 from the nested data structure
      const uid64 = response.data?.uid64 || "";

      return { success: true, uid64 };
    } catch (error) {
      console.error("Error verifying pin reset code:", error);
      return { success: false, uid64: "", error };
    }
  };

  const onResetPin = async (uid64: string, new_pin: string) => {
    console.log("Resetting pin with uid64:", uid64, "and new_pin:", new_pin);
    if (!businessData?.id) {
      console.error("No business ID available");
      return { success: false };
    }
    try {
      await new Promise<void>((resolve, reject) => {
        resetPin(
          { businessId: businessData.id, body: { uid64, pin: new_pin } },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        );
      });
      return { success: true };
    } catch (error) {
      console.error("Error resetting pin:", error);
      return { success: false, error };
    }
  };

  return {
    pinForm,
    onSubmitPinForm,
    CreatePinLoading,
    ChangePinLoading,
    businessData,
    changePinForm,
    onSubmitChangePinForm,
    requestPinResetForm,
    requestPinResetLoading,
    verifyPinResetForm,
    verifyPinResetCode,
    verifyPinResetLoading,
    resetPinForm,
    resetPin,
    resetPinLoading,
    onRequestPinReset,
    onVerifyPinResetCode,
    onResetPin,
  };
};
