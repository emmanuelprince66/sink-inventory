"use client";

import { useFetchCustomerTransactionsQuery } from "@/api/customer/fetch-customer-transactions";
import type {
  CustomerTransactionType,
  TransactionFlow,
  TransactionStatus,
} from "@/types/customerTransaction";
import { useCallback, useState } from "react";

/**
 * The customer's transaction ledger, with its filters and paging.
 *
 * Every filter resets the page. Without that, narrowing to LOYALTY while on
 * page 4 asks for a page that no longer exists and the list comes back empty —
 * which reads as "no loyalty events" rather than "wrong page".
 */
export const useCustomerTransactions = (id: string) => {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<CustomerTransactionType>("ALL");
  const [flow, setFlow] = useState<TransactionFlow | undefined>();
  const [status, setStatus] = useState<TransactionStatus | undefined>();

  const { data, isLoading, isFetching } = useFetchCustomerTransactionsQuery({
    params: { id, page, limit: 10, type, flow, status },
  });

  const payload = data?.data;

  const changeType = useCallback((next: CustomerTransactionType) => {
    setType(next);
    setPage(1);
  }, []);

  const changeFlow = useCallback((next?: TransactionFlow) => {
    setFlow(next);
    setPage(1);
  }, []);

  const changeStatus = useCallback((next?: TransactionStatus) => {
    setStatus(next);
    setPage(1);
  }, []);

  return {
    summary: payload?.summary,
    rows: payload?.results ?? [],
    total: payload?.total ?? 0,
    pages: payload?.pages ?? 1,
    page,
    setPage,
    type,
    changeType,
    flow,
    changeFlow,
    status,
    changeStatus,
    isLoading,
    // isFetching so paging and filtering dim the current rows rather than
    // blanking the whole tab back to a skeleton.
    isFetching,
    hasFilters: type !== "ALL" || !!flow || !!status,
  };
};

export type CustomerTransactionsApi = ReturnType<
  typeof useCustomerTransactions
>;
