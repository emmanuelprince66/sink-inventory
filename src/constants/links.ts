// constants/links.ts
import {
  Activity,
  BadgeDollarSignIcon,
  BellIcon,
  ClipboardList,
  CreditCard,
  DollarSign,
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
        roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
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
        roles: ["OWNER", "ADMIN-ATTENDANT"],
      },
      {
        title: "Inventory",
        url: "/inventory",
        icon: Package,
        roles: ["OWNER", "ADMIN-ATTENDANT"],
      },
      {
        title: "Sales",
        url: "/sales",
        icon: Percent,
        roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
      },
      {
        title: "Expenses",
        url: "/expenses",
        icon: DollarSign,
        roles: ["OWNER"],
      },
      {
        title: "Orders",
        url: "/orders",
        icon: ClipboardList,
        roles: ["OWNER", "ADMIN-ATTENDANT" , "ATTENDANT"],
      },
      {
        title: "Supplier",
        url: "/supply",
        icon: Truck,
        roles: ["OWNER"],
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
        roles: ["OWNER", "ADMIN-ATTENDANT"],
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
        roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
      },
      {
        title: "Payment Terminal",
        url: "/payment-terminal",
        icon: BadgeDollarSignIcon,
        roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
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
        roles: ["OWNER"],
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
      },
      {
        title: "Shipping",
        url: "/shipping",
        icon: Truck,
        roles: ["OWNER", "ADMIN-ATTENDANT"],
      },
      {
        title: "Online Payment",
        url: "/online-payment",
        icon: BadgeDollarSignIcon,
        roles: ["OWNER", "ADMIN-ATTENDANT"],
      },
      {
        title: "E-Pricing Setup",
        url: "/e-setup",
        icon: SettingsIcon,
        roles: ["OWNER", "ADMIN-ATTENDANT"],
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
      },
    ],
  },
];
