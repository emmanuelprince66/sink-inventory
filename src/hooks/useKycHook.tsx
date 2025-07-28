import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateKycAcctMutation } from "@/api/kyc/create-acct";
import moment from "moment";

const individualAccountSchema = z.object({
  bvn: z.string().min(1, " Bvn is required"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  dob: z.string().optional(),
});
const corporateAccountSchema = z.object({
  bvn: z.string().min(1, " Bvn is required"),
  business_name: z.string().optional(),
  registration_number: z.string().optional(),
  reg_date: z.string().optional(),
});

export type AddIndividualAcctFormValues = z.infer<
  typeof individualAccountSchema
>;
export type AddCorporateAcctFormValues = z.infer<typeof corporateAccountSchema>;

export const useKycHook = () => {
  const { mutate: CreateAcct, isPending } = useCreateKycAcctMutation();

  const createIndividualAcctForm = useForm<AddIndividualAcctFormValues>({
    resolver: zodResolver(individualAccountSchema) as any, // Temporary workaround
    defaultValues: {
      bvn: "",
      first_name: "",
      last_name: "",
      dob: "",
    },
    mode: "onChange",
  });
  const createCorporateAcctForm = useForm<AddCorporateAcctFormValues>({
    resolver: zodResolver(corporateAccountSchema) as any, // Temporary workaround
    defaultValues: {
      bvn: "",
      business_name: "",
      registration_number: "",
      reg_date: "",
    },
    mode: "onChange",
  });

  const onSubmitIndividualAcct = (data: AddIndividualAcctFormValues) => {
    const insert = {
      ...data,
      type: "INDIVIDUAL",
      dob: data.dob ? moment(data.dob).format("DD-MMM-YYYY") : undefined,
    };

    console.log("Individual insert Data:", insert);
    CreateAcct(insert, {
      onSuccess: (data) => {
        console.log("data---success", data);
        try {
          // Validate the wallet URL
          if (!data?.data?.url) {
            throw new Error("No Wallet URL received");
          }

          setTimeout(() => {
            // Open in new tab with noopener for security
            window.open(data.data.url, "_blank", "noopener,noreferrer");
          }, 1000);
        } catch (error) {
          console.error("Error handling success response:", error);
          // You might want to show an error toast here
        }
      },
    });
  };
  const onSubmitCorporateAcct = (data: AddCorporateAcctFormValues) => {
    const insert = {
      ...data,
      type: "CORPORATE",
      reg_date: data.reg_date
        ? moment(data.reg_date).format("DD-MMM-YYYY")
        : undefined,
    };

    CreateAcct(insert, {
      onSuccess: (data) => {
        console.log("data---success", data);
        try {
          // Validate the wallet URL
          if (!data?.data?.url) {
            throw new Error("No Wallet URL received");
          }

          setTimeout(() => {
            // Open in new tab with noopener for security
            window.open(data.data.url, "_blank", "noopener,noreferrer");
          }, 1000);
        } catch (error) {
          console.error("Error handling success response:", error);
          // You might want to show an error toast here
        }
      },
    });
  };

  return {
    createIndividualAcctForm,
    createCorporateAcctForm,
    onSubmitIndividualAcct,
    onSubmitCorporateAcct,
    isPending,
  };
};
