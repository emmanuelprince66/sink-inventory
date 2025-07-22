import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";

import { useCreateKycAcctMutation } from "@/api/kyc/create-acct";

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
  const { showToast } = useToast();

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
    console.log("Individual Account Data:", data);
  };
  const onSubmitCorporateAcct = (data: AddCorporateAcctFormValues) => {
    console.log("corporate Account Data:", data);
  };

  return {
    createIndividualAcctForm,
    createCorporateAcctForm,
    onSubmitIndividualAcct,
    onSubmitCorporateAcct,
    isPending,
  };
};
