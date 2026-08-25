import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateKycAcctMutation } from "@/api/kyc/create-acct";
import {
  CORPORATE_DOCUMENTS,
  CorporateDocKey,
  DIRECTOR_DOCUMENTS,
  DirectorDocKey,
} from "@/components/app/kyc/tiers";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";

// NIN and BVN are both 11 digits in Nigeria; reject anything else early rather
// than round-tripping to the provider for a guaranteed failure.
const ELEVEN_DIGITS = /^\d{11}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts +234..., 0803..., and spaced/dashed variants — 10 to 18 characters
// once formatting is allowed for.
const PHONE = /^\+?[\d\s-]{10,18}$/;

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
  city: z.string().optional(),
  state: z.string().optional(),
  /** Which document backs the address — see PROOF_OF_ADDRESS_TYPES. */
  proof_of_address_type: z.string().optional(),
});

const corporateAccountSchema = z.object({
  bvn: z.string().min(1, "BVN is required"),
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  dob: z.string().optional(),
  business_name: z.string().optional(),
  business_type: z.string().optional(),
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
export type CorporateTier = 1 | 2;

/** Tier 1 takes one identifier; this is which one the merchant picked. */
export type IdentityMethod = "nin" | "bvn";

export const IDENTITY_LABELS: Record<IdentityMethod, string> = {
  nin: "National Identity Number (NIN)",
  bvn: "Bank Verification Number (BVN)",
};

export const IDENTITY_SHORT: Record<IdentityMethod, string> = {
  nin: "NIN",
  bvn: "BVN",
};

/** "TIER 1" → 1. Returns 0 when the account has not been tiered yet. */
const parseTierNumber = (tier?: string | null) => {
  const match = /(\d+)/.exec(tier ?? "");
  return match ? Number(match[1]) : 0;
};

const otherIdentity = (method: IdentityMethod): IdentityMethod =>
  method === "nin" ? "bvn" : "nin";

/** One director's record. `id` is local only — it keys the list in the UI. */
export interface DirectorDetails {
  id: string;
  name: string;
  phone: string;
  email: string;
  files: Record<DirectorDocKey, File | null>;
}

/** Per-director validation messages, keyed the same way as the fields. */
export type DirectorErrors = Partial<
  Record<"name" | "phone" | "email" | DirectorDocKey, string>
>;

const emptyDirectorFiles = () =>
  DIRECTOR_DOCUMENTS.reduce(
    (acc, doc) => ({ ...acc, [doc.key]: null }),
    {} as Record<DirectorDocKey, File | null>,
  );

const emptyCorporateDocs = () =>
  CORPORATE_DOCUMENTS.reduce(
    (acc, doc) => ({ ...acc, [doc.key]: null }),
    {} as Record<CorporateDocKey, File | null>,
  );

export const useKycHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: CreateAcct, isPending } = useCreateKycAcctMutation();

  // ──────────────────────────────────────────────────────────────────────
  // What the account has already verified.
  //
  // The wallet endpoint answers this alongside the ledger: which tier the
  // account sits on, whether a BVN and NIN are on file, and whether an
  // address has been captured. Every "completed tier" in the UI is read from
  // here rather than from local state, so a merchant who verified last week
  // does not land back on Tier 1.
  // ──────────────────────────────────────────────────────────────────────
  const { TrxData, TrxDataLoading } = useTransactionsHook({ page: 1 });
  const account = TrxData?.data?.results;

  const verification = useMemo(() => {
    const hasNin = Boolean(account?.nin);
    const hasBvn = Boolean(account?.bvn);
    const hasAddress = Boolean(account?.address);

    const completedTiers: number[] = [];
    if (hasNin || hasBvn) completedTiers.push(1);
    if (hasNin && hasBvn) completedTiers.push(2);
    if (hasNin && hasBvn && hasAddress) completedTiers.push(3);

    return {
      isLoading: TrxDataLoading,
      /** 0 until the account has been tiered. */
      tier: parseTierNumber(account?.tier),
      tierLabel: account?.tier as string | undefined,
      hasNin,
      hasBvn,
      hasAddress,
      hasPin: Boolean(account?.pin),
      wallet: account?.wallet_details,
      completedTiers,
      /**
       * The identifier Tier 2 still needs. Null when both are on file, or when
       * neither is — in which case Tier 1 has not been done and Tier 2 is not
       * reachable yet.
       */
      missingIdentity: (hasNin === hasBvn
        ? null
        : hasNin
          ? "bvn"
          : "nin") as IdentityMethod | null,
    };
  }, [account, TrxDataLoading]);

  /** Re-reads the wallet payload after a tier is accepted. */
  const refreshVerification = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: [queryKey.transactions.getAllTransactions],
      }),
    [queryClient],
  );

  const createIndividualAcctForm = useForm<AddIndividualAcctFormValues>({
    resolver: zodResolver(individualAccountSchema) as any, // Temporary workaround
    defaultValues: {
      first_name: "",
      last_name: "",
      dob: "",
      nin: "",
      bvn: "",
      address: "",
      city: "",
      state: "",
      proof_of_address_type: "",
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
      business_type: "",
      registration_number: "",
      reg_date: "",
      address: "",
      state: "",
      tin: "",
    },
    mode: "onChange",
  });

  // Tier 1 asks for one identifier, never both — the account cannot be opened
  // with two at once, and showing both fields invites a merchant to fill in a
  // number that is then thrown away.
  const [identityMethod, setIdentityMethod] = useState<IdentityMethod>("nin");

  const chooseIdentityMethod = useCallback(
    (method: IdentityMethod) => {
      setIdentityMethod(method);
      // Drop whatever was typed under the other option: a half-entered number
      // left behind would still be sitting in the payload builder.
      const other = otherIdentity(method);
      createIndividualAcctForm.setValue(other, "");
      createIndividualAcctForm.clearErrors(other);
    },
    [createIndividualAcctForm],
  );

  /** What Tier 2 asks for: whatever Tier 1 did not supply. */
  const tier2Identity: IdentityMethod =
    verification.missingIdentity ?? otherIdentity(identityMethod);

  // ──────────────────────────────────────────────────────────────────────
  // Document state
  //
  // Files live outside react-hook-form: the create-account endpoint is still
  // JSON-only, so the uploads are collected and validated here and attached
  // once that endpoint accepts multipart. Keeping them in the hook is what
  // lets the tier components stay presentational.
  // ──────────────────────────────────────────────────────────────────────

  /** Individual Tier 3 proof of address (utility bill / bank statement). */
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(
    null,
  );
  const [proofOfAddressError, setProofOfAddressError] = useState<string | null>(
    null,
  );

  const [corporateDocs, setCorporateDocs] = useState(emptyCorporateDocs);
  const [corporateDocErrors, setCorporateDocErrors] = useState<
    Partial<Record<CorporateDocKey, string>>
  >({});

  const setCorporateDoc = useCallback(
    (key: CorporateDocKey, file: File | null) => {
      setCorporateDocs((prev) => ({ ...prev, [key]: file }));
      setCorporateDocErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  // ──────────────────────────────────────────────────────────────────────
  // Directors — at least one, added and removed from the UI.
  // ──────────────────────────────────────────────────────────────────────

  const nextDirectorId = useRef(1);

  const [directors, setDirectors] = useState<DirectorDetails[]>(() => [
    {
      id: "director-0",
      name: "",
      phone: "",
      email: "",
      files: emptyDirectorFiles(),
    },
  ]);
  const [directorErrors, setDirectorErrors] = useState<
    Record<string, DirectorErrors>
  >({});

  const clearDirectorError = useCallback(
    (id: string, field: keyof DirectorErrors) =>
      setDirectorErrors((prev) => {
        if (!prev[id]?.[field]) return prev;
        const forDirector = { ...prev[id] };
        delete forDirector[field];
        return { ...prev, [id]: forDirector };
      }),
    [],
  );

  const addDirector = useCallback(
    () =>
      setDirectors((prev) => [
        ...prev,
        {
          id: `director-${nextDirectorId.current++}`,
          name: "",
          phone: "",
          email: "",
          files: emptyDirectorFiles(),
        },
      ]),
    [],
  );

  /** The first director is the account's primary contact and cannot be removed. */
  const removeDirector = useCallback((id: string) => {
    setDirectors((prev) =>
      prev.length === 1 ? prev : prev.filter((d) => d.id !== id),
    );
    setDirectorErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const updateDirector = useCallback(
    (id: string, field: "name" | "phone" | "email", value: string) => {
      setDirectors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
      );
      clearDirectorError(id, field);
    },
    [clearDirectorError],
  );

  const updateDirectorFile = useCallback(
    (id: string, key: DirectorDocKey, file: File | null) => {
      setDirectors((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, files: { ...d.files, [key]: file } } : d,
        ),
      );
      clearDirectorError(id, key);
    },
    [clearDirectorError],
  );

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

  // ──────────────────────────────────────────────────────────────────────
  // Individual validation
  //
  // Tier 1 takes one identifier — the one the merchant chose. Tier 2 asks for
  // the other, read off the account payload so it never asks again for a
  // number already on file. Tier 3 adds a proof-of-address document on top of
  // the street address.
  // ──────────────────────────────────────────────────────────────────────

  const validateTier = (tier: KycTier, values: AddIndividualAcctFormValues) => {
    const setError = (
      field: keyof AddIndividualAcctFormValues,
      message: string,
    ) => createIndividualAcctForm.setError(field, { type: "manual", message });

    let ok = true;

    // Name and date of birth open the account at Tier 1. Once the account
    // exists they are on file, so a later tier — which may be reached in a
    // fresh session with an empty form — does not ask for them again.
    const opensAccount = !verification.completedTiers.includes(1);

    if (opensAccount) {
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
    }

    const checkIdentity = (field: IdentityMethod) => {
      if (!ELEVEN_DIGITS.test(values[field] ?? "")) {
        setError(field, `Enter the 11-digit ${IDENTITY_SHORT[field]}`);
        ok = false;
      }
    };

    if (tier === 1) checkIdentity(identityMethod);
    if (tier === 2) checkIdentity(tier2Identity);

    if (tier >= 3) {
      if (!values.address?.trim()) {
        setError("address", "Select your address");
        ok = false;
      }
      if (!values.state?.trim()) {
        setError("state", "State is required — pick an address from the list");
        ok = false;
      }
      if (!values.proof_of_address_type) {
        setError("proof_of_address_type", "Pick the document you are uploading");
        ok = false;
      }
      if (!proofOfAddressFile) {
        setProofOfAddressError("Upload a utility bill or bank statement");
        ok = false;
      }
    }

    return ok;
  };

  // Builds the payload for a tier: the personal details still in the form,
  // plus whatever this tier adds. Empty fields are dropped so the provider
  // never receives "".
  const buildTierPayload = (
    tier: KycTier,
    values: AddIndividualAcctFormValues,
  ) => {
    const payload: Record<string, unknown> = {
      type: "INDIVIDUAL",
      first_name: values.first_name,
      last_name: values.last_name,
      dob: values.dob ? moment(values.dob).format("DD-MMM-YYYY") : undefined,
    };

    // One identifier per tier: the chosen one at Tier 1, the outstanding one
    // at Tier 2. Tier 3 sends neither — both are already on file.
    if (tier === 1) payload[identityMethod] = values[identityMethod];
    if (tier === 2) payload[tier2Identity] = values[tier2Identity];

    if (tier >= 3) {
      payload.address = values.address;
      payload.city = values.city;
      payload.state = values.state;
      payload.proof_of_address_type = values.proof_of_address_type;
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
    setProofOfAddressError(null);
    if (!validateTier(tier, values)) return Promise.resolve(false);

    const insert = buildTierPayload(tier, values);

    return new Promise((resolve) => {
      CreateAcct(
        { body: insert, businessId: business_id },
        {
          onSuccess: (response: any) => {
            showToast(`Tier ${tier} verification submitted`, "success");
            // The account payload is what the tier rail reads, so pull it
            // again rather than trusting local state to match the server.
            refreshVerification();
            openWalletUrl(response);
            resolve(true);
          },
          onError: () => resolve(false),
        },
      );
    });
  };

  // ──────────────────────────────────────────────────────────────────────
  // Corporate validation
  // ──────────────────────────────────────────────────────────────────────

  const validateCorporateTier1 = (values: AddCorporateAcctFormValues) => {
    const setError = (
      field: keyof AddCorporateAcctFormValues,
      message: string,
    ) => createCorporateAcctForm.setError(field, { type: "manual", message });

    let ok = true;
    const required: [keyof AddCorporateAcctFormValues, string][] = [
      ["firstname", "First name is required"],
      ["lastname", "Last name is required"],
      ["business_name", "Business name is required"],
      ["registration_number", "RC / BN number is required"],
      ["address", "Business address is required"],
      ["state", "State is required"],
    ];

    required.forEach(([field, message]) => {
      if (!String(values[field] ?? "").trim()) {
        setError(field, message);
        ok = false;
      }
    });

    if (!ELEVEN_DIGITS.test(values.bvn ?? "")) {
      setError("bvn", "Enter the director's 11-digit BVN");
      ok = false;
    }

    return ok;
  };

  const validateCorporateTier2 = (values: AddCorporateAcctFormValues) => {
    let ok = true;

    if (!values.business_type) {
      createCorporateAcctForm.setError("business_type", {
        type: "manual",
        message: "Select the business type",
      });
      ok = false;
    }
    if (!values.tin?.trim()) {
      createCorporateAcctForm.setError("tin", {
        type: "manual",
        message: "Tax Identification Number is required",
      });
      ok = false;
    }

    const docErrors: Partial<Record<CorporateDocKey, string>> = {};
    CORPORATE_DOCUMENTS.forEach((doc) => {
      if (!corporateDocs[doc.key]) {
        docErrors[doc.key] = `${doc.label} is required`;
        ok = false;
      }
    });
    setCorporateDocErrors(docErrors);

    const nextDirectorErrors: Record<string, DirectorErrors> = {};
    directors.forEach((director) => {
      const errors: DirectorErrors = {};
      if (!director.name.trim()) errors.name = "Name is required";
      if (!PHONE.test(director.phone.trim()))
        errors.phone = "Enter a valid phone number";
      if (!EMAIL.test(director.email.trim()))
        errors.email = "Enter a valid email address";
      DIRECTOR_DOCUMENTS.forEach((doc) => {
        if (!director.files[doc.key]) errors[doc.key] = "This upload is required";
      });
      if (Object.keys(errors).length) {
        nextDirectorErrors[director.id] = errors;
        ok = false;
      }
    });
    setDirectorErrors(nextDirectorErrors);

    return ok;
  };

  const buildCorporatePayload = (
    tier: CorporateTier,
    values: AddCorporateAcctFormValues,
  ) => {
    const payload: Record<string, unknown> = {
      type: "CORPORATE",
      bvn: values.bvn,
      firstname: values.firstname,
      lastname: values.lastname,
      dob: values.dob ? moment(values.dob).format("DD-MMM-YYYY") : undefined,
      business_name: values.business_name,
      registration_number: values.registration_number,
      reg_date: values.reg_date
        ? moment(values.reg_date).format("DD-MMM-YYYY")
        : undefined,
      address: values.address,
      state: values.state,
    };

    if (tier >= 2) {
      payload.business_type = values.business_type;
      payload.tin = values.tin;
      // The uploads themselves stay in state until the endpoint accepts
      // multipart; the payload carries the roster so the backend knows how
      // many director records to expect.
      payload.directors = directors.map((director) => ({
        name: director.name,
        phone: director.phone,
        email: director.email,
      }));
    }

    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value === undefined || value === "") delete payload[key];
    });

    return payload;
  };

  /** Mirrors submitTier(): resolves true only once the API accepted the tier. */
  const submitCorporateTier = (tier: CorporateTier): Promise<boolean> => {
    const values = createCorporateAcctForm.getValues();

    createCorporateAcctForm.clearErrors();
    // Tier 2 is cumulative, so it re-runs the Tier 1 checks first.
    const valid =
      tier === 1
        ? validateCorporateTier1(values)
        : [validateCorporateTier1(values), validateCorporateTier2(values)].every(
            Boolean,
          );

    if (!valid) return Promise.resolve(false);

    const insert = buildCorporatePayload(tier, values);

    return new Promise((resolve) => {
      CreateAcct(
        { body: insert, businessId: business_id },
        {
          onSuccess: (response: any) => {
            showToast(`Tier ${tier} verification submitted`, "success");
            // The account payload is what the tier rail reads, so pull it
            // again rather than trusting local state to match the server.
            refreshVerification();
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

  /** How many corporate Tier 2 documents are in — drives the checklist copy. */
  const corporateDocsCount = useMemo(
    () => CORPORATE_DOCUMENTS.filter((doc) => corporateDocs[doc.key]).length,
    [corporateDocs],
  );

  return {
    createIndividualAcctForm,
    createCorporateAcctForm,
    onSubmitIndividualAcct,
    onSubmitCorporateAcct,
    submitTier,
    submitCorporateTier,
    // what the account has already verified, read from the wallet payload
    verification,
    refreshVerification,
    // Tier 1's one-identifier choice, and the one Tier 2 is left asking for
    identityMethod,
    chooseIdentityMethod,
    tier2Identity,
    // individual documents
    proofOfAddressFile,
    setProofOfAddressFile,
    proofOfAddressError,
    setProofOfAddressError,
    // corporate documents
    corporateDocs,
    setCorporateDoc,
    corporateDocErrors,
    corporateDocsCount,
    // directors
    directors,
    directorErrors,
    addDirector,
    removeDirector,
    updateDirector,
    updateDirectorFile,
    isPending,
  };
};
