import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  ExtractFnReturnType,
  MutationConfig,
  QueryConfigType,
  useMutation,
  useQuery,
} from "@/lib/react-query";
import type { IndividualUpgradeBody } from "@/lib/kycUpgradePayload";

/** POST /wallet/upgrade_account/{id}/ — adds bvn, nin or address. */
const upgradeIndividualAcct = async ({
  businessId,
  body,
}: {
  businessId: string;
  body: IndividualUpgradeBody;
}) => {
  const response = await fetch(`/api/kyc/${businessId}/upgrade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw await response.json().catch(() => ({}));
  return response.json();
};

/** Mirrors useCreateKycAcctMutation: the callbacks take (error, vars, ctx). */
interface UpgradeMutationProps<T extends (...args: any) => any>
  extends MutationConfig<T> {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}

export const useUpgradeIndividualAcctMutation = (
  config?: UpgradeMutationProps<typeof upgradeIndividualAcct>,
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.kyc.upgradeAcct],
    mutationFn: upgradeIndividualAcct,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      showToast(
        error?.details?.message ||
          error?.error ||
          error?.message ||
          "Could not upgrade the account",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    ...config,
  });
};

/** POST the company's documents — multipart, built by buildCorporateUpgradeBody. */
const upgradeCorporateAcct = async ({
  businessId,
  body,
}: {
  businessId: string;
  body: FormData;
}) => {
  // No Content-Type header: the browser sets it from the FormData, including
  // the multipart boundary the server needs to split the parts.
  const response = await fetch(`/api/kyc/${businessId}/upgrade-corporate`, {
    method: "POST",
    body,
  });

  if (!response.ok) throw await response.json().catch(() => ({}));
  return response.json();
};

export const useUpgradeCorporateAcctMutation = (
  config?: UpgradeMutationProps<typeof upgradeCorporateAcct>,
) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.kyc.upgradeCorporateAcct],
    mutationFn: upgradeCorporateAcct,
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      showToast(
        error?.details?.message ||
          error?.error ||
          error?.message ||
          "Could not submit the company documents",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    ...config,
  });
};

/** One director as the API stores them — the files come back as URLs. */
export interface CorporateUpgradeDirector {
  fullname?: string | null;
  identification?: string | null;
  passport?: string | null;
}

/**
 * What the company has already filed. Each document comes back as a URL when
 * it is on record, so the form can mark it done rather than asking again, and
 * `status` says where the submission stands with the reviewers.
 */
export interface CorporateUpgradeState {
  id?: string;
  /** PENDING while under review; APPROVED once the tier is granted. */
  status?: string | null;
  approved_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  cac_certificate?: string | null;
  cac_memorandum?: string | null;
  rc_document?: string | null;
  status_report?: string | null;
  board_resolution?: string | null;
  proof_of_address?: string | null;
  utility_bill?: string | null;
  tin?: string | null;
  directors?: CorporateUpgradeDirector[];
}

const fetchCorporateUpgrade = async (businessId: string) => {
  const response = await fetch(`/api/kyc/${businessId}/upgrade-corporate`);
  if (!response.ok) throw new Error("Failed to read corporate upgrade");
  return response.json() as Promise<{
    success: boolean;
    data: CorporateUpgradeState | null;
  }>;
};

export const useFetchCorporateUpgradeQuery = (
  businessId: string,
  config?: QueryConfigType<typeof fetchCorporateUpgrade>,
) =>
  useQuery<ExtractFnReturnType<typeof fetchCorporateUpgrade>>({
    queryKey: [queryKey.kyc.corporateUpgradeState, businessId],
    queryFn: () => fetchCorporateUpgrade(businessId),
    enabled: Boolean(businessId),
    retry: false,
    ...config,
  });
