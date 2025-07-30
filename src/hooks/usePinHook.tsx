import { useChangePinMutation } from "@/api/transactions/change-pin";
import { useCreatePinMutation } from "@/api/transactions/set-pin";
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
export type pinSetUpFormValues = z.infer<typeof pinSchema>;

const changePinSchema = z.object({
  old_pin: z.string().length(4, "Pin must be 4 digits"),
  new_pin: z.string().length(4, " Pin must be 4 digits"),
});

export type changePinFormValues = z.infer<typeof changePinSchema>;
export const usePinHook = () => {
  const { mutate: CreatePin, isPending: CreatePinLoading } =
    useCreatePinMutation();
  const { mutate: ChangePin, isPending: ChangePinLoading } =
    useChangePinMutation();

  const { TrxData } = useTransactionsHook({});

  console.log("TrxData", TrxData);

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
  const onSubmitPinForm = (values: pinSetUpFormValues) => {
    // By this point, Zod has already validated that pins match
    console.log("Submitting pin:", values.pin);

    const insert = {
      pin: values.pin,
    };

    CreatePin(insert, {
      onSuccess: (data) => {},
    });
  };
  const onSubmitChangePinForm = (values: changePinFormValues) => {
    // By this point, Zod has already validated that pins match
    ChangePin(values, {
      onSuccess: (data) => {},
    });
  };

  return {
    pinForm,
    onSubmitPinForm,
    CreatePinLoading,
    ChangePinLoading,
    TrxData,
    changePinForm,
    onSubmitChangePinForm,
  };
};
