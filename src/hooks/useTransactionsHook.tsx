import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useFetchTrxBank } from "@/api/transactions/fetch-bank";
import { useFetchTransactionQuery } from "@/api/transactions/fetch-transactions";
import { useTransferFundsMutation } from "@/api/transactions/transfer";
import { useBusinessBanks } from "@/hooks/useBusinessBanks";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useUserRole } from "@/lib/store/user-store";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";

export const useTransactionsHook = ({
  page,
  searchInput,
  type,
  dateRange,
  recipientBank,
  accountNumber,
  /**
   * Spend from a specific account instead of the one the wallet screens are
   * pointed at. The expenses page passes the expense account chosen there —
   * money has to leave that account, not the business's main wallet, and the
   * two are different wallets with different balances.
   */
  sourceBankId,
}: any) => {
  console.log("recipientBank", recipientBank, accountNumber);
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;
  const { user } = useUserRole();
  const { showToast } = useToast();
  const [beneficiaryInfo, setBeneficiaryInfo] = useState<any>(null);
  const { mutate: TransferFund, isPending: TransferFundsLoading } =
    useTransferFundsMutation();
  const router = useRouter();

  // console.log("user", user);
  const businessData = useBusinessDataStore((state: any) => state.businessData);

  // The wallet is keyed on a bank account, not the business — a business can
  // hold several, and each is its own wallet with its own balance and history.
  const { selectedBankId, selectedBank, hasBanks } = useBusinessBanks();

  // Which wallet this instance of the hook is reading and spending from. Every
  // wallet call is keyed on a bank id, so overriding this one value is all it
  // takes to point the same screen at an expense account instead.
  const walletBankId = sourceBankId ?? selectedBankId;
  const {
    data: BankData,
    isLoading: BankDataLoading,
    refetch: refetchBank,
  } = useFetchBankQuery(businessData?.id);
  const {
    data: BankTrxData,
    isLoading: BankTrxDataLoading,
    refetch: refetchTrxBank,
  } = useFetchTrxBank(businessData?.id);

  console.log("BankData", BankData);

  // Mutation for beneficiary enquiry using fetch
  const beneficiaryEnquiryMutation = useMutation({
    mutationFn: async (data: { bank_code: string; account_number: string }) => {
      console.log("data-------5", data);
      const response = await fetch("/api/transactions/check-beneficiary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      });

      console.log("response", response);

      if (!response.ok) {
        setEnquiryLoading(false);
        throw new Error("Failed to fetch beneficiary information");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setBeneficiaryInfo(data);
      console.log("Beneficiary enquiry response:", data);
      setEnquiryLoading(false);
    },
    onError: (error) => {
      console.error("Beneficiary enquiry error:", error);
      setBeneficiaryInfo(null); // Clear beneficiary info on error
      setEnquiryLoading(false);
    },
  });

  console.log("beneficairy_info", beneficiaryInfo);

  const handleSubmitTransferFunds = (data: any) => {
    // Guard rather than send a blank id: the URL would still be well formed
    // and the API would answer about some other wallet, or none.
    if (!walletBankId) {
      showToast("Select an account before transferring", "error");
      return;
    }

    const masterPayload = {
      pin: data?.pin,
      ref: data?.beneficiaryRef || beneficiaryInfo?.data?.ref || "",
      amount: data?.amount,
      narration: data?.narration,
      category: data?.category?.id,
    };

    TransferFund(
      // Money leaves the wallet the screen is pointed at, so the transfer is
      // keyed on the same bank id the balance above it was read from.
      { body: masterPayload, businessId: walletBankId },
      {
        onSuccess: () => {
          TrxDataRefetch();
          // Clear beneficiary info after successful transfer
          setBeneficiaryInfo(null);
          router.back();
        },
        onError: (error) => {},
      }
    );
  };

  // Function to manually trigger beneficiary enquiry
  const triggerBeneficiaryEnquiry = useCallback(
    (bankCode: string, accountNum: string) => {
      if (accountNum?.length === 10 && bankCode) {
        setEnquiryLoading(true);
        setBeneficiaryInfo(null); // Clear previous data

        console.log("bankCode", bankCode);
        beneficiaryEnquiryMutation.mutate({
          bank_code: bankCode,
          account_number: accountNum,
        });
      }
    },
    [beneficiaryEnquiryMutation]
  );

  useEffect(() => {
    if (accountNumber && recipientBank) {
      // console.log("recipientBank", recipientBank);
      console.log("accountNumber", accountNumber);

      if (accountNumber?.length === 10) {
        setEnquiryLoading(true);
        setBeneficiaryInfo(null); // Clear previous beneficiary info
        console.log("recipientBank", recipientBank);
        // bank code to test 000002
        beneficiaryEnquiryMutation.mutate({
          bank_code: recipientBank?.bank_code,
          account_number: accountNumber,
        });
      }
    } else {
      // Clear beneficiary info when account number or bank is cleared
      setBeneficiaryInfo(null);
    }
  }, [recipientBank, accountNumber]);

  console.log("enquiryLoading", enquiryLoading);

  const {
    data: TrxData,
    isLoading: TrxDataLoading,
    refetch: TrxDataRefetch,
  } = useFetchTransactionQuery({
    params: {
      page,
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
      limit: 20,
      id: walletBankId ?? "",
      search: searchTerm,
      type: type,
    },
    // Nothing to read until a bank resolves — querying with the business id
    // would point at a wallet that is not this one.
    enabled: !!walletBankId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: businessData?.id,
        type: "EXPENSES",
      },
      enabled: !!businessData?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  return {
    BankData,
    selectedBankId,
    /** The wallet actually in play — the override where one was given. */
    walletBankId,
    selectedBank,
    hasBanks,
    TrxData,
    TrxDataLoading,
    user,
    BankDataLoading,
    BankTrxData,
    businessData,
    CategoriesData,
    TransferFundsLoading,
    handleSubmitTransferFunds,
    CategoriesDataLoading,
    beneficiaryInfo,
    enquiryLoading,
    triggerBeneficiaryEnquiry,
  };
};
