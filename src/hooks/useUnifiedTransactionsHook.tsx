import { useFetchTransactionQuery } from "@/api/transactions/fetch-transactions";
import { useBusinessBanks } from "@/hooks/useBusinessBanks";
import { DateRange } from "react-day-picker";
import moment from "moment";

/**
 * BNPL is not one of these on purpose. A pending settlement is not a wallet
 * transaction — the money has not arrived — so it has its own section and its
 * own endpoint rather than a filter over this list.
 */
export type UnifiedTransactionFilter = "ALL" | "CREDIT" | "DEBIT" | "ONLINE";

export const useUnifiedTransactionsHook = ({
  page,
  searchInput,
  dateRange,
  filter,
}: {
  page: number;
  searchInput: string;
  dateRange?: DateRange;
  filter: UnifiedTransactionFilter;
}) => {
  const { selectedBankId } = useBusinessBanks();
  const isOnline = filter === "ONLINE";
  const walletType = filter === "CREDIT" || filter === "DEBIT" ? filter : "";

  const walletQuery = useFetchTransactionQuery({
    params: {
      id: selectedBankId || "",
      page,
      limit: 20,
      search: searchInput,
      type: walletType,
      mode: isOnline ? "ONLINE" : "",
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
    },
    enabled: !!selectedBankId,
  });

  const walletTransactions =
    walletQuery.data?.data?.results?.transactions || [];

  return {
    loading: walletQuery.isLoading,
    response: walletQuery.data,
  };
};
