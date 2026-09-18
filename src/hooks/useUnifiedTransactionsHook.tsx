import { useFetchTransactionQuery } from "@/api/transactions/fetch-transactions";
import { useBusinessBanks } from "@/hooks/useBusinessBanks";
import { DateRange } from "react-day-picker";
import moment from "moment";

export type UnifiedTransactionFilter = "ALL" | "CREDIT" | "DEBIT" | "ONLINE" | "BNPL";

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
  const isBnpl = filter === "BNPL";
  const walletType = filter === "CREDIT" || filter === "DEBIT" ? filter : "";

  const walletQuery = useFetchTransactionQuery({
    params: {
      id: selectedBankId || "",
      page,
      limit: 20,
      search: searchInput,
      type: walletType,
      mode: isOnline ? "ONLINE" : "",
      is_bnpl: isBnpl ? true : undefined,
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
