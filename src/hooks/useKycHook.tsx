import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateKycAcctMutation } from "@/api/kyc/create-acct";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import moment from "moment";

// NIN and BVN are both 11 digits in Nigeria; reject anything else early rather
// than round-tripping to the provider for a guaranteed failure.
const ELEVEN_DIGITS = /^\d{11}$/;

// One schema covers all three tiers. Tier-specific requirements are enforced at
// submit time by validateTier() below, so a partially-filled form can still be
// carried forward between tiers without tripping validation on fields the user
// has not reached yet.
const individualAccountSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  dob: z.string().optional(),
  nin: z.string().optional(),
  bvn: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
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

export type KycTier = 1 | 2 | 3;

export const useKycHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();

  const { mutate: CreateAcct, isPending } = useCreateKycAcctMutation();

  const createIndividualAcctForm = useForm<AddIndividualAcctFormValues>({
    resolver: zodResolver(individualAccountSchema) as any, // Temporary workaround
    defaultValues: {
      first_name: "",
      last_name: "",
      dob: "",
      nin: "",
      bvn: "",
      address: "",
      state: "",
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

  // Opens the provider's hosted wallet page returned by the API.
  const openWalletUrl = (response: any) => {
    const url = response?.data?.url;
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Each tier owns a few fields; everything a lower tier collected is still
  // required, since submits are cumulative.
  const validateTier = (tier: KycTier, values: AddIndividualAcctFormValues) => {
    const setError = (
      field: keyof AddIndividualAcctFormValues,
      message: string,
    ) => createIndividualAcctForm.setError(field, { type: "manual", message });

    let ok = true;

    if (!values.first_name?.trim()) {
      setError("first_name", "First name is required");
      ok = false;
    }
    if (!values.last_name?.trim()) {
      setError("last_name", "Last name is required");
      ok = false;
    }
    if (!values.dob) {
      setError("dob", "Date of birth is required");
      ok = false;
    }
    if (!ELEVEN_DIGITS.test(values.nin ?? "")) {
      setError("nin", "Enter the 11-digit NIN");
      ok = false;
    }

    if (tier >= 2 && !ELEVEN_DIGITS.test(values.bvn ?? "")) {
      setError("bvn", "Enter the 11-digit BVN");
      ok = false;
    }

    if (tier >= 3) {
      if (!values.address?.trim()) {
        setError("address", "Select your address");
        ok = false;
      }
      if (!values.state?.trim()) {
        setError("state", "State is required — pick an address from the list");
        ok = false;
      }
    }

    return ok;
  };

  // Builds the cumulative payload for a tier: everything collected so far,
  // with empty optional fields dropped so the provider does not receive "".
  const buildTierPayload = (
    tier: KycTier,
    values: AddIndividualAcctFormValues,
  ) => {
    const payload: Record<string, unknown> = {
      type: "INDIVIDUAL",
      first_name: values.first_name,
      last_name: values.last_name,
      dob: values.dob ? moment(values.dob).format("DD-MMM-YYYY") : undefined,
      nin: values.nin,
    };

    if (tier >= 2) payload.bvn = values.bvn;
    if (tier >= 3) {
      payload.address = values.address;
      payload.state = values.state;
    }

    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value === undefined || value === "") delete payload[key];
    });

    return payload;
  };

  /**
   * Submits one tier. Resolves true only when the API call succeeded, so the
   * caller can advance the flow without optimistically marking a tier done.
   */
  const submitTier = (tier: KycTier): Promise<boolean> => {
    const values = createIndividualAcctForm.getValues();

    createIndividualAcctForm.clearErrors();
    if (!validateTier(tier, values)) return Promise.resolve(false);

    const insert = buildTierPayload(tier, values);

    return new Promise((resolve) => {
      CreateAcct(
        { body: insert, businessId: business_id },
        {
          onSuccess: (response: any) => {
            showToast(`Tier ${tier} verification submitted`, "success");
            openWalletUrl(response);
            resolve(true);
          },
          onError: () => resolve(false),
        },
      );
    });
  };

  // Kept for the existing single-shot individual flow.
  const onSubmitIndividualAcct = (data: AddIndividualAcctFormValues) => {
    const insert = {
      ...data,
      type: "INDIVIDUAL",
      dob: data.dob ? moment(data.dob).format("DD-MMM-YYYY") : undefined,
    };

    CreateAcct(
      { body: insert, businessId: business_id },
      { onSuccess: openWalletUrl },
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
      { onSuccess: openWalletUrl },
    );
  };

  return {
    createIndividualAcctForm,
    createCorporateAcctForm,
    onSubmitIndividualAcct,
    onSubmitCorporateAcct,
    submitTier,
    isPending,
  };
};
