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
} from "lucide-react";
export const links = [
  {
    title: "Point Of Sales",
    url: "/pos",
    icon: PcCase,
  },
  {
    title: "Overview",
    url: "/overview",
    icon: Home,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: UsersRound,
  },
  {
    title: "Supplier",
    url: "/supply",
    icon: AirVent,
  },

  // {
  //   title: "Business",
  //   url: "/business",
  //   icon: Handshake,
  // },
  {
    title: "Expenses",
    url: "/expenses",
    icon: DollarSign,
  },
  {
    title: "Sales",
    url: "/sales",
    icon: SquarePercent,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: ShoppingBag,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartSpline,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];
