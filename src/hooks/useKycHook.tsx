import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateKycAcctMutation } from "@/api/kyc/create-acct";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import moment from "moment";

const individualAccountSchema = z.object({
  bvn: z.string().min(1, " Bvn is required"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  dob: z.string().optional(),
});
const corporateAccountSchema = z.object({
  bvn: z.string().min(1, " Bvn is required"),
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  dob: z.string().optional(),
  business_name: z.string().optional(),
  registration_number: z.string().optional(),
  reg_date: z.string().optional(),
  address: z.string().min(1, "Business address is required"),
  state: z.string().min(1, "State is required"),
  tin: z.string().optional(),
});

export type AddIndividualAcctFormValues = z.infer<
  typeof individualAccountSchema
>;
export type AddCorporateAcctFormValues = z.infer<typeof corporateAccountSchema>;

export const useKycHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);

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
      firstname: "",
      lastname: "",
      dob: "",
      business_name: "",
      registration_number: "",
      reg_date: "",
      address: "",
      state: "",
      tin: "",
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
    CreateAcct(
      { body: insert, businessId: business_id },
      {
        onSuccess: (data: any) => {
          console.log("data---success", data);
          try {
            if (!data?.data?.url) {
              throw new Error("No Wallet URL received");
            }

            // Create temporary anchor element
            const link = document.createElement("a");
            link.href = data.data.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.error("Error handling success response:", error);
          }
        },
      },
    );
  };
  const onSubmitCorporateAcct = (data: AddCorporateAcctFormValues) => {
    const insert = {
      ...data,
      type: "CORPORATE",
      dob: data.dob ? moment(data.dob).format("DD-MMM-YYYY") : undefined,
      reg_date: data.reg_date
        ? moment(data.reg_date).format("DD-MMM-YYYY")
        : undefined,
    };

    CreateAcct(
      { body: insert, businessId: business_id },
      {
        onSuccess: (data: any) => {
          console.log("data---success", data);
          try {
            // Validate the wallet URL
            if (!data?.data?.url) {
              throw new Error("No Wallet URL received");
            }

            // Create temporary anchor element
            const link = document.createElement("a");
            link.href = data.data.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.error("Error handling success response:", error);
            // You might want to show an error toast here
          }
        },
      },
    );
  };

  return {
    createIndividualAcctForm,
    createCorporateAcctForm,
    onSubmitIndividualAcct,
    onSubmitCorporateAcct,
    isPending,
  };
};
