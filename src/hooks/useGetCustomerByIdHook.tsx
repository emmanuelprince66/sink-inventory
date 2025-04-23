import { useFetchCustomerById } from "@/api/customer/fetch-customer-by-id";
import { useFetchCustomerPurchaseHistory } from "@/api/customer/fetch-customer-purchase-history";
import { useFetchCustomerWalletTrx } from "@/api/customer/fetch-customer-wallet-trx";

export const useGetCustomerByIdHook = (id?: string) => {
  const { data: CustomerData, isLoading: CustomerLoading } =
    useFetchCustomerById(id);
  const {
    data: CustomerPurchaseHistory,
    isLoading: CustomerPurchaseHistoryLoading,
  } = useFetchCustomerPurchaseHistory(id);
  const { data: CustomerWalletTrx, isLoading: CustomerWalletTrxLoading } =
    useFetchCustomerWalletTrx(id);

  const handleHistoryRowClick = (row: any) => {
    console.log("Clicked row:", row.original);
  };

  const handleWalletTrxRowClick = (row: any) => {
    console.log("Clicked row yy:", row.original);
  };
  return {
    CustomerData,
    CustomerLoading,
    CustomerPurchaseHistory,
    CustomerWalletTrx,
    handleWalletTrxRowClick,
    handleHistoryRowClick,
    CustomerWalletTrxLoading,
    CustomerPurchaseHistoryLoading,
  };
};
