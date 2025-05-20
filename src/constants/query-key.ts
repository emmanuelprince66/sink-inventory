export const queryKey = {
  business: {
    getAllBusiness: "get-all-business",
    createBusiness: "create-business",
    getBusinessById: "get-business-by-id",
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
    deleteCustomer: "delete-customer",
  },
  supplier: {
    getAllSuppliers: "get-all-suppliers",
    getSingleSupplier: "get-single-supplier",
    createSupplier: "create-supplier",
    updateWallet: "update-wallet",
    deleteSupplier: "delete-supplier",
  },
  sales: {
    getAllSalesHistory: "get-all-sales",
    getAllOrdersHistory: "get-all-orders",
    createSale: "create-sale",
    reverseSale: "reverse-sale",
  },
  analytics: {
    getSalesAnalytics: "get-sales-analytics",
    getProductAnalytics: "get-product-analytics",
    getCustomerAnalytics: "get-customer-analytics",
  },
  inventory: {
    getAllInventory: "get-all-inventory",
    addService: "add-service",
  },
  products: {
    getProductsById: "get-products-by-id",
    getRestockHistory: "restock-history",
    addRestockItem: "add-restock-item",
    deleteProduct: "delete-product",
    deleteService: "delete-service",
    editProduct: "edit-product",
    editService: "edit-service",
    transferProduct: "transfer-product",
    bulkUpload: "bulk-upload",
  },
  categories: {
    getAllCategories: "get-all-categories",
    updateCategory: "update-category",
  },
  bank: {
    getAllBanks: "get-all-banks",
  },
};
