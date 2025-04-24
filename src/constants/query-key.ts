import { create } from "domain";

export const queryKey = {
  business: {
    getAllBusiness: "get-all-business",
    createBusiness: "create-business",
  },
  auth: {
    login: "login",
    signup: "signup",
    logout: "logout",
    verifyOtp: "verifyOtp",
  },
  customers: {
    getAllCustomers: "get-all-customers",
    createCustomer: "create-customer",
    getCustomerById: "get-customer-by-id",
    customerPurchaseHistory: "customer-purchase-history",
    customerWalletTrx: "customer-wallet-trx",
    updateWalletBalance: "update-wallet-balance",
  },
};
