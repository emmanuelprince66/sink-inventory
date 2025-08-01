import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useFetchTrxBank } from "@/api/transactions/fetch-bank";
import { useFetchTransactionQuery } from "@/api/transactions/fetch-transactions";
import { useTransferFundsMutation } from "@/api/transactions/transfer";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
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
  const business_id = useBusinessStore((state) => state.business_id);
  const {
    data: BankData,
    isLoading: BankDataLoading,
    refetch: refetchBank,
  } = useFetchBankQuery(business_id);
  const {
    data: BankTrxData,
    isLoading: BankTrxDataLoading,
    refetch: refetchTrxBank,
  } = useFetchTrxBank(business_id);

  // Mutation for beneficiary enquiry using fetch
  const beneficiaryEnquiryMutation = useMutation({
    mutationFn: async (data: { bank_code: string; account_number: string }) => {
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
    console.log("data----4", data);
    const masterPayload = {
      pin: data?.pin,
      ref: data?.beneficiaryRef || beneficiaryInfo?.data?.ref || "",
      amount: data?.amount,
      narration: data?.narration,
      category: data?.category?.id,
    };

    TransferFund(masterPayload, {
      onSuccess: () => {
        TrxDataRefetch();
        // Clear beneficiary info after successful transfer
        setBeneficiaryInfo(null);
        router.back();
      },
      onError: (error) => {},
    });
  };

  // Function to manually trigger beneficiary enquiry
  const triggerBeneficiaryEnquiry = useCallback(
    (bankCode: string, accountNum: string) => {
      if (accountNum?.length === 10 && bankCode) {
        setEnquiryLoading(true);
        setBeneficiaryInfo(null); // Clear previous data

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
      console.log("recipientBank", recipientBank);
      console.log("accountNumber", accountNumber);

      if (accountNumber?.length === 10) {
        setEnquiryLoading(true);
        setBeneficiaryInfo(null); // Clear previous beneficiary info

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
      id: business_id,
      search: searchTerm,
      type: type,
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "EXPENSES",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  return {
    BankData,
    TrxData,
    TrxDataLoading,
    user,
    BankDataLoading,
    BankTrxData,
    CategoriesData,
    TransferFundsLoading,
    handleSubmitTransferFunds,
    CategoriesDataLoading,
    beneficiaryInfo,
    enquiryLoading,
    triggerBeneficiaryEnquiry,
  };
};
