import { useCreateBankMutation } from "@/api/bank/add-bank";
import { useDeleteBankMutation } from "@/api/bank/delete-bank";
import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";

// Base bank schema
const bankSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  account_name: z.string().min(1, "Amount is required"),
  account_number: z.number().min(1, "Account number is required"),
});

// Expense tracking schema
const expenseTrackingSchema = z
  .object({
    min_fee: z.number().min(0, "Minimum charges must be positive"),
    max_fee: z.number().min(0, "Capped charges must be positive"),
    percentage: z
      .number()
      .min(0, "Percentage must be positive")
      .max(100, "Percentage cannot exceed 100"),
  })
  .partial()
  .refine(
    (data) => {
      // Either all expense fields are present or none are
      const hasAll =
        data.min_fee !== undefined &&
        data.max_fee !== undefined &&
        data.percentage !== undefined;
      const hasNone =
        data.min_fee === undefined &&
        data.max_fee === undefined &&
        data.percentage === undefined;
      return hasAll || hasNone;
    },
    {
      message:
        "You must provide all three expense tracking fields or none at all",
      path: ["percentage"], // This will show the error on the percentage field
    }
  );

// Combined schema
const combinedSchema = bankSchema.and(expenseTrackingSchema);

export type BankFormValues = z.infer<typeof combinedSchema>;

export const useBankHook = ({ closeModal }: { closeModal?: () => void }) => {
  const { showToast } = useToast();
  const [bankId, setBankId] = useState<string | null>(null);

  const { mutate: deleteBank, isPending: deleteBankLoading } =
    useDeleteBankMutation({
      onSuccess: (data) => {
        console.log("data", data);
        showToast(data.message, "success");
        refetchBank();

        if (closeModal) closeModal();

        // if (closeModal) closeModal();
        // Optional: Invalidate queries or update cache
      },
      // You can add other callbacks here if needed
    });
  const handleDeleteBank = (bank: any) => {
    console.log("customer", bank);
    deleteBank(bank?.id);
  };

  const business_id = useBusinessStore((state) => state.business_id);
  const {
    data: BankData,
    isLoading: BankDataLoading,
    refetch: refetchBank,
  } = useFetchBankQuery(business_id);

  const {
    mutate: createBank,
    isPending: createBankLoading,
    isSuccess: createBankSuccess,
  } = useCreateBankMutation({
    businessId: business_id, // Convert null to undefined
    onSuccess: (data) => {
      console.log("data---4", data);
      showToast(data.message, "success");
      refetchBank();
      if (closeModal) closeModal();

      // Optional: Invalidate queries or update cache
    },
  });

  console.log("createBankSuccess", createBankSuccess);

  const form = useForm<BankFormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      bank_name: "",
      account_name: "",
      account_number: undefined,
      // Optional fields can be omitted from defaults
    },
  });

  const onSubmit = (data: BankFormValues) => {
    // Create a new payload object with only defined/truthy values
    const payload = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        return { ...acc, [key]: value };
      }
      return acc;
    }, {});

    createBank({
      payload,
      businessId: business_id,
    });

    console.log("Filtered payload:", payload);

    // Here you would typically send the payload to your API
  };

  return {
    form,
    onSubmit,
    BankData,
    BankDataLoading,
    createBankLoading,

    handleDeleteBank,
    deleteBankLoading,
  };
};
