// constants/links.ts
import {
  Activity,
  BadgeDollarSignIcon,
  BellIcon,
  ClipboardList,
  CreditCard,
  DollarSign,
  FlaskConical,
  History,
  LayoutDashboard,
  Megaphone,
  Package,
  Percent,
  Settings,
  SettingsIcon,
  ShoppingCart,
  Store,
  Truck,
  Users,
} from "lucide-react";

export const links = [
  {
    title: "Point of Sale",
    items: [
      {
        title: "POS Terminal",
        url: "/pos",
        icon: ShoppingCart,
        roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT", "PHARMACIST"],
        permission: "process_sales", // Required permission to see this link
      },
    ],
  },

  {
    title: "Main Menu",
    items: [
      {
        title: "Overview",
        url: "/overview",
        icon: LayoutDashboard,
        roles: [
          "OWNER",
          "ADMIN-ATTENDANT",
          "PRODUCTION-MANAGER",
          "INVENTORY-MANAGER",
        ],
        permission: null, // No specific permission needed (role-based only)
      },
      {
        title: "Sales",
        url: "/sales",
        icon: Percent,
        roles: [
          "OWNER",
          "ADMIN-ATTENDANT",
          "ATTENDANT",
          "ACCOUNTANT",
          "PHARMACIST",
          "PRODUCTION-MANAGER",
        ],
        permission: "view_orders", // Maps to their ability to see sales/orders
      },
      {
        title: "Expenses",
        url: "/expenses",
        icon: DollarSign,
        roles: ["OWNER", "ACCOUNTANT"],
        permission: null,
      },
      {
        title: "Orders",
        url: "/orders",
        icon: ClipboardList,
        roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT", "ACCOUNTANT"],
        permission: "view_orders", // Required permission
      },
      {
        title: "Supplier",
        url: "/supply",
        icon: Truck,
        roles: ["OWNER", "ACCOUNTANT", "INVENTORY-MANAGER"],
        permission: "manage_suppliers",
      },
    ],
  },
  {
    title: "Inventory Management",
    items: [
      {
        title: "Inventory",
        url: "/inventory",
        icon: Package,
        roles: [
          "OWNER",
          "ADMIN-ATTENDANT",
          "INVENTORY-MANAGER",
          "PRODUCTION-MANAGER",
          "ACCOUNTANT",
        ],
        permission: "view_inventory", // Everyone needs this to see inventory
      },
      {
        title: "Restock History",
        url: "/inventory/restock-history",
        icon: History,
        roles: [
          "OWNER",
          "ADMIN-ATTENDANT",
          "INVENTORY-MANAGER",
          "PRODUCTION-MANAGER",
          "ACCOUNTANT",
        ],
        permission: "restock_products", // Only who can restock can see history
      },
      {
        title: "Product History",
        url: "/inventory/product-history",
        icon: ClipboardList,
        roles: [
          "OWNER",
          "ADMIN-ATTENDANT",
          "INVENTORY-MANAGER",
          "PRODUCTION-MANAGER",
          "ACCOUNTANT",
        ],
        permission: "restock_products", // Only who can restock can see history
      },
      {
        title: "Production History",
        url: "/inventory/production-history",
        icon: FlaskConical,
        roles: [
          "OWNER",
          "ADMIN-ATTENDANT",
          "INVENTORY-MANAGER",
          "PRODUCTION-MANAGER",
          "ACCOUNTANT",
        ],
        permission: "move_items_to_production", // Only who can do production
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
        roles: ["OWNER", "ADMIN-ATTENDANT", "ACCOUNTANT"],
        permission: null,
      },
    ],
  },
  {
    title: "Payment",
    items: [
      {
        title: "Transactions",
        url: "/transactions",
        icon: CreditCard,
        roles: [
          "OWNER",
          "ADMIN-ATTENDANT",
          "ATTENDANT",
          "PHARMACIST",
          "ACCOUNTANT",
        ],
        permission: "view_transactions", // Accountant needs this permission
      },
      {
        title: "Payment Terminal",
        url: "/payment-terminal",
        icon: BadgeDollarSignIcon,
        roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
        permission: "process_sales",
      },
    ],
  },
  {
    title: "Notifications",
    items: [
      {
        title: "Notifications",
        url: "/notification",
        icon: BellIcon,
        roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
        permission: null, // Everyone can see notifications
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        title: "Campaign",
        url: "/campaign",
        icon: Megaphone,
        roles: ["OWNER"],
        permission: null,
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        title: "Analytics",
        url: "/analytics",
        icon: Activity,
        roles: ["OWNER", "ADMIN-ATTENDANT", "ACCOUNTANT"],
        permission: "view_transactions", // Analytics tied to viewing transactions
      },
    ],
  },
  {
    title: "Store Management",
    items: [
      {
        title: "Store Information",
        url: "/store-info",
        icon: Store,
        roles: ["OWNER", "ADMIN-ATTENDANT"],
        permission: null,
      },
      {
        title: "Shipping",
        url: "/shipping",
        icon: Truck,
        roles: ["OWNER", "ADMIN-ATTENDANT"],
        permission: null,
      },
      {
        title: "Online Payment",
        url: "/online-payment",
        icon: BadgeDollarSignIcon,
        roles: ["OWNER", "ADMIN-ATTENDANT"],
        permission: null,
      },
      {
        title: "E-Pricing Setup",
        url: "/e-setup",
        icon: SettingsIcon,
        roles: ["OWNER", "ADMIN-ATTENDANT"],
        permission: null,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "General Settings",
        url: "/operations/general-settings",
        icon: Settings,
        roles: ["OWNER", "ADMIN-ATTENDANT"],
        permission: null,
      },
      {
        title: "Connected Apps",
        url: "/operations/connected-apps",
        icon: Activity,
        roles: ["OWNER", "ADMIN-ATTENDANT"],
        permission: null,
      },
    ],
  },
  {
    title: "Administrator",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
        permission: null,
      },
    ],
  },
];
