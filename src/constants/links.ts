// constants/links.ts
import {
  AirVent,
  ChartSpline,
  DollarSign,
  Home,
  PcCase,
  Settings,
  ShoppingBag,
  SquarePercent,
  UsersRound,
  WorkflowIcon,
} from "lucide-react";

export const links = [
  {
    title: "Point Of Sales",
    url: "/pos",
    icon: PcCase,
    roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"], // All roles can access
  },
  {
    title: "Overview",
    url: "/overview",
    icon: Home,
    roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
  },
  {
    title: "Customers",
    url: "/customers",
    icon: UsersRound,
    roles: ["OWNER", "ADMIN-ATTENDANT"],
  },
  // {
  //   title: "Orders",
  //   url: "/orders",
  //   icon: BookCopyIcon,
  //   roles: ["OWNER", "ADMIN-ATTENDANT"],
  // },
  {
    title: "Supplier",
    url: "/supply",
    icon: AirVent,
    roles: ["OWNER"],
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: DollarSign,
    roles: ["OWNER"],
  },
  // {
  //   title: "Transactions",
  //   url: "/transactions",
  //   icon: FaMoneyBillWave,
  //   roles: ["OWNER"], // Only OWNER can access
  // },
  {
    title: "Campaign",
    url: "/campaign",
    icon: WorkflowIcon,
    roles: ["OWNER"], // Only OWNER can access
  },
  {
    title: "Sales",
    url: "/sales",
    icon: SquarePercent,
    roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: ShoppingBag,
    roles: ["OWNER", "ADMIN-ATTENDANT"],
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartSpline,
    roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
  },
];
