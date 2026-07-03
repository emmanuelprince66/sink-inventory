import { useState, useRef, useEffect } from "react";
import {
  Home, Package, BarChart2, Settings, Bell, ShoppingCart, Search, Filter,
  ChevronDown, ArrowRight, TrendingUp, Plus, Minus, ScanLine, Users, CreditCard,
  PlusCircle, ArrowUpRight, ChevronRight, CheckCircle, AlertCircle, Info,
  AlertTriangle, X, Eye, EyeOff, Loader2, Receipt, Crown, Building2, Check,
  Camera, Phone, Megaphone, ArrowDownLeft, ArrowUpRight as ArrowOut, Wallet,
  Truck, Zap, Flame, Wrench, Briefcase, ShoppingBag, Cpu,
  CalendarDays, Download, Copy, Clock, Star,
  MoreVertical, Send, UserCheck, Activity, FileText,
  Tag, RotateCcw, Trash2, ArrowLeftRight, AlertOctagon, PackagePlus,
  Pencil, Info as InfoIcon, Percent, MoreHorizontal,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const DS = {
  primary: "#1b3228", secondary1: "#329661", secondary2: "#7bbe5e",
  secondary3: "#a8d87b", secondary4: "#c8e9a8", secondary5: "#dff0c5",
  secondary6: "#eef7e0",
  info1: "#3182ce", info2: "#bee3f8",
  warning1: "#d97706", warning2: "#fef3c7",
  error1: "#e53e3e", error2: "#fed7d7",
  success1: "#38a169", success2: "#c6f6d5",
  grey1: "#111827", grey2: "#374151", grey3: "#6b7280",
  grey4: "#9ca3af", grey5: "#d1d5db", grey6: "#f3f4f6",
  orange: "#f97316",
};
const NUN = { fontFamily: "Nunito, sans-serif" };

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "home" | "inventory" | "search" | "customers" | "expenses"
  | "orders" | "transactions" | "logistics" | "subscriptions" | "add-business" | "sales";

interface Product {
  id: number; name: string; qty: number | string; dept: string; sku: string;
  status: "IN-STOCK" | "OUT-OF-STOCK" | "LOW"; costPrice: number; sellingPrice: number;
  category: string; variants?: number; color: string;
}
interface CartItem { id: number; name: string; price: number; qty: number; color: string; }

// ─── Mock data ────────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  { id: 1, name: "RAW RICE LONG BAG", qty: 26, dept: "Raw Materials", sku: "-", status: "IN-STOCK", costPrice: 10000, sellingPrice: 15000, category: "Grocery", color: "#fde68a" },
  { id: 2, name: "juice pack3", qty: 0, dept: "Supermarket", sku: "trttf76", status: "OUT-OF-STOCK", costPrice: 3500, sellingPrice: 5000, category: "Drinks", color: "#fca5a5" },
  { id: 3, name: "Captain Oil", qty: 308, dept: "Supermarket", sku: "-", status: "IN-STOCK", costPrice: 150, sellingPrice: 200, category: "CREAM", variants: 4, color: "#86efac" },
  { id: 4, name: "Captain Oil", qty: 193, dept: "Supermarket", sku: "-", status: "IN-STOCK", costPrice: 800, sellingPrice: 1000, category: "CREAM", variants: 4, color: "#6ee7b7" },
  { id: 5, name: "fullman man", qty: 8, dept: "Supermarket", sku: "-", status: "IN-STOCK", costPrice: 150, sellingPrice: 200, category: "Hair", variants: 4, color: "#93c5fd" },
  { id: 6, name: "Captain Oil", qty: 12, dept: "Supermarket", sku: "-", status: "IN-STOCK", costPrice: 150, sellingPrice: 200, category: "CREAM", variants: 4, color: "#c4b5fd" },
  { id: 7, name: "Mr V", qty: 13.9, dept: "Supermarket", sku: "6156000264042", status: "LOW", costPrice: 200, sellingPrice: 250, category: "Menu", color: "#fdba74" },
  { id: 8, name: "Kings Vegetable Oil", qty: 44, dept: "Supermarket", sku: "KVO-001", status: "IN-STOCK", costPrice: 2800, sellingPrice: 3700, category: "Grocery", color: "#fde68a" },
  { id: 9, name: "Hollandia Milk", qty: 5, dept: "Supermarket", sku: "HM-003", status: "LOW", costPrice: 350, sellingPrice: 500, category: "Drinks", color: "#bae6fd" },
  { id: 10, name: "Aquame Water 75cl", qty: 120, dept: "Supermarket", sku: "AQW-75", status: "IN-STOCK", costPrice: 500, sellingPrice: 700, category: "Drinks", color: "#a5f3fc" },
];

const SHOP_PRODUCTS = [
  { id: 1, name: "Bata utton", price: 200, status: "IN STOCK", color: "#fde68a", category: "wears" },
  { id: 2, name: "Sync360 pro plus", price: 2500, status: "IN STOCK", color: "#86efac", category: "Electronics" },
  { id: 3, name: "Ophylia 200ML", price: 3500, status: "IN STOCK", color: "#c4b5fd", category: "CREAM" },
  { id: 4, name: "casto bojar 250ml", price: 250000, status: "IN STOCK", color: "#fca5a5", category: "CREAM" },
  { id: 5, name: "Martins Can 33cl", price: 6000, status: "IN STOCK", color: "#93c5fd", category: "Drinks" },
  { id: 6, name: "Kings oil", price: 3700, status: "LOW", color: "#fde68a", category: "Grocery" },
  { id: 7, name: "mase water", price: 250, status: "IN STOCK", color: "#a5f3fc", category: "Drinks" },
  { id: 8, name: "Aquame", price: 700, status: "IN STOCK", color: "#bae6fd", category: "Drinks" },
  { id: 9, name: "King", price: 1200, status: "IN STOCK", color: "#d9f99d", category: "Grocery" },
  { id: 10, name: "Car", price: 1500, status: "IN STOCK", color: "#fed7aa", category: "wears" },
  { id: 11, name: "Goco", price: 200, status: "OUT OF STOCK", color: "#fecdd3", category: "Drinks" },
  { id: 12, name: "Oafe", price: 350, status: "IN STOCK", color: "#e9d5ff", category: "CREAM" },
];

const SALES_DATA = [
  { sn: 1, name: "Dudu 350", unitSold: 7, revenue: 366199, vat: 0, profit: 324199, sku: "6196080497408", discount: 0 },
  { sn: 2, name: "major_food", unitSold: 5, revenue: 100000, vat: 0, profit: 99000, sku: "BB.2411180001", discount: 0 },
  { sn: 3, name: "television", unitSold: 3, revenue: 60000, vat: 0, profit: 59400, sku: "ttyyuu338", discount: 0 },
  { sn: 4, name: "television", unitSold: 2, revenue: 40000, vat: 0, profit: 39600, sku: "testlss", discount: 0 },
  { sn: 5, name: "Hollandia Milk 1L", unitSold: 18, revenue: 9000, vat: 0, profit: 8100, sku: "HM-001", discount: 0 },
  { sn: 6, name: "Kings Vegetable Oil", unitSold: 12, revenue: 44400, vat: 0, profit: 11400, sku: "KVO-001", discount: 12 },
  { sn: 7, name: "Aquame Water 75cl", unitSold: 44, revenue: 30800, vat: 0, profit: 17600, sku: "AQW-75", discount: 0 },
];

const CUSTOMERS = [
  { id: 1, name: "Tobi Olosunde", phone: "+234 8012345678", walletBalance: -50000 },
  { id: 2, name: "Lanre Omotosho", phone: "+234 8041568792", walletBalance: 50000 },
  { id: 3, name: "Faith Adewumi", phone: "+234 8031234567", walletBalance: 12500 },
  { id: 4, name: "Chidi Okeke", phone: "+234 7061234567", walletBalance: 0 },
  { id: 5, name: "Amaka Nwosu", phone: "+234 8091234567", walletBalance: -15000 },
  { id: 6, name: "Segun Adeyemi", phone: "+234 8051234567", walletBalance: 75000 },
];

const EXPENSE_CATS = [
  { name: "Salaries", icon: <Briefcase size={18} />, color: "#3182ce", bg: "#ebf8ff", spent: 320000, budget: 2000000, monthBudget: "₦333,333.33/mo", txCount: 1 },
  { name: "Logistics", icon: <Truck size={18} />, color: "#7c3aed", bg: "#f5f3ff", spent: 320000, budget: 500000, monthBudget: "₦83,333.33/mo", txCount: 1 },
  { name: "Fuel", icon: <Flame size={18} />, color: DS.orange, bg: "#fff7ed", spent: 75000, budget: 400000, monthBudget: "₦66,666.67/mo", txCount: 1 },
  { name: "Utilities", icon: <Zap size={18} />, color: "#d97706", bg: "#fffbeb", spent: 45000, budget: 400000, monthBudget: "₦66,666.67/mo", txCount: 1 },
  { name: "Transport", icon: <Truck size={18} />, color: "#0891b2", bg: "#ecfeff", spent: 28500, budget: 200000, monthBudget: "₦33,333.33/mo", txCount: 1 },
  { name: "Maintenance", icon: <Wrench size={18} />, color: "#059669", bg: "#ecfdf5", spent: 22000, budget: 200000, monthBudget: "₦33,333.33/mo", txCount: 1 },
  { name: "Marketing", icon: <Megaphone size={18} />, color: "#db2777", bg: "#fdf2f8", spent: 0, budget: 600000, monthBudget: "₦100,000/mo", txCount: 0 },
  { name: "Operations", icon: <Cpu size={18} />, color: "#6366f1", bg: "#eef2ff", spent: 0, budget: 300000, monthBudget: "₦50,000/mo", txCount: 0 },
];

const RECENT_ACTIVITY = [
  { cat: "Logistics", label: "Top up logistics float for the weekend run.", by: "Tobi Olosunde", status: "Completed", amount: 320000, time: "2 days ago" },
  { cat: "Marketing", label: "Q3 digital marketing campaign payment.", by: "Sarah Adeyemi", status: "Pending", amount: 180000, time: "3 days ago" },
  { cat: "Salaries", label: "June payroll disbursement.", by: "Tobi Olosunde", status: "Completed", amount: 320000, time: "5 days ago" },
];
const SPEND_BY_USER = [
  { name: "Tobi Olosunde", role: "Owner", amount: 320000, pct: 100 },
  { name: "Sarah Adeyemi", role: "Manager", amount: 320000, pct: 100 },
];

const ORDERS_DATA = [
  { id: "#02ac9a5d", paid: true, status: "DELIVERED", amount: 110, customer: "Samson Akinola", phone: "2348069482021", partner: "In-house Riders", partnerRating: 4.5, rider: "Ifeanyi Okeke", riderPhone: "+234 816 555 6677", date: "Feb 05, 1:27 PM" },
  { id: "#2e89edbb", paid: true, status: "DELIVERED", amount: 310, customer: "Olosunde Olosunde", phone: "2348149734622", partner: "In-house Riders", partnerRating: 4.5, rider: "Ifeanyi Okeke", riderPhone: "+234 816 555 6677", date: "Feb 03, 3:27 PM" },
  { id: "#6fccead1", paid: true, status: "PENDING", amount: 110, customer: "Olosunde Olosunde", phone: "2348149734622", partner: "Kwik Delivery", partnerRating: 4.4, rider: "Bola Adeyemi", riderPhone: "+234 805 444 5566", date: "Feb 03, 11:42 AM" },
  { id: "#69d1c25c", paid: true, status: "DELIVERED", amount: 110, customer: "Olosunde Olosunde", phone: "2348149734622", partner: "In-house Riders", partnerRating: 4.5, rider: "Ifeanyi Okeke", riderPhone: "+234 816 555 6677", date: "Feb 03, 11:17 AM" },
  { id: "#d889010a", paid: true, status: "PENDING", amount: 110, customer: "Olosunde Olosunde", phone: "2348149734622", partner: "In-house Riders", partnerRating: 4.5, rider: "Ifeanyi Okeke", riderPhone: "+234 816 555 6677", date: "Feb 03, 10:57 AM" },
  { id: "#ddf185e4", paid: true, status: "SHIPPED", amount: 110, customer: "Olosunde Olosunde", phone: "2348149734622", partner: "Kwik Delivery", partnerRating: 4.4, rider: "Bola Adeyemi", riderPhone: "+234 805 444 5566", date: "Feb 02, 11:42 AM" },
];

const TRANSACTIONS_DATA = [
  { sn: 1, id: "TXN-001-2024", customer: "Tobi Olosunde", type: "Credit", amount: 50000, account: "1040800190", date: "Jun 18, 2026", status: "Success" },
  { sn: 2, id: "TXN-002-2024", customer: "Lanre Omotosho", type: "Debit", amount: 15000, account: "1040800190", date: "Jun 17, 2026", status: "Success" },
  { sn: 3, id: "TXN-003-2024", customer: "Faith Adewumi", type: "Credit", amount: 75000, account: "1040800190", date: "Jun 16, 2026", status: "Pending" },
  { sn: 4, id: "TXN-004-2024", customer: "Chidi Okeke", type: "Debit", amount: 8500, account: "1040800190", date: "Jun 15, 2026", status: "Failed" },
  { sn: 5, id: "TXN-005-2024", customer: "Amaka Nwosu", type: "Credit", amount: 120000, account: "1040800190", date: "Jun 14, 2026", status: "Success" },
];

const CAMPAIGNS_DATA = [
  { sn: 1, name: "great", title: "great", channel: "SMS", users: 1, message: "captain" },
  { sn: 2, name: "Happy new month", title: "Happy", channel: "SMS", users: 1, message: "You have kept us in business and we want to appreciate you for patronizing us consistently. Thank you From Management" },
  { sn: 3, name: "Sales", title: "Sales", channel: "SMS", users: 1, message: "get 25% discount when you visit our website to shop www.toltim.ng" },
  { sn: 4, name: "string", title: "Yummy Sales", channel: "SMS", users: 2, message: "We are inviting you to our slash sales coming up soon" },
];

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function DSButton({ children, variant = "primary", size = "md", loading = false, disabled = false, onClick, className = "", icon, fullWidth = false }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg"; loading?: boolean; disabled?: boolean; onClick?: () => void;
  className?: string; icon?: React.ReactNode; fullWidth?: boolean;
}) {
  const sz = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" }[size];
  const v: Record<string, string> = {
    primary: "bg-[#1b3228] text-white hover:bg-[#263f33]",
    secondary: "bg-[#329661] text-white hover:bg-[#2a8055]",
    outline: "border border-[#329661] text-[#329661] hover:bg-[#eef7e0]",
    ghost: "text-[#329661] hover:bg-[#eef7e0]",
    danger: "bg-[#e53e3e] text-white hover:bg-[#c53030]",
  };
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all select-none ${sz} ${v[variant]} ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} ${fullWidth ? "w-full" : ""} ${className}`}
      style={NUN}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

function DSInput({ label, placeholder, type = "text", state = "default", helperText, value, onChange, readOnly }: {
  label?: string; placeholder?: string; type?: string;
  state?: "default" | "error" | "valid" | "disabled"; helperText?: string;
  value?: string; onChange?: (v: string) => void; readOnly?: boolean;
}) {
  const bc: Record<string, string> = { default: DS.grey5, error: DS.error1, valid: DS.success1, disabled: DS.grey5 };
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-bold" style={{ color: DS.grey2, ...NUN }}>{label}</label>}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-white transition-colors" style={{ borderColor: bc[state], background: readOnly ? DS.grey6 : "#fff" }}>
        <input type={type} placeholder={placeholder} value={value} readOnly={readOnly}
          disabled={state === "disabled"} onChange={e => onChange?.(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
          style={{ color: DS.grey1, ...NUN }} />
        {state === "valid" && <CheckCircle size={14} style={{ color: DS.success1 }} />}
        {state === "error" && <AlertCircle size={14} style={{ color: DS.error1 }} />}
      </div>
      {helperText && <p className="text-xs" style={{ color: state === "error" ? DS.error1 : DS.grey4, ...NUN }}>{helperText}</p>}
    </div>
  );
}

function DSSelect({ label, value, options, onChange, placeholder }: {
  label?: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-bold" style={{ color: DS.grey2, ...NUN }}>{label}</label>}
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2.5 pr-9 rounded-lg border bg-white text-sm outline-none focus:border-[#329661] transition-colors"
          style={{ borderColor: DS.grey5, color: value ? DS.grey1 : DS.grey4, ...NUN }}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: DS.grey3 }} />
      </div>
    </div>
  );
}

function DSAlert({ type, title, message, onClose }: {
  type: "info" | "warning" | "success" | "error"; title: string; message?: string; onClose?: () => void;
}) {
  const cfg = {
    info: { bg: DS.info2, border: DS.info1, icon: <Info size={16} />, ic: DS.info1 },
    warning: { bg: DS.warning2, border: DS.warning1, icon: <AlertTriangle size={16} />, ic: DS.warning1 },
    success: { bg: DS.success2, border: DS.success1, icon: <CheckCircle size={16} />, ic: DS.success1 },
    error: { bg: DS.error2, border: DS.error1, icon: <AlertCircle size={16} />, ic: DS.error1 },
  }[type];
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ background: cfg.bg, borderColor: cfg.border }}>
      <span style={{ color: cfg.ic }} className="mt-0.5 shrink-0">{cfg.icon}</span>
      <div className="flex-1"><p className="text-sm font-bold" style={{ color: DS.grey1, ...NUN }}>{title}</p>{message && <p className="text-xs mt-0.5" style={{ color: DS.grey2, ...NUN }}>{message}</p>}</div>
      {onClose && <button onClick={onClose}><X size={14} style={{ color: DS.grey4 }} /></button>}
    </div>
  );
}

function KPICard({ label, value, sub, dark = false, icon, accent }: {
  label: string; value: string; sub?: React.ReactNode; dark?: boolean; icon?: React.ReactNode; accent?: string;
}) {
  const bg = dark ? DS.primary : (accent ?? DS.secondary6);
  return (
    <div className="rounded-2xl p-6 flex items-start justify-between" style={{ background: bg }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: dark ? "rgba(255,255,255,0.55)" : DS.grey3, ...NUN }}>{label}</p>
        <p className="text-3xl font-extrabold mt-1" style={{ color: dark ? "#fff" : DS.primary, ...NUN }}>{value}</p>
        {sub && <div className="mt-2">{sub}</div>}
      </div>
      {icon && (
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.6)" }}>
          <span style={{ color: dark ? "#fff" : DS.secondary1 }}>{icon}</span>
        </div>
      )}
    </div>
  );
}

function formatNaira(n: number) { return "₦" + Math.abs(n).toLocaleString("en-NG"); }

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: DS.grey5 }}>
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  );
}

// ─── Product status badge ─────────────────────────────────────────────────────
function InvStatusBadge({ status }: { status: "IN-STOCK" | "OUT-OF-STOCK" | "LOW" }) {
  const cfg = {
    "IN-STOCK": { bg: "#dcfce7", color: "#16a34a", label: "IN-STOCK" },
    "OUT-OF-STOCK": { bg: "#ffedd5", color: "#c2410c", label: "OUT-OF-STOCK" },
    "LOW": { bg: DS.warning2, color: DS.warning1, label: "LOW" },
  }[status];
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold uppercase"
      style={{ background: cfg.bg, color: cfg.color, ...NUN }}>{cfg.label}</span>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ title, subtitle, cartCount = 0, actions }: {
  title: string; subtitle?: string; cartCount?: number; actions?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b shrink-0"
      style={{ borderColor: "rgba(27,50,40,0.08)", ...NUN }}>
      <div>
        <h1 className="text-xl font-extrabold" style={{ color: DS.grey1 }}>{title}</h1>
        <p className="text-xs font-medium mt-0.5" style={{ color: DS.grey3 }}>{subtitle ?? "Thursday, 19 June 2026"}</p>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="relative p-2.5 rounded-xl" style={{ background: DS.secondary6 }}>
          <Bell size={18} style={{ color: DS.primary }} />
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
            style={{ background: DS.error1, ...NUN }}>99+</span>
        </button>
        <button className="relative p-2.5 rounded-xl" style={{ background: DS.secondary6 }}>
          <ShoppingCart size={18} style={{ color: DS.primary }} />
          {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1" style={{ background: DS.secondary1, ...NUN }}>{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) {
  const main: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home size={17} /> },
    { id: "sales", label: "Sales", icon: <TrendingUp size={17} /> },
    { id: "inventory", label: "Inventory", icon: <Package size={17} /> },
    { id: "search", label: "Shop / POS", icon: <ShoppingBag size={17} /> },
    { id: "customers", label: "Customers", icon: <Users size={17} /> },
    { id: "expenses", label: "Expenses", icon: <Receipt size={17} /> },
    { id: "orders", label: "Orders", icon: <FileText size={17} /> },
    { id: "transactions", label: "Transactions", icon: <Wallet size={17} /> },
  ];
  const more: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: "logistics", label: "Logistics", icon: <Truck size={17} /> },
    { id: "subscriptions", label: "Subscriptions", icon: <Crown size={17} /> },
    { id: "add-business", label: "Add Business", icon: <Building2 size={17} /> },
  ];
  function NavBtn({ id, label, icon }: { id: Screen; label: string; icon: React.ReactNode }) {
    const isActive = active === id;
    return (
      <button onClick={() => onNav(id)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
        style={{ background: isActive ? DS.secondary1 : "transparent", color: isActive ? "#fff" : "rgba(255,255,255,0.55)", ...NUN }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; } }}>
        {icon}{label}
      </button>
    );
  }
  return (
    <aside className="w-60 min-h-screen flex flex-col shrink-0" style={{ background: DS.primary, ...NUN }}>
      <div className="px-6 pt-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: DS.secondary1 }}><ShoppingCart size={17} className="text-white" /></div>
          <div><p className="text-[10px] text-white/50 font-bold tracking-widest uppercase">Sink by</p><p className="text-sm font-extrabold text-white">MYCLIQ</p></div>
        </div>
      </div>
      <div className="px-4 py-4 border-b border-white/10">
        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white" style={{ background: DS.secondary1 }}>J</div>
          <span className="text-sm font-bold flex-1 text-left text-white">Jenny & Co.</span>
          <ChevronDown size={14} className="text-white/50" />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {main.map(p => <NavBtn key={p.id} {...p} />)}
        <div className="pt-3 mt-2 border-t border-white/10 space-y-0.5">
          <p className="px-3 pb-1 pt-1 text-[10px] font-extrabold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Account</p>
          {more.map(p => <NavBtn key={p.id} {...p} />)}
          <NavBtn id={"home" as Screen} label="Analytics" icon={<BarChart2 size={17} />} />
          <NavBtn id={"home" as Screen} label="Settings" icon={<Settings size={17} />} />
        </div>
      </nav>
      <div className="px-4 pb-6"><DSButton variant="secondary" fullWidth icon={<ShoppingCart size={16} />}>New Sale</DSButton></div>
    </aside>
  );
}

// ─── Restock Modal ────────────────────────────────────────────────────────────
function RestockModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [qty, setQty] = useState("");
  const [expiry, setExpiry] = useState("");
  const [costPrice, setCostPrice] = useState(String(product.costPrice));
  const [sellingPrice, setSellingPrice] = useState(String(product.sellingPrice));
  const [supplier, setSupplier] = useState("");
  const [payment, setPayment] = useState("");
  const [remark, setRemark] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl mx-4" style={NUN} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: DS.grey5 }}>
          <h2 className="text-base font-extrabold" style={{ color: DS.grey1 }}>Restock Product</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X size={16} style={{ color: DS.grey3 }} />
          </button>
        </div>
        {/* Form */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <DSInput label="Item Name" value={product.name} readOnly />
          {/* Stock Quantity with stepper */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold" style={{ color: DS.grey2, ...NUN }}>Stock Quantity</label>
            <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: DS.grey5 }}>
              <input type="number" placeholder="Enter Stock Quantity..." value={qty} onChange={e => setQty(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-white" style={{ color: DS.grey1, ...NUN }} />
              <div className="flex flex-col border-l" style={{ borderColor: DS.grey5 }}>
                <button onClick={() => setQty(String(Number(qty || 0) + 1))} className="px-2.5 py-1 hover:bg-gray-50 text-xs border-b" style={{ borderColor: DS.grey5, color: DS.grey3 }}>▲</button>
                <button onClick={() => setQty(String(Math.max(0, Number(qty || 0) - 1)))} className="px-2.5 py-1 hover:bg-gray-50 text-xs" style={{ color: DS.grey3 }}>▼</button>
              </div>
            </div>
          </div>
          {/* Expiry Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold" style={{ color: DS.grey2, ...NUN }}>Expiry Date</label>
            <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)}
              className="px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#329661]"
              style={{ borderColor: DS.grey5, color: DS.grey1, ...NUN }} />
          </div>
          <DSInput label="Cost Price" value={costPrice} onChange={setCostPrice} type="number" />
          <DSInput label="Selling Price" value={sellingPrice} onChange={setSellingPrice} type="number" />
          <DSSelect label="Supplier" value={supplier} placeholder="Select a Supplier"
            options={["Supplier A", "Supplier B", "Supplier C"]} onChange={setSupplier} />
          <DSSelect label="Payment Method" value={payment} placeholder="Select a payment method"
            options={["Cash", "Bank Transfer", "POS", "Credit"]} onChange={setPayment} />
          {/* Remark */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold" style={{ color: DS.grey2, ...NUN }}>Remark</label>
            <textarea value={remark} onChange={e => setRemark(e.target.value)}
              placeholder="Enter any additional remarks..." rows={3}
              className="px-3 py-2.5 rounded-lg border text-sm outline-none resize-none focus:border-[#329661]"
              style={{ borderColor: DS.grey5, color: DS.grey1, ...NUN }} />
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t" style={{ borderColor: DS.grey5 }}>
          <DSButton variant="secondary" fullWidth size="lg" onClick={onClose}>Save</DSButton>
        </div>
      </div>
    </div>
  );
}

// ─── Three-dot Action Dropdown ────────────────────────────────────────────────
const DROPDOWN_ACTIONS = [
  { label: "Edit Product Price", icon: <Pencil size={14} />, action: "edit-price" },
  { label: "View more details", icon: <InfoIcon size={14} />, action: "view-details" },
  { label: "Set Discount", icon: <Percent size={14} />, action: "set-discount" },
  { label: "Add Waste/Left Over", icon: <AlertOctagon size={14} />, action: "add-waste" },
  { label: "Add Returned Product", icon: <RotateCcw size={14} />, action: "add-returned" },
  { label: "Add Damaged Product", icon: <AlertTriangle size={14} />, action: "add-damaged" },
  { label: "Quick restock", icon: <PackagePlus size={14} />, action: "restock" },
  { label: "Transfer Product", icon: <ArrowLeftRight size={14} />, action: "transfer" },
  { label: "Delete Product", icon: <Trash2 size={14} />, action: "delete", danger: true },
];

function ActionDropdown({ onAction }: { onAction: (a: string) => void }) {
  return (
    <div className="absolute right-8 z-40 bg-white rounded-xl shadow-2xl border py-1.5 w-52"
      style={{ borderColor: DS.grey5, top: "50%", transform: "translateY(-20%)" }}>
      {DROPDOWN_ACTIONS.map(({ label, icon, action, danger }) => (
        <button key={action} onClick={() => onAction(action)}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-left hover:bg-gray-50 transition-colors"
          style={{ color: danger ? DS.error1 : DS.grey1, ...NUN }}>
          <span style={{ color: danger ? DS.error1 : DS.grey4 }}>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Inventory Screen ─────────────────────────────────────────────────────────
function InventoryScreen() {
  const [productTab, setProductTab] = useState("Products");
  const [dept, setDept] = useState("All Departments");
  const [cat, setCat] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);

  const depts = ["All Departments", "Club", "Raw Materials", "Mechanic", "Fashion", "Bakery", "Pharmacy", "Supermarket"];
  const cats = ["All Categories", "new test", "Stationaries", "Fragrance", "tables", "wears", "Bible", "Hair", "Menu", "Perfume", "CREAM", "Captain", "Drinks", "Grocery"];

  const filtered = PRODUCTS.filter(p =>
    (dept === "All Departments" || p.dept.toLowerCase() === dept.toLowerCase()) &&
    (cat === "All Categories" || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleAction(product: Product, action: string) {
    setOpenDropdown(null);
    if (action === "restock") setRestockProduct(product);
  }

  // Close dropdown on outside click
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenDropdown(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const inventoryValue = PRODUCTS.reduce((s, p) => s + p.costPrice * Number(p.qty), 0);
  const profit = PRODUCTS.reduce((s, p) => s + (p.sellingPrice - p.costPrice) * Number(p.qty), 0);
  const sellingTotal = PRODUCTS.reduce((s, p) => s + p.sellingPrice * Number(p.qty), 0);

  return (
    <div className="flex-1 overflow-y-auto" style={NUN} ref={wrapRef}>
      <TopBar title="Inventory"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold bg-white hover:bg-gray-50"
              style={{ borderColor: DS.grey5, color: DS.grey2 }}><FileText size={14} />Generate Report</button>
            <DSButton variant="secondary" size="sm" icon={<Plus size={14} />}>Add New <ChevronDown size={13} /></DSButton>
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-bold bg-white hover:bg-gray-50"
              style={{ borderColor: DS.grey5, color: DS.grey2 }}><MoreHorizontal size={15} />More</button>
          </div>
        } />

      <div className="px-8 py-6 space-y-5">
        {/* Overview */}
        <p className="text-sm font-bold" style={{ color: DS.grey2 }}>Overview</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-5" style={{ background: "#e0e7ff" }}>
            <div className="flex items-center gap-2 mb-3"><TrendingUp size={16} style={{ color: DS.info1 }} /><p className="text-xs font-bold" style={{ color: DS.info1 }}>Inventory Value</p></div>
            <p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>₦{inventoryValue.toLocaleString()}.20</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: DS.success2 }}>
            <div className="flex items-center gap-2 mb-3"><Tag size={16} style={{ color: DS.success1 }} /><p className="text-xs font-bold" style={{ color: DS.success1 }}>Profit</p></div>
            <p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>₦{profit.toLocaleString()}.10</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: DS.warning2 }}>
            <div className="flex items-center gap-2 mb-3"><Tag size={16} style={{ color: DS.warning1 }} /><p className="text-xs font-bold" style={{ color: DS.warning1 }}>Selling Price</p></div>
            <p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>₦{sellingTotal.toLocaleString()}.30</p>
          </div>
        </div>

        {/* Product / Services / Combos tabs */}
        <div className="border-b flex items-center gap-0" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          {[{ label: "Products", count: PRODUCTS.length }, { label: "Services", count: null }, { label: "Combos", count: null }].map(({ label, count }) => (
            <button key={label} onClick={() => setProductTab(label)}
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-colors"
              style={productTab === label ? { borderColor: DS.secondary1, color: DS.secondary1 } : { borderColor: "transparent", color: DS.grey3 }}>
              {label}
              {count !== null && <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold" style={{ background: DS.secondary6, color: DS.secondary1 }}>{count}</span>}
            </button>
          ))}
        </div>

        {/* Manage Products heading + search */}
        <div className="flex items-center justify-between">
          <p className="text-base font-extrabold" style={{ color: DS.grey1 }}>Manage Products</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: DS.grey4 }} />
              <input type="text" placeholder="Search Item, EAN..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#329661] w-52"
                style={{ borderColor: DS.grey5, color: DS.grey1, background: DS.grey6, ...NUN }} />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold bg-white hover:bg-gray-50"
              style={{ borderColor: DS.grey5, color: DS.grey2 }}><Filter size={14} />Filters</button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold bg-white hover:bg-gray-50"
              style={{ borderColor: DS.grey5, color: DS.grey2 }}>Manage Category</button>
          </div>
        </div>

        {/* Department filter */}
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: DS.grey3 }}>Department</p>
          <div className="flex items-center gap-2 flex-wrap">
            {depts.map(d => (
              <button key={d} onClick={() => setDept(d)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={dept === d ? { background: DS.secondary1, color: "#fff" } : { background: "#fff", border: `1px solid ${DS.grey5}`, color: DS.grey2 }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: DS.grey3 }}>Category</p>
          <div className="flex items-center gap-2 flex-wrap">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={cat === c ? { background: DS.secondary1, color: "#fff" } : { background: "#fff", border: `1px solid ${DS.grey5}`, color: DS.grey2 }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Products table */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(27,50,40,0.08)", background: DS.grey6 }}>
                {["S/N", "Product", "Quantity", "Department", "Sku", "Status", "Selling Price", "Action"].map((h, i) => (
                  <th key={h} className={`px-5 py-3.5 text-xs font-extrabold uppercase tracking-wide ${i >= 6 ? "text-right" : "text-left"}`}
                    style={{ color: DS.secondary1, ...NUN }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => (
                <tr key={product.id} className={`cursor-pointer transition-colors ${i < filtered.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "rgba(27,50,40,0.06)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = DS.grey6)}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>
                  <td className="px-5 py-3.5 text-sm font-medium" style={{ color: DS.grey3 }}>{product.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0"
                        style={{ background: product.color, color: DS.grey1 }}>
                        {product.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: DS.grey1 }}>{product.name}</p>
                        {product.variants && <p className="text-[11px] font-medium" style={{ color: DS.grey3 }}>({product.variants} variants)</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-bold"
                    style={{ color: product.status === "OUT-OF-STOCK" ? DS.orange : DS.grey1 }}>
                    {product.status === "OUT-OF-STOCK" ? `0 (Out of stock)` : product.qty}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium" style={{ color: DS.grey3 }}>{product.dept}</td>
                  <td className="px-5 py-3.5 text-sm font-medium" style={{ color: DS.grey3 }}>{product.sku}</td>
                  <td className="px-5 py-3.5"><InvStatusBadge status={product.status} /></td>
                  <td className="px-5 py-3.5 text-right text-sm font-extrabold" style={{ color: DS.grey1 }}>
                    ₦{product.sellingPrice.toLocaleString()}.00
                  </td>
                  <td className="px-5 py-3.5 text-right relative">
                    <button
                      onClick={e => { e.stopPropagation(); setOpenDropdown(openDropdown === product.id ? null : product.id); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: DS.grey3 }}>
                      <MoreVertical size={16} />
                    </button>
                    {openDropdown === product.id && (
                      <ActionDropdown onAction={action => handleAction(product, action)} />
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-sm font-bold" style={{ color: DS.grey3 }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {restockProduct && <RestockModal product={restockProduct} onClose={() => setRestockProduct(null)} />}
    </div>
  );
}

// ─── Shop / POS Screen ────────────────────────────────────────────────────────
function SearchScreen() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([
    { id: 3, name: "Ophylia 200ML", price: 3500, qty: 1, color: "#c4b5fd" },
    { id: 2, name: "Sync360 pro plus", price: 2500, qty: 1, color: "#86efac" },
  ]);
  const [saleTab] = useState(1);
  const [customer, setCustomer] = useState("");
  const [attendant, setAttendant] = useState("");

  const filtered = SHOP_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  function addToCart(p: typeof SHOP_PRODUCTS[0]) {
    if (p.status === "OUT OF STOCK") return;
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1, color: p.color }];
    });
  }

  function updateQty(id: number, delta: number) {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c).filter(c => c.qty > 0));
  }

  function removeFromCart(id: number) { setCart(prev => prev.filter(c => c.id !== id)); }

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const statusStyle = (s: string) =>
    s === "IN STOCK" ? { bg: "#dcfce7", color: "#16a34a" } :
    s === "LOW" ? { bg: DS.warning2, color: DS.warning1 } :
    { bg: "#ffedd5", color: "#c2410c" };

  return (
    <div className="flex h-full w-full overflow-hidden" style={NUN}>
      {/* ── Left: Products ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border-r" style={{ borderColor: "rgba(27,50,40,0.1)" }}>
        {/* POS top bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b shrink-0" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: DS.grey6 }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold" style={{ background: DS.secondary1, color: "#fff" }}>
              <ShoppingBag size={14} />Sale {saleTab}
              <span className="ml-1 w-4 h-4 rounded-full text-[10px] font-extrabold flex items-center justify-center" style={{ background: "rgba(255,255,255,0.3)" }}>
                {cart.length}
              </span>
            </div>
          </div>
          <DSButton variant="secondary" size="sm" icon={<Plus size={14} />}>New Sale</DSButton>
        </div>

        {/* Products heading + search */}
        <div className="flex items-center gap-3 px-5 py-3 border-b shrink-0" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <p className="text-base font-extrabold shrink-0" style={{ color: DS.grey1 }}>Products</p>
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: DS.grey4 }} />
            <input type="text" placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:border-[#329661]"
              style={{ borderColor: DS.grey5, color: DS.grey1, ...NUN }} />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-bold" style={{ borderColor: DS.secondary1, color: DS.secondary1 }}>
            <ScanLine size={15} />Scan
          </button>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {filtered.map(p => {
              const sc = statusStyle(p.status);
              const inCart = cart.some(c => c.id === p.id);
              return (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="group rounded-xl overflow-hidden border text-left transition-all hover:shadow-md"
                  style={{ borderColor: inCart ? DS.secondary1 : "rgba(27,50,40,0.1)", background: "#fff" }}>
                  {/* Product image area */}
                  <div className="relative h-28 flex items-center justify-center"
                    style={{ background: p.color }}>
                    <span className="text-3xl font-extrabold opacity-20 select-none" style={{ color: DS.grey1 }}>
                      {p.name.slice(0, 2).toUpperCase()}
                    </span>
                    {/* Stock badge overlay */}
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                        style={{ background: sc.bg, color: sc.color }}>{p.status}</span>
                    </div>
                    {inCart && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: DS.secondary1 }}>
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  {/* Product info */}
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-extrabold truncate" style={{ color: DS.grey1 }}>{p.name}</p>
                    <p className="text-sm font-extrabold mt-0.5" style={{ color: DS.secondary1 }}>₦{p.price.toLocaleString()}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right: Checkout ── */}
      <div className="w-80 shrink-0 flex flex-col bg-white" style={{ borderLeft: `1px solid rgba(27,50,40,0.08)` }}>
        <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <p className="text-base font-extrabold" style={{ color: DS.grey1 }}>Checkout</p>
        </div>

        {/* Add Customer / Attendant */}
        <div className="px-5 pt-4 space-y-2 shrink-0">
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold text-left transition-colors hover:bg-gray-50"
            style={{ borderColor: DS.grey5, color: DS.grey3 }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: DS.secondary6 }}>
              <Plus size={12} style={{ color: DS.secondary1 }} />
            </div>
            {customer || "Add Customer"}
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold text-left transition-colors hover:bg-gray-50"
            style={{ borderColor: DS.grey5, color: DS.grey3 }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: DS.secondary6 }}>
              <Plus size={12} style={{ color: DS.secondary1 }} />
            </div>
            {attendant || "Add Attendant"}
          </button>
        </div>

        {/* Cart items */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>Cart Items ({cart.length})</p>
          {cart.length > 0 && (
            <button onClick={() => setCart([])}
              className="text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors hover:bg-red-50"
              style={{ borderColor: DS.error1, color: DS.error1 }}>Clear Cart</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-2">
          {cart.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingBag size={32} className="mx-auto mb-2" style={{ color: DS.grey5 }} />
              <p className="text-xs font-semibold" style={{ color: DS.grey4 }}>Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="flex items-start gap-3 py-3 border-b" style={{ borderColor: "rgba(27,50,40,0.07)" }}>
              {/* Thumbnail */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xs font-extrabold"
                style={{ background: item.color, color: DS.grey1 }}>
                {item.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold truncate" style={{ color: DS.grey1 }}>{item.name}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: DS.secondary1 }}>₦{item.price.toLocaleString()}</p>
                <div className="flex items-center justify-between mt-2">
                  {/* Qty stepper */}
                  <div className="flex items-center gap-1.5 border rounded-lg px-1.5 py-0.5" style={{ borderColor: DS.grey5 }}>
                    <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100"><Minus size={10} /></button>
                    <span className="text-xs font-extrabold w-4 text-center" style={{ color: DS.grey1 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100"><Plus size={10} /></button>
                  </div>
                  <p className="text-xs font-extrabold" style={{ color: DS.grey1 }}>₦{(item.price * item.qty).toLocaleString()}</p>
                  <button onClick={() => removeFromCart(item.id)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50">
                    <X size={12} style={{ color: DS.error1 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary + complete */}
        <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold" style={{ color: DS.grey3 }}>Subtotal ({cart.length} items)</p>
              <p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>₦{subtotal.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
              <p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>Total</p>
              <p className="text-lg font-extrabold" style={{ color: DS.primary }}>₦{subtotal.toLocaleString()}</p>
            </div>
          </div>
          <DSButton variant="secondary" fullWidth size="lg" disabled={cart.length === 0}>Complete Order</DSButton>
        </div>
      </div>
    </div>
  );
}

// ─── Sales Screen ─────────────────────────────────────────────────────────────
function SalesScreen() {
  const [analyticsTab, setAnalyticsTab] = useState("Products Sold");
  const [salesFilter, setSalesFilter] = useState("All");
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [viewCombos, setViewCombos] = useState(false);

  const salesFilters = ["All", "Fast Moving", "Most Profitable", "Top Selling", "Discounted"];
  const saleCats = ["All", "new test", "Stationaries", "Fragrance", "tables", "wears", "Bible", "Hair", "Menu", "Perfume", "CREAM", "Captain", "Drinks", "Grocery"];

  const filtered = SALES_DATA.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (salesFilter === "All" || (salesFilter === "Discounted" && s.discount > 0) || (salesFilter === "Most Profitable" && s.profit > 50000) || (salesFilter === "Top Selling" && s.unitSold > 5))
  );

  const totalRevenue = SALES_DATA.reduce((s, d) => s + d.revenue, 0);
  const totalCost = SALES_DATA.reduce((s, d) => s + (d.revenue - d.profit), 0);
  const totalUnits = SALES_DATA.reduce((s, d) => s + d.unitSold, 0);
  const totalProfit = SALES_DATA.reduce((s, d) => s + d.profit, 0);
  const totalDiscount = SALES_DATA.reduce((s, d) => s + d.discount, 0);

  return (
    <div className="flex-1 overflow-y-auto" style={NUN}>
      <TopBar title="Sales" subtitle="Dec 28, 2025 – Jun 20, 2026"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold bg-white hover:bg-gray-50"
              style={{ borderColor: DS.grey5, color: DS.grey2 }}><Download size={14} />Download Report</button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold bg-white hover:bg-gray-50"
              style={{ borderColor: DS.grey5, color: DS.grey2 }}><FileText size={14} />Generate Report</button>
            <DSButton variant="secondary" size="sm" icon={<Users size={14} />}>Attendants</DSButton>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold bg-white hover:bg-gray-50"
              style={{ borderColor: DS.grey5, color: DS.grey2 }}><CalendarDays size={14} />Dec 28, 2025 – Jun 2...</button>
          </div>
        } />

      <div className="px-8 py-6 space-y-5">
        {/* Overview label */}
        <p className="text-sm font-bold border-b pb-2" style={{ color: DS.secondary1, borderColor: "rgba(27,50,40,0.08)" }}>Overview</p>

        {/* 6 KPI cards — 2 rows of 3 */}
        <div className="grid grid-cols-3 gap-4">
          {/* Row 1 */}
          <div className="rounded-2xl p-5" style={{ background: "#eff6ff" }}>
            <div className="flex items-center gap-2 mb-3"><CreditCard size={15} style={{ color: DS.info1 }} /><p className="text-xs font-bold" style={{ color: DS.info1 }}>Revenue</p></div>
            <p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>₦{totalRevenue.toLocaleString()}.00</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: DS.warning2 }}>
            <div className="flex items-center gap-2 mb-3"><Tag size={15} style={{ color: DS.warning1 }} /><p className="text-xs font-bold" style={{ color: DS.warning1 }}>Product Cost</p></div>
            <p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>₦{totalCost.toLocaleString()}.00</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "#f5f3ff" }}>
            <div className="flex items-center gap-2 mb-3"><Users size={15} style={{ color: "#7c3aed" }} /><p className="text-xs font-bold" style={{ color: "#7c3aed" }}>Items Sold</p></div>
            <p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>{totalUnits}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {/* Row 2 */}
          <div className="rounded-2xl p-5 relative" style={{ background: "#f5f3ff" }}>
            <div className="flex items-center gap-2 mb-3"><Percent size={15} style={{ color: "#7c3aed" }} /><p className="text-xs font-bold" style={{ color: "#7c3aed" }}>Total Discount</p></div>
            <p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>₦{totalDiscount.toLocaleString()}.00</p>
            <button className="absolute top-4 right-4 text-xs font-bold" style={{ color: DS.secondary1 }}>View More</button>
          </div>
          <div className="rounded-2xl p-5" style={{ background: DS.success2 }}>
            <div className="flex items-center gap-2 mb-3"><TrendingUp size={15} style={{ color: DS.success1 }} /><p className="text-xs font-bold" style={{ color: DS.success1 }}>Profit</p></div>
            <p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>₦{totalProfit.toLocaleString()}.00</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: DS.warning2 }}>
            <div className="flex items-center gap-2 mb-3"><Receipt size={15} style={{ color: DS.warning1 }} /><p className="text-xs font-bold" style={{ color: DS.warning1 }}>VAT</p></div>
            <p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>₦0.00</p>
          </div>
        </div>

        {/* Sales Analytics section */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
            <div className="flex items-center gap-3">
              <p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>Sales Analytics</p>
              <button className="p-1.5 rounded-lg hover:bg-gray-50" style={{ color: DS.grey4 }}><Settings size={14} /></button>
              {/* View Combo Sales toggle */}
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => setViewCombos(v => !v)}
                  className="relative w-9 h-5 rounded-full transition-colors"
                  style={{ background: viewCombos ? DS.secondary1 : DS.grey5 }}>
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: viewCombos ? "calc(100% - 18px)" : "2px" }} />
                </button>
                <span className="text-xs font-semibold" style={{ color: DS.grey3 }}>View Combo Sales</span>
              </div>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: DS.grey4 }} />
              <input type="text" placeholder="Search ..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-lg border text-sm focus:outline-none focus:border-[#329661] w-44"
                style={{ borderColor: DS.grey5, color: DS.grey1, ...NUN }} />
            </div>
          </div>

          {/* Products Sold / Order History tabs */}
          <div className="flex items-center border-b px-6" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
            {["Products Sold", "Order History"].map(t => (
              <button key={t} onClick={() => setAnalyticsTab(t)}
                className="px-4 py-3 text-sm font-bold border-b-2 transition-colors mr-2"
                style={analyticsTab === t ? { borderColor: DS.secondary1, color: DS.secondary1 } : { borderColor: "transparent", color: DS.grey3 }}>
                {t}
              </button>
            ))}
          </div>

          {/* Sales filter pills */}
          <div className="flex items-center gap-2 px-6 py-3 border-b flex-wrap" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
            {salesFilters.map(f => (
              <button key={f} onClick={() => setSalesFilter(f)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={salesFilter === f ? { background: DS.secondary1, color: "#fff" } : { background: "#fff", border: `1px solid ${DS.grey5}`, color: DS.grey2 }}>
                {f}
              </button>
            ))}
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 px-6 py-3 border-b overflow-x-auto flex-nowrap" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
            {saleCats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={cat === c ? { background: DS.secondary1, color: "#fff" } : { background: "#fff", border: `1px solid ${DS.grey5}`, color: DS.grey2 }}>
                {c}
              </button>
            ))}
          </div>

          {/* Sales table */}
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(27,50,40,0.08)", background: DS.grey6 }}>
                {["S/N", "Name", "Unit Sold", "Revenue", "VAT", "Profit", "SKU", "Discount"].map((h, i) => (
                  <th key={h} className={`px-6 py-3.5 text-xs font-extrabold uppercase tracking-wide ${i >= 2 ? "text-right" : "text-left"}`}
                    style={{ color: DS.secondary1, ...NUN }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.sn} className={`cursor-pointer transition-colors ${i < filtered.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "rgba(27,50,40,0.06)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = DS.grey6)}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>
                  <td className="px-6 py-4 text-sm font-medium" style={{ color: DS.grey3 }}>{row.sn}</td>
                  <td className="px-6 py-4 text-sm font-bold" style={{ color: DS.secondary1 }}>{row.name}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold" style={{ color: DS.secondary1 }}>{row.unitSold}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold" style={{ color: DS.secondary1 }}>₦{row.revenue.toLocaleString()}.00</td>
                  <td className="px-6 py-4 text-right text-sm font-medium" style={{ color: DS.grey3 }}>{row.vat}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold" style={{ color: DS.secondary1 }}>₦{row.profit.toLocaleString()}.00</td>
                  <td className="px-6 py-4 text-right text-sm font-medium" style={{ color: DS.grey3 }}>{row.sku}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium" style={{ color: DS.grey3 }}>{row.discount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeScreen() {
  const [alerts, setAlerts] = useState([
    { id: 1, type: "warning" as const, title: "Low Stock Alert", message: "5 items are running low on stock." },
    { id: 2, type: "success" as const, title: "Sales Target Met", message: "Today's target of ₦500,000 has been reached." },
  ]);
  return (
    <div className="flex-1 overflow-y-auto" style={NUN}>
      <TopBar title="Dashboard" />
      <div className="px-8 py-6 space-y-6">
        {alerts.length > 0 && <div className="space-y-2">{alerts.map(a => <DSAlert key={a.id} type={a.type} title={a.title} message={a.message} onClose={() => setAlerts(p => p.filter(x => x.id !== a.id))} />)}</div>}
        <div className="grid grid-cols-2 gap-4">
          <KPICard label="Today's Sales" value="₦500,000" icon={<TrendingUp size={20} />} sub={<div className="flex items-center gap-1 text-xs font-bold" style={{ color: DS.secondary1 }}><ArrowUpRight size={13} />+12.5% vs yesterday</div>} />
          <KPICard label="Current Balance" value="₦1,500,000" dark icon={<CreditCard size={20} />} sub={<p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Updated just now</p>} />
        </div>
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <p className="text-sm font-extrabold mb-4" style={{ color: DS.grey1 }}>Quick Actions</p>
          <div className="grid grid-cols-4 gap-3">
            {[{ icon: <TrendingUp size={22} />, label: "Sales", bg: DS.info2, color: DS.info1 }, { icon: <CreditCard size={22} />, label: "Expenses", bg: DS.warning2, color: DS.warning1 }, { icon: <Users size={22} />, label: "Customers", bg: "#ede9fe", color: "#7c3aed" }, { icon: <PlusCircle size={22} />, label: "Add Money", bg: DS.secondary6, color: DS.secondary1 }].map(({ icon, label, bg, color }) => (
              <button key={label} className="flex flex-col items-center gap-2.5 py-5 rounded-xl hover:opacity-80 transition-opacity" style={{ background: DS.grey6 }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: bg }}><span style={{ color }}>{icon}</span></div>
                <span className="text-xs font-bold" style={{ color: DS.grey2 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[{ tag: "Top Selling Products", tagBg: DS.secondary6, tagColor: DS.primary, name: "Moisturizing Shampoo", sub: "120 Units Sold From Stock" }, { tag: "Fast Moving Items", tagBg: "#ede9fe", tagColor: "#7c3aed", name: "Hair Dye - Red", sub: "Sold 40 Units Last Week" }].map(({ tag, tagBg, tagColor, name, sub }) => (
            <div key={name} className="bg-white rounded-2xl p-6 border" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold mb-3" style={{ background: tagBg, color: tagColor }}>{tag}</span>
              <h2 className="text-xl font-extrabold" style={{ color: DS.grey1 }}>{name}</h2>
              <div className="flex items-center gap-1.5 mt-3 text-sm font-bold" style={{ color: DS.secondary1 }}><ArrowUpRight size={14} />{sub}</div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "rgba(27,50,40,0.06)" }}>
                <span className="text-xs font-bold" style={{ color: DS.grey3 }}>View all products</span><ChevronRight size={14} style={{ color: DS.grey3 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(27,50,40,0.08)" }}><p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>Analytics</p><button className="flex items-center gap-1 text-xs font-bold" style={{ color: DS.secondary1 }}>View All <ArrowRight size={12} /></button></div>
          <table className="w-full"><tbody>{[{ label: "Total Purchases", value: "500", change: "+8%", pos: true }, { label: "New Customers", value: "50", change: "+15%", pos: true }, { label: "Returning Customers", value: "50%", change: "+3%", pos: true }, { label: "Online Orders", value: "10", change: "-2%", pos: false }].map(({ label, value, change, pos }, i, a) => (<tr key={label} className={i < a.length - 1 ? "border-b" : ""} style={{ borderColor: "rgba(27,50,40,0.06)" }}><td className="px-6 py-4 text-sm font-medium" style={{ color: DS.grey3 }}>{label}</td><td className="px-6 py-4 text-sm font-extrabold text-right" style={{ color: DS.grey1 }}>{value}</td><td className="px-6 py-4 text-right"><span className="text-xs font-bold" style={{ color: pos ? DS.success1 : DS.error1 }}>{change}</span></td></tr>))}</tbody></table>
        </div>
      </div>
    </div>
  );
}

// ─── Expenses ─────────────────────────────────────────────────────────────────
function ExpensesScreen() {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const totalSpent = EXPENSE_CATS.reduce((s, c) => s + c.spent, 0);
  return (
    <div className="flex-1 overflow-y-auto" style={NUN}>
      <TopBar title="Expenses" subtitle="Track and manage your business spending" />
      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-6 border bg-white" style={{ borderColor: "rgba(27,50,40,0.08)" }}><p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: DS.grey4 }}>Account Balance</p><p className="text-3xl font-extrabold" style={{ color: DS.grey1 }}>₦5,317,000.00</p><p className="text-xs font-semibold mt-2" style={{ color: DS.grey3 }}>VFD MFB · 0114-2388-77</p></div>
          <div className="rounded-2xl p-6 border bg-white" style={{ borderColor: "rgba(27,50,40,0.08)" }}><p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: DS.grey4 }}>Pending Approvals</p><p className="text-5xl font-extrabold" style={{ color: DS.grey1 }}>1</p><p className="text-xs font-semibold mt-2" style={{ color: DS.warning1 }}>₦180,000.00 awaiting</p></div>
          <div className="rounded-2xl p-6" style={{ background: DS.secondary6 }}><p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: DS.secondary1 }}>Spent This Month</p><p className="text-3xl font-extrabold" style={{ color: DS.primary }}>₦{totalSpent.toLocaleString()}.00</p><button className="flex items-center gap-1 text-xs font-bold mt-2" style={{ color: DS.secondary1 }}>Across 6 categories <ArrowRight size={12} /></button></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4"><div><p className="text-base font-extrabold" style={{ color: DS.grey1 }}>Spend by Category</p><p className="text-xs font-medium mt-0.5" style={{ color: DS.grey3 }}>Tap a category to view its transactions or transfer money against it.</p></div><DSButton variant="secondary" size="sm" icon={<Plus size={14} />}>Add Category</DSButton></div>
          <div className="grid grid-cols-5 gap-3">
            {EXPENSE_CATS.map(cat => {
              const pct = cat.budget > 0 ? Math.round((cat.spent / cat.budget) * 100) : 0;
              const isActive = activeCat === cat.name;
              return (
                <div key={cat.name} onClick={() => setActiveCat(isActive ? null : cat.name)}
                  className="bg-white rounded-2xl p-4 cursor-pointer transition-all"
                  style={{ border: `1.5px solid ${isActive ? cat.color : "rgba(27,50,40,0.08)"}` }}>
                  <div className="flex items-center gap-2 mb-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg, color: cat.color }}>{cat.icon}</div><div><p className="text-xs font-extrabold leading-tight" style={{ color: DS.grey1 }}>{cat.name}</p><p className="text-[10px] font-medium" style={{ color: DS.grey4 }}>6 month budget</p></div></div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: cat.color }}>~{cat.monthBudget}</p>
                  <p className="text-base font-extrabold" style={{ color: DS.grey1 }}>₦{cat.spent.toLocaleString()}.00</p>
                  <p className="text-[10px] font-medium mb-3" style={{ color: DS.grey3 }}>of ₦{cat.budget.toLocaleString()}.00</p>
                  <div className="mb-1"><ProgressBar pct={pct} color={cat.color} /></div>
                  <div className="flex items-center justify-between mb-3"><p className="text-[10px] font-semibold" style={{ color: DS.grey3 }}>Budget used</p><p className="text-[10px] font-extrabold" style={{ color: cat.color }}>{pct}%</p></div>
                  <p className="text-[10px] font-medium mb-3" style={{ color: DS.grey4 }}>{cat.txCount} transaction{cat.txCount !== 1 ? "s" : ""}</p>
                  <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "rgba(27,50,40,0.06)" }}>
                    <button className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold py-1.5 rounded-lg" style={{ color: DS.grey2, background: DS.grey6 }}><ArrowUpRight size={12} />Transfer</button>
                    <button className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold py-1.5 rounded-lg" style={{ color: cat.color, background: cat.bg }}>View more <ChevronRight size={11} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(27,50,40,0.08)" }}><p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>Recent Activity</p><p className="text-xs font-medium mt-0.5" style={{ color: DS.grey3 }}>Last transfers and logged expenses across every category.</p></div>
            <div className="divide-y">{RECENT_ACTIVITY.map((a, i) => { const c = EXPENSE_CATS.find(x => x.name === a.cat); return (<div key={i} className="px-6 py-4 flex items-start gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: c?.bg ?? DS.secondary6, color: c?.color ?? DS.secondary1 }}>{c?.icon}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-0.5"><p className="text-xs font-extrabold" style={{ color: DS.grey1 }}>{a.cat}</p><span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={a.status === "Completed" ? { background: DS.success2, color: DS.success1 } : { background: DS.warning2, color: DS.warning1 }}>{a.status}</span></div><p className="text-xs font-medium truncate" style={{ color: DS.grey3 }}>{a.label}</p><p className="text-[11px] font-medium mt-0.5" style={{ color: DS.grey4 }}>by {a.by}</p></div><div className="text-right shrink-0"><p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>₦{a.amount.toLocaleString()}.00</p><p className="text-[11px] font-medium" style={{ color: DS.grey4 }}>{a.time}</p></div></div>); })}</div>
          </div>
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(27,50,40,0.08)" }}><p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>Spend by User</p><p className="text-xs font-medium mt-0.5" style={{ color: DS.grey3 }}>Who initiated outgoing money this month.</p></div>
            <div className="px-6 py-4 space-y-5">{SPEND_BY_USER.map((u, i) => (<div key={i}><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold text-white" style={{ background: i === 0 ? DS.secondary1 : DS.info1 }}>{u.name.split(" ").map(n => n[0]).join("")}</div><div><p className="text-sm font-bold" style={{ color: DS.grey1 }}>{u.name}</p><p className="text-xs font-medium" style={{ color: DS.grey3 }}>{u.role}</p></div></div><p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>₦{u.amount.toLocaleString()}.00</p></div><ProgressBar pct={u.pct} color={i === 0 ? DS.secondary1 : DS.info1} /></div>))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Customers ────────────────────────────────────────────────────────────────
function CustomersScreen() {
  const [tab, setTab] = useState<"customers" | "campaigns">("customers");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignTab, setCampaignTab] = useState("Campaigns");
  const filtered = CUSTOMERS.filter(c => (filter === "Debts" ? c.walletBalance < 0 : true) && (c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)));
  const totalBalance = CUSTOMERS.reduce((s, c) => s + (c.walletBalance > 0 ? c.walletBalance : 0), 0);
  const totalDebt = CUSTOMERS.reduce((s, c) => s + (c.walletBalance < 0 ? Math.abs(c.walletBalance) : 0), 0);
  return (
    <div className="flex-1 overflow-y-auto" style={NUN}>
      <TopBar title="Customers" />
      <div className="px-8 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 border bg-white" style={{ borderColor: "rgba(27,50,40,0.08)" }}><p className="text-sm font-semibold" style={{ color: DS.grey3 }}>Total Wallet Balance</p><p className="text-2xl font-extrabold mt-1" style={{ color: DS.primary }}>₦{totalBalance.toLocaleString()}</p></div>
          <div className="rounded-2xl p-5 border bg-white" style={{ borderColor: "rgba(27,50,40,0.08)" }}><p className="text-sm font-semibold" style={{ color: DS.grey3 }}>Total Debt</p><p className="text-2xl font-extrabold mt-1" style={{ color: DS.error1 }}>₦{totalDebt.toLocaleString()}</p></div>
          <div className="rounded-2xl p-5 border bg-white" style={{ borderColor: "rgba(27,50,40,0.08)" }}><p className="text-sm font-semibold" style={{ color: DS.grey3 }}>Total Customers</p><p className="text-2xl font-extrabold mt-1" style={{ color: DS.grey1 }}>{CUSTOMERS.length}</p></div>
        </div>
        <div className="rounded-2xl p-6 border" style={{ background: DS.secondary6, borderColor: DS.secondary4 }}>
          <div className="flex items-start gap-3 mb-3"><Megaphone size={18} style={{ color: DS.primary }} /><p className="text-base font-extrabold" style={{ color: DS.primary }}>Engage Your Customers</p><ChevronRight size={16} style={{ color: DS.primary }} /></div>
          <p className="text-sm font-medium mb-4" style={{ color: DS.grey2 }}>Send personalized promotions, offers, and reminders to keep your customers coming back</p>
          <DSButton variant="secondary" icon={<Plus size={15} />}>Create a Campaign</DSButton>
        </div>
        <div className="flex items-center gap-2 p-1 rounded-xl w-fit" style={{ background: DS.grey6 }}>
          {(["customers", "campaigns"] as const).map(t => <button key={t} onClick={() => setTab(t)} className="px-6 py-2 rounded-lg text-sm font-bold transition-colors capitalize" style={tab === t ? { background: DS.secondary1, color: "#fff" } : { color: DS.grey3 }}>{t === "customers" ? "Customers" : "Campaigns"}</button>)}
        </div>
        {tab === "customers" ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">{["All", "Most Active", "Least Active", "Debts"].map(f => <button key={f} onClick={() => setFilter(f)} className="px-4 py-2 rounded-full text-sm font-bold transition-colors" style={filter === f ? { background: DS.secondary1, color: "#fff" } : { background: "#fff", border: `1px solid ${DS.grey5}`, color: DS.grey2 }}>{f}</button>)}</div>
              <div className="flex-1 relative"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: DS.grey4 }} /><input type="text" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border text-sm focus:outline-none focus:border-[#329661]" style={{ borderColor: DS.grey5, color: DS.grey1, ...NUN }} /></div>
              <DSButton variant="secondary" size="sm" icon={<Plus size={14} />}>Add Customer</DSButton>
            </div>
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
              <table className="w-full">
                <thead><tr className="border-b" style={{ borderColor: "rgba(27,50,40,0.08)", background: DS.grey6 }}>{["Customer", "Phone", "Wallet Balance", "Status", "Actions"].map((h, i) => <th key={h} className={`px-6 py-3.5 text-xs font-extrabold uppercase tracking-wide ${i >= 2 ? "text-right" : "text-left"}`} style={{ color: DS.grey3, ...NUN }}>{h}</th>)}</tr></thead>
                <tbody>{filtered.map((c, i) => (<tr key={c.id} className={`cursor-pointer ${i < filtered.length - 1 ? "border-b" : ""}`} style={{ borderColor: "rgba(27,50,40,0.06)" }} onMouseEnter={e => (e.currentTarget.style.background = DS.grey6)} onMouseLeave={e => (e.currentTarget.style.background = "")}><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold text-white" style={{ background: DS.secondary1 }}>{c.name.charAt(0)}</div><span className="text-sm font-bold" style={{ color: DS.grey1 }}>{c.name}</span></div></td><td className="px-6 py-4 text-sm font-medium" style={{ color: DS.grey3 }}><div className="flex items-center gap-1.5"><Phone size={13} style={{ color: DS.grey4 }} />{c.phone}</div></td><td className="px-6 py-4 text-right text-sm font-extrabold" style={{ color: c.walletBalance < 0 ? DS.error1 : DS.grey1 }}>{c.walletBalance < 0 ? "-" : ""}{formatNaira(c.walletBalance)}</td><td className="px-6 py-4 text-right">{c.walletBalance < 0 ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: DS.error2, color: DS.error1 }}>Owes debt</span> : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: DS.success2, color: DS.success1 }}>Active</span>}</td><td className="px-6 py-4 text-right"><button className="text-xs font-bold" style={{ color: DS.secondary1 }}>View</button></td></tr>))}</tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl p-5 border max-w-sm" style={{ background: DS.secondary6, borderColor: DS.secondary4 }}>
              <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Clock size={16} style={{ color: DS.secondary1 }} /><p className="text-sm font-extrabold" style={{ color: DS.primary }}>Message Credit</p></div><span className="px-2.5 py-1 rounded-full text-xs font-extrabold" style={{ background: DS.success2, color: DS.success1 }}>Active</span></div>
              <div className="flex items-end gap-6 mb-4"><div><p className="text-xs font-semibold" style={{ color: DS.grey3 }}>Available</p><p className="text-2xl font-extrabold" style={{ color: DS.primary }}>320 Credits</p></div><div><p className="text-xs font-semibold" style={{ color: DS.grey3 }}>Used</p><p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>702 Credits</p></div></div>
              <DSButton variant="secondary" size="sm" icon={<PlusCircle size={14} />}>Get Credits</DSButton>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-sm relative"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: DS.grey4 }} /><input type="text" placeholder="Search campaigns..." value={campaignSearch} onChange={e => setCampaignSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-sm focus:outline-none focus:border-[#329661]" style={{ borderColor: DS.grey5, color: DS.grey1, ...NUN }} /></div>
              <DSButton variant="outline" size="sm" icon={<Users size={14} />}>Create Group</DSButton>
              <DSButton variant="secondary" size="sm" icon={<Send size={14} />}>Send a Campaign</DSButton>
            </div>
            <div className="border-b flex items-center" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
              {["Campaigns", "Groups", "Usage", "Marketing Automation"].map(t => <button key={t} onClick={() => setCampaignTab(t)} className="px-4 py-3 text-sm font-bold border-b-2 transition-colors" style={campaignTab === t ? { borderColor: DS.secondary1, color: DS.secondary1 } : { borderColor: "transparent", color: DS.grey3 }}>{t}</button>)}
            </div>
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
              <table className="w-full">
                <thead><tr className="border-b" style={{ borderColor: "rgba(27,50,40,0.08)", background: DS.grey6 }}>{["S/N", "Name", "Title", "Channel", "Total User", "Message", "Action"].map((h, i) => <th key={h} className={`px-6 py-3.5 text-xs font-extrabold uppercase tracking-wide ${i === 6 ? "text-right" : "text-left"}`} style={{ color: DS.secondary1, ...NUN }}>{h}</th>)}</tr></thead>
                <tbody>{CAMPAIGNS_DATA.filter(c => c.name.toLowerCase().includes(campaignSearch.toLowerCase())).map((c, i, arr) => (<tr key={c.sn} className={`cursor-pointer ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: "rgba(27,50,40,0.06)" }} onMouseEnter={e => (e.currentTarget.style.background = DS.grey6)} onMouseLeave={e => (e.currentTarget.style.background = "")}><td className="px-6 py-4 text-sm font-medium" style={{ color: DS.grey3 }}>{c.sn}</td><td className="px-6 py-4 text-sm font-bold" style={{ color: DS.secondary1 }}>{c.name}</td><td className="px-6 py-4 text-sm font-medium" style={{ color: DS.grey1 }}>{c.title}</td><td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: DS.info2, color: DS.info1 }}>{c.channel}</span></td><td className="px-6 py-4 text-sm font-medium" style={{ color: DS.grey1 }}>{c.users}</td><td className="px-6 py-4 text-sm font-medium max-w-xs truncate" style={{ color: DS.grey3 }}>{c.message}</td><td className="px-6 py-4 text-right"><button className="p-1 rounded hover:bg-gray-100"><MoreVertical size={16} style={{ color: DS.grey4 }} /></button></td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Orders ───────────────────────────────────────────────────────────────────
function OrdersScreen() {
  const [orderTab, setOrderTab] = useState("Out-store Orders");
  const [statusTab, setStatusTab] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Today");
  const [search, setSearch] = useState("");
  const statusColors: Record<string, { bg: string; color: string }> = { DELIVERED: { bg: DS.success2, color: DS.success1 }, PENDING: { bg: DS.warning2, color: DS.warning1 }, SHIPPED: { bg: DS.info2, color: DS.info1 } };
  const filtered = ORDERS_DATA.filter(o => (statusTab === "All" || o.status === statusTab.toUpperCase()) && (o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)));
  return (
    <div className="flex-1 overflow-y-auto" style={NUN}>
      <TopBar title="Invoices and Orders" subtitle="Jun 20, 2026 – Jun 20, 2026" actions={<div className="flex items-center gap-2"><button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold bg-white" style={{ borderColor: DS.grey5, color: DS.grey2 }}><CalendarDays size={14} />Jun 20 – Jun 20</button><DSButton variant="secondary" size="sm" icon={<Plus size={14} />}>Create Order</DSButton><DSButton variant="outline" size="sm" icon={<Truck size={14} />}>Create Shipping</DSButton></div>} />
      <div className="px-8 py-6 space-y-5">
        <div className="grid grid-cols-5 gap-3">{[{ label: "Total Orders", value: "15", bg: "#eff6ff", color: DS.info1, icon: <ShoppingBag size={18} /> }, { label: "Completed Orders", value: "3", bg: DS.success2, color: DS.success1, icon: <CheckCircle size={18} /> }, { label: "Total Revenue", value: "₦42,936", bg: "#fdf2f8", color: "#db2777", icon: <TrendingUp size={18} /> }, { label: "Delivery Cost", value: "₦716", bg: DS.warning2, color: DS.warning1, icon: <Truck size={18} /> }, { label: "Total Link Visits", value: "39", bg: "#fff7ed", color: DS.orange, icon: <Activity size={18} /> }].map(({ label, value, bg, color, icon }) => (<div key={label} className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: bg }}><div className="flex items-center justify-between"><p className="text-xs font-bold" style={{ color }}>{label}</p><span style={{ color }}>{icon}</span></div><p className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>{value}</p></div>))}</div>
        <div className="flex items-center justify-between bg-white rounded-xl border px-4 py-3" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <div className="flex items-center gap-1">{["Instore order", "Out-store Orders"].map(t => (<button key={t} onClick={() => setOrderTab(t)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors" style={orderTab === t ? { background: DS.secondary6, color: DS.secondary1 } : { color: DS.grey3 }}>{t}{t === "Out-store Orders" && <span className="w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center" style={{ background: DS.secondary1, color: "#fff" }}>15</span>}</button>))}</div>
          <div className="flex items-center gap-2"><p className="text-xs font-medium" style={{ color: DS.grey3 }}>https://store.sync360.africa/olcap&</p><button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold" style={{ borderColor: DS.secondary1, color: DS.secondary1 }}><Copy size={12} />Copy URL</button></div>
        </div>
        <div className="border-b flex items-center" style={{ borderColor: "rgba(27,50,40,0.08)" }}>{["All", "Pending", "Processing", "Out for Delivery", "Delivered", "Cancelled"].map(t => <button key={t} onClick={() => setStatusTab(t)} className="px-4 py-3 text-sm font-bold border-b-2 transition-colors" style={statusTab === t ? { borderColor: DS.secondary1, color: DS.secondary1 } : { borderColor: "transparent", color: DS.grey3 }}>{t}</button>)}</div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">{["Today", "This Week", "This Month"].map(t => <button key={t} onClick={() => setTimeFilter(t)} className="px-4 py-1.5 rounded-full text-sm font-bold border transition-colors" style={timeFilter === t ? { background: DS.secondary1, color: "#fff", borderColor: DS.secondary1 } : { borderColor: DS.grey5, color: DS.grey2, background: "#fff" }}>{t}</button>)}</div>
          <div className="flex items-center gap-3 flex-1 max-w-lg ml-4"><div className="flex-1 relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: DS.grey4 }} /><input type="text" placeholder="Search by customer name, order ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border text-sm focus:outline-none focus:border-[#329661]" style={{ borderColor: DS.grey5, color: DS.grey1, ...NUN }} /></div><button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold bg-white" style={{ borderColor: DS.grey5, color: DS.grey2 }}><Filter size={14} />Filter</button><button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold bg-white" style={{ borderColor: DS.grey5, color: DS.grey2 }}><Download size={14} />Export</button></div>
        </div>
        <div className="grid grid-cols-3 gap-4">{filtered.map(order => { const sc = statusColors[order.status] ?? { bg: DS.grey6, color: DS.grey3 }; return (<div key={order.id} className="bg-white rounded-2xl border p-4 space-y-3 hover:shadow-md transition-shadow" style={{ borderColor: "rgba(27,50,40,0.08)" }}><div className="flex items-start justify-between"><div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-extrabold" style={{ color: DS.grey1 }}>{order.id}</span><span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold" style={{ background: DS.success2, color: DS.success1 }}>PAID</span><span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold" style={{ background: sc.bg, color: sc.color }}>{order.status}</span></div><span className="text-sm font-extrabold" style={{ color: DS.grey1 }}>₦{order.amount}</span></div><div><p className="text-sm font-bold" style={{ color: DS.grey1 }}>{order.customer}</p><p className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: DS.grey3 }}><Phone size={11} />{order.phone}</p></div><p className="text-xs font-medium flex items-center gap-1" style={{ color: DS.grey4 }}><Clock size={11} />{order.date}</p><div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: "rgba(27,50,40,0.06)" }}><div><p className="text-[10px] font-extrabold uppercase tracking-wide mb-1" style={{ color: DS.grey4 }}>Partner</p><div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white" style={{ background: DS.primary }}>{order.partner.split(" ").map(w => w[0]).join("").slice(0, 2)}</div><div><p className="text-xs font-bold" style={{ color: DS.grey1 }}>{order.partner}</p><div className="flex items-center gap-0.5"><Star size={9} fill={DS.warning1} style={{ color: DS.warning1 }} /><span className="text-[10px] font-bold" style={{ color: DS.warning1 }}>{order.partnerRating}</span></div></div></div></div><div><p className="text-[10px] font-extrabold uppercase tracking-wide mb-1" style={{ color: DS.grey4 }}>Rider</p><div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white" style={{ background: DS.secondary1 }}>{order.rider.split(" ").map(w => w[0]).join("").slice(0, 2)}</div><div><p className="text-xs font-bold" style={{ color: DS.grey1 }}>{order.rider}</p><p className="text-[10px]" style={{ color: DS.grey4 }}>{order.riderPhone}</p></div></div></div></div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: DS.grey4 }}>OUT-STORE</p><div className="flex items-center gap-2 pt-1"><DSButton variant="outline" size="sm" fullWidth icon={<UserCheck size={13} />}>Assign</DSButton><DSButton variant="secondary" size="sm" fullWidth>View More</DSButton></div></div>); })}</div>
      </div>
    </div>
  );
}

// ─── Transactions ─────────────────────────────────────────────────────────────
function TransactionsScreen() {
  const [txFilter, setTxFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = TRANSACTIONS_DATA.filter(t => (txFilter === "All" || t.type === txFilter) && (t.customer.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())));
  return (
    <div className="flex-1 overflow-y-auto" style={NUN}>
      <TopBar title="Transactions" subtitle="Feb 01, 2026 – Jun 20, 2026" actions={<button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold bg-white" style={{ borderColor: DS.grey5, color: DS.grey2 }}><CalendarDays size={14} />Feb 01 – Jun 20</button>} />
      <div className="px-8 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-6 border" style={{ background: DS.secondary6, borderColor: DS.secondary4 }}><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: DS.primary }}><Wallet size={18} className="text-white" /></div><p className="text-sm font-bold" style={{ color: DS.grey3 }}>Wallet Balance</p></div><p className="text-3xl font-extrabold" style={{ color: DS.primary }}>₦0.50</p></div>
          <div className="rounded-2xl p-6 border" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: DS.info1 }}><ArrowDownLeft size={18} className="text-white" /></div><p className="text-sm font-bold" style={{ color: DS.grey3 }}>Total Inflow</p></div><p className="text-3xl font-extrabold" style={{ color: DS.grey1 }}>₦776,330.00</p></div>
          <div className="rounded-2xl p-6 border" style={{ background: "#f5f3ff", borderColor: "#ddd6fe" }}><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#7c3aed" }}><ArrowOut size={18} className="text-white" /></div><p className="text-sm font-bold" style={{ color: DS.grey3 }}>Total Outflow</p></div><p className="text-3xl font-extrabold" style={{ color: DS.grey1 }}>₦774,045.00</p></div>
        </div>
        <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: DS.primary }}>
          <div className="flex items-start gap-4"><div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}><Building2 size={20} className="text-white" /></div><div><p className="text-sm font-extrabold text-white">Main Account</p><p className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Vfd MicroFinance BANK · 1040800190</p><p className="text-xs font-semibold mt-2" style={{ color: "rgba(255,255,255,0.8)" }}>Account Name: Sync360-Olosunde Oluwatobiloba</p></div></div>
          <div className="text-right flex items-center gap-3"><div className="mr-4"><p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Available Balance</p><p className="text-xl font-extrabold text-white mt-0.5">₦0.50</p></div><DSButton variant="outline" size="sm">Transfer</DSButton><button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/30 text-sm font-bold text-white hover:bg-white/10 transition-colors"><Plus size={14} />Create Sub Account</button></div>
        </div>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(27,50,40,0.08)" }}><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fdf2f8" }}><CreditCard size={16} style={{ color: "#db2777" }} /></div><div><p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>BNPL Transactions</p><p className="text-xs font-medium" style={{ color: DS.grey3 }}>Akawopay Buy Now, Pay Later activity</p></div></div><button className="text-xs font-bold" style={{ color: DS.secondary1 }}>Manage BNPL settings</button></div>
          <div className="grid grid-cols-3 divide-x">{[{ label: "ACTIVE LOANS", value: "0" }, { label: "OUTSTANDING", value: "₦0.00" }, { label: "PAID OUT (THIS MONTH)", value: "₦0.00" }].map(({ label, value }) => <div key={label} className="px-6 py-4"><p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: DS.grey4 }}>{label}</p><p className="text-xl font-extrabold" style={{ color: DS.grey1 }}>{value}</p></div>)}</div>
          <div className="px-6 py-8 text-center border-t" style={{ borderColor: "rgba(27,50,40,0.06)" }}><p className="text-sm font-bold" style={{ color: DS.grey3 }}>No BNPL transactions yet</p><p className="text-xs font-medium mt-1" style={{ color: DS.grey4 }}>Once a customer pays with Akawopay at checkout, their instalment plan will appear here.</p></div>
        </div>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
            <div className="flex-1 max-w-sm relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: DS.grey4 }} /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#329661]" style={{ borderColor: DS.grey5, color: DS.grey1, ...NUN }} /></div>
            <div className="flex items-center gap-2 ml-4">{["All", "Credit", "Debit"].map(f => <button key={f} onClick={() => setTxFilter(f)} className="px-4 py-2 rounded-lg text-sm font-bold transition-colors" style={txFilter === f ? { background: DS.secondary1, color: "#fff" } : { background: DS.grey6, color: DS.grey3 }}>{f}</button>)}</div>
          </div>
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: "rgba(27,50,40,0.08)", background: DS.grey6 }}>{["S/N", "Transaction ID", "Customer", "Type", "Amount", "Account Number", "Date", "Status", "Action"].map((h, i) => <th key={h} className={`px-5 py-3.5 text-xs font-extrabold uppercase tracking-wide ${i >= 4 ? "text-right" : "text-left"}`} style={{ color: DS.secondary1, ...NUN }}>{h}</th>)}</tr></thead>
            <tbody>{filtered.map((t, i) => { const sc = t.status === "Success" ? { bg: DS.success2, color: DS.success1 } : t.status === "Pending" ? { bg: DS.warning2, color: DS.warning1 } : { bg: DS.error2, color: DS.error1 }; return (<tr key={t.sn} className={`cursor-pointer ${i < filtered.length - 1 ? "border-b" : ""}`} style={{ borderColor: "rgba(27,50,40,0.06)" }} onMouseEnter={e => (e.currentTarget.style.background = DS.grey6)} onMouseLeave={e => (e.currentTarget.style.background = "")}><td className="px-5 py-4 text-sm font-medium" style={{ color: DS.grey3 }}>{t.sn}</td><td className="px-5 py-4 text-sm font-bold" style={{ color: DS.secondary1 }}>{t.id}</td><td className="px-5 py-4 text-sm font-medium" style={{ color: DS.grey1 }}>{t.customer}</td><td className="px-5 py-4"><span className="text-xs font-bold px-2.5 py-1 rounded-full" style={t.type === "Credit" ? { background: DS.success2, color: DS.success1 } : { background: DS.error2, color: DS.error1 }}>{t.type}</span></td><td className="px-5 py-4 text-right text-sm font-extrabold" style={{ color: DS.grey1 }}>₦{t.amount.toLocaleString()}</td><td className="px-5 py-4 text-right text-sm font-medium" style={{ color: DS.grey3 }}>{t.account}</td><td className="px-5 py-4 text-right text-sm font-medium" style={{ color: DS.grey3 }}>{t.date}</td><td className="px-5 py-4 text-right"><span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: sc.bg, color: sc.color }}>{t.status}</span></td><td className="px-5 py-4 text-right"><button className="text-xs font-bold" style={{ color: DS.secondary1 }}>View</button></td></tr>); })}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Logistics ────────────────────────────────────────────────────────────────
function LogisticsScreen() {
  const [settingsNav, setSettingsNav] = useState("Shipping & Delivery");
  const [shippingTab, setShippingTab] = useState("Delivery & Pickup");
  const [deliveryTimelines, setDeliveryTimelines] = useState(false);
  const [sameDayOption, setSameDayOption] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return <button onClick={() => onChange(!value)} className="relative w-12 h-6 rounded-full transition-colors" style={{ background: value ? DS.secondary1 : DS.grey5 }}><div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: value ? "calc(100% - 20px)" : "4px" }} /></button>;
  }
  return (
    <div className="flex-1 overflow-y-auto" style={NUN}>
      <div className="px-8 py-6 border-b bg-white relative overflow-hidden" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
        <div className="absolute right-8 top-4 w-28 h-28 rounded-full opacity-15" style={{ background: DS.secondary1 }} />
        <div className="absolute right-20 top-8 w-16 h-16 rounded-full opacity-10" style={{ background: DS.secondary1 }} />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: DS.secondary1 }}><Settings size={22} className="text-white" /></div>
          <div><p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: DS.secondary1 }}>Operations</p><h1 className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>Operational Settings</h1><p className="text-sm font-medium mt-1 max-w-lg" style={{ color: DS.grey3 }}>Configure how orders are fulfilled, what payment options your customers see, and the add-ons that round out checkout.</p></div>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-52 shrink-0 border-r bg-white p-3 space-y-1" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
          {[{ id: "Shipping & Delivery", label: "Shipping & Delivery", sub: "Pickup, dispatch and automated logistics", icon: <Truck size={16} /> }, { id: "Payment Add-ons", label: "Payment Add-ons", sub: "Optional checkout features", icon: <CreditCard size={16} /> }].map(item => (
            <button key={item.id} onClick={() => setSettingsNav(item.id)} className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors" style={settingsNav === item.id ? { background: DS.secondary6, border: `1px solid ${DS.secondary4}` } : { border: "1px solid transparent" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: settingsNav === item.id ? DS.secondary1 : DS.grey6, color: settingsNav === item.id ? "#fff" : DS.grey3 }}>{item.icon}</div>
              <div><p className="text-xs font-extrabold" style={{ color: settingsNav === item.id ? DS.primary : DS.grey1 }}>{item.label}</p><p className="text-[10px] font-medium mt-0.5" style={{ color: DS.grey3 }}>{item.sub}</p></div>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          <div><h2 className="text-lg font-extrabold" style={{ color: DS.grey1 }}>{settingsNav}</h2><p className="text-sm font-medium mt-1" style={{ color: DS.grey3 }}>Manage how orders are dispatched and delivered to your customers.</p></div>
          <div className="border-b flex items-center" style={{ borderColor: "rgba(27,50,40,0.08)" }}>{["Delivery & Pickup", "Automated Shipping"].map(t => <button key={t} onClick={() => setShippingTab(t)} className="flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors" style={shippingTab === t ? { borderColor: DS.secondary1, color: DS.secondary1 } : { borderColor: "transparent", color: DS.grey3 }}>{t === "Delivery & Pickup" ? <Truck size={15} /> : <Zap size={15} />}{t}</button>)}</div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: DS.secondary6 }}><Info size={15} style={{ color: DS.secondary1 }} /><p className="text-xs font-semibold" style={{ color: DS.primary }}>Tailor shipping settings to give customers flexible delivery options.</p></div>
          <div className="space-y-3">
            {[{ step: "01", icon: <CalendarDays size={16} style={{ color: DS.secondary1 }} />, title: "Delivery Timelines", desc: "Set up delivery dates and times to inform your customers about your operational days and when to expect orders.", extra: <Toggle value={deliveryTimelines} onChange={setDeliveryTimelines} /> },
              { step: "02", icon: <Truck size={16} style={{ color: DS.secondary1 }} />, title: "Same-day Delivery Rules", desc: "Optional toggles that constrain when same-day delivery is offered to customers.", extra: <div className="grid grid-cols-2 gap-3 mt-4">{["No same-day delivery", "Only same-day delivery"].map(opt => <label key={opt} onClick={() => setSameDayOption(opt)} className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors" style={{ borderColor: sameDayOption === opt ? DS.secondary1 : DS.grey5, background: sameDayOption === opt ? DS.secondary6 : "#fff" }}><div className="w-4 h-4 rounded border flex items-center justify-center shrink-0" style={{ borderColor: sameDayOption === opt ? DS.secondary1 : DS.grey5, background: sameDayOption === opt ? DS.secondary1 : "#fff" }}>{sameDayOption === opt && <Check size={10} className="text-white" strokeWidth={3} />}</div><span className="text-sm font-semibold" style={{ color: DS.grey1 }}>{opt}</span></label>)}</div> },
              { step: "03", icon: <Clock size={16} style={{ color: DS.secondary1 }} />, title: "Processing & Reminders", desc: "Tell customers how long you take to prep an order, and keep your team alerted before each delivery.", extra: null }
            ].map(s => (
              <div key={s.step} className="bg-white rounded-2xl border p-5" style={{ borderColor: "rgba(27,50,40,0.08)" }}>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-0.5 shrink-0"><p className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: DS.grey4 }}>Step</p><p className="text-2xl font-extrabold" style={{ color: DS.grey5 }}>{s.step}</p></div>
                  <div className="flex-1"><div className="flex items-center justify-between"><div className="flex items-center gap-2">{s.icon}<p className="text-sm font-extrabold" style={{ color: DS.grey1 }}>{s.title}</p></div>{s.step === "01" && <Toggle value={deliveryTimelines} onChange={setDeliveryTimelines} />}</div><p className="text-xs font-medium mt-1.5 max-w-lg" style={{ color: DS.grey3 }}>{s.desc}</p>{s.step !== "01" && s.extra}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 pb-6"><div className="flex items-center gap-2"><CheckCircle size={14} style={{ color: DS.secondary1 }} /><p className="text-xs font-semibold" style={{ color: DS.grey3 }}>Changes are saved per section. Tap save to publish.</p></div><DSButton variant="secondary" icon={<CheckCircle size={15} />} loading={saving} onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1500); }}>Save Changes</DSButton></div>
        </div>
      </div>
    </div>
  );
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
const PLANS = [
  { id: "basic", name: "Basic Plan", badge: "Current Plan", price: "FREE", priceSub: "For 7 more days", bg: "#fff", border: DS.grey5, accent: DS.secondary1, badgeBg: DS.secondary6, badgeColor: DS.primary, action: "Cancel Subscription", actionVariant: "outline" as const, features: ["50 Orders", "50 Inventory", "1 User", "No Attendant", "5 Customers per Month", "Track Income & Expenses", "In-Store Checkout Software (Point of Sale)", "Bulk SMS/Emails", { label: "Wallet", badge: "Coming soon" }] },
  { id: "starter", name: "Starter Plan", badge: null, price: "₦1,500", priceSub: "/Month", bg: DS.warning2, border: "#fcd34d", accent: DS.warning1, badgeBg: null, badgeColor: null, action: "Choose Plan", actionVariant: "secondary" as const, features: ["1 User", "No Attendant", "Unlimited Sales", "200 Inventory", "100 Customers per Month", "Track Income & Expenses", "Supplier Management", "In-Store Checkout Software (Point of Sale)", "Bulk SMS/Emails", { label: "Wallet", badge: "Coming soon" }] },
  { id: "sync-plus", name: "Sync Plus", badge: "Popular", price: "₦3,500", priceSub: "/Month", bg: DS.secondary5, border: DS.secondary3, accent: DS.secondary1, badgeBg: DS.secondary1, badgeColor: "#fff", action: "Choose Plan", actionVariant: "secondary" as const, features: ["1 User", "5 Attendant", "Unlimited Sales", "Unlimited Customer Registration", "1000 Inventory Products", "Track Income & Expenses", "Automated Bank Expenses Tracking", "In-Store Checkout Software (Point of Sale)", "Bulk SMS/Emails", { label: "Wallet", badge: "Coming soon" }, { label: "STORE FRONT (ecommerce Website)", badge: "Coming soon" }, { label: "Unlimited Invoice", badge: "Coming soon" }] },
  { id: "sync-pro", name: "Sync Pro", badge: "Best Value", price: "₦10,000", priceSub: "/Month", bg: "#e0e7ff", border: "#a5b4fc", accent: "#4f46e5", badgeBg: "#4f46e5", badgeColor: "#fff", action: "Choose Plan", actionVariant: "primary" as const, features: ["2 User", "10 Attendant", "Up to 3 outlets additional store attract ₦2000", "Unlimited Sales", "Unlimited Customer Registration", "2500 Inventory Management", "Track Income & Expenses", "Automated Bank Expenses Tracking", "In-Store Checkout Software (Point of Sale)", "Bulk SMS/Emails", { label: "Wallet", badge: "Coming soon" }, { label: "STORE FRONT (ecommerce Website)", badge: "Coming soon" }, { label: "Unlimited Invoice", badge: "Coming soon" }] },
];
function SubscriptionsScreen() {
  const [billing, setBilling] = useState("One - Off"); const [selected, setSelected] = useState("basic");
  return (
    <div className="flex-1 overflow-y-auto" style={NUN}>
      <TopBar title="Subscriptions" subtitle="Manage your plan and billing" />
      <div className="px-8 py-8 space-y-8">
        <div className="text-center max-w-xl mx-auto"><h2 className="text-2xl font-extrabold" style={{ color: DS.grey1 }}>Choose the</h2><h2 className="text-3xl font-extrabold" style={{ color: DS.secondary1 }}>Right Plan for Your Business</h2><p className="text-sm font-medium mt-2" style={{ color: DS.grey3 }}>Flexible plans designed to grow with your business.</p></div>
        <div className="flex justify-center"><div className="flex items-center gap-1 p-1 rounded-full" style={{ background: DS.grey6 }}>{["One - Off", "Quarterly", "Biannual", "Annual"].map(b => <button key={b} onClick={() => setBilling(b)} className="px-5 py-2 rounded-full text-sm font-bold transition-all" style={billing === b ? { background: DS.secondary1, color: "#fff" } : { color: DS.grey3 }}>{b}</button>)}</div></div>
        <div className="grid grid-cols-4 gap-4 items-start">{PLANS.map(plan => (<div key={plan.id} onClick={() => setSelected(plan.id)} className="rounded-2xl p-6 flex flex-col gap-4 cursor-pointer transition-all" style={{ background: plan.bg, border: `2px solid ${selected === plan.id ? plan.accent : plan.border}`, boxShadow: selected === plan.id ? `0 0 0 3px ${plan.accent}22` : "none" }}><div className="flex items-center justify-between"><p className="text-sm font-extrabold" style={{ color: DS.grey2 }}>{plan.name}</p>{plan.badge && <span className="px-2.5 py-1 rounded-full text-xs font-extrabold" style={{ background: plan.badgeBg ?? DS.secondary6, color: plan.badgeColor ?? DS.primary }}>{plan.badge}</span>}</div><div className="flex items-end gap-1"><span className="text-3xl font-extrabold" style={{ color: DS.grey1 }}>{plan.price}</span><span className="text-sm font-bold pb-1" style={{ color: DS.grey3 }}>{plan.priceSub}</span></div><div className="flex flex-col gap-2.5">{plan.features.map((f, i) => { const label = typeof f === "string" ? f : f.label; const badge = typeof f === "object" ? f.badge : null; return (<div key={i} className="flex items-start gap-2"><div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: plan.accent + "20" }}><Check size={11} style={{ color: plan.accent }} strokeWidth={3} /></div><span className="text-xs font-medium leading-snug flex-1" style={{ color: DS.grey2 }}>{label}</span>{badge && <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: DS.warning2, color: DS.warning1 }}>{badge}</span>}</div>); })}</div><DSButton variant={plan.actionVariant} fullWidth className="mt-2">{plan.action}</DSButton></div>))}</div>
      </div>
    </div>
  );
}

// ─── Add Business ─────────────────────────────────────────────────────────────
function AddBusinessScreen() {
  const [form, setForm] = useState({ name: "Jenny & Co.", type: "Food and Groceries", country: "Nigeria", state: "Lagos", city: "Lagos", street: "" });
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex-1 overflow-y-auto" style={NUN}>
      <TopBar title="Add a Business" subtitle="Set up your business profile" />
      <div className="px-8 py-8"><div className="max-w-4xl mx-auto">{saved && <div className="mb-6"><DSAlert type="success" title="Business saved!" message="Your business profile has been set up successfully." onClose={() => setSaved(false)} /></div>}<div className="grid grid-cols-5 gap-8"><div className="col-span-2"><div className="bg-white rounded-2xl p-8 border text-center sticky top-6" style={{ borderColor: "rgba(27,50,40,0.08)" }}><div className="relative inline-block mb-4"><div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto" style={{ background: DS.grey5 }}><Users size={40} style={{ color: DS.grey3 }} /></div><button className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md" style={{ background: DS.secondary1 }}><Camera size={14} className="text-white" /></button></div><p className="text-base font-extrabold" style={{ color: DS.grey1 }}>{form.name || "Business Name"}</p><p className="text-sm font-medium mt-1" style={{ color: DS.grey3 }}>{form.type}</p><p className="text-xs mt-1.5 font-medium" style={{ color: DS.grey4 }}>{form.city}, {form.country}</p><div className="mt-6 pt-5 border-t text-left space-y-3" style={{ borderColor: DS.grey6 }}><p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: DS.grey4 }}>Profile Completion</p><div className="w-full rounded-full h-2" style={{ background: DS.grey5 }}><div className="h-2 rounded-full" style={{ background: DS.secondary1, width: "70%" }} /></div><p className="text-xs font-bold" style={{ color: DS.grey3 }}>70% complete — add your street to finish</p></div></div></div><div className="col-span-3"><div className="bg-white rounded-2xl p-8 border space-y-5" style={{ borderColor: "rgba(27,50,40,0.08)" }}><div><h2 className="text-xl font-extrabold" style={{ color: DS.grey1 }}>Set Up Your First Business</h2><p className="text-sm font-medium mt-1" style={{ color: DS.grey3 }}>Fill in your business details to get started</p></div><DSInput label="Business Name" placeholder="e.g. Jenny & Co." value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} state={form.name ? "valid" : "default"} /><DSSelect label="Business Type" value={form.type} options={["Food and Groceries", "Retail", "Fashion & Clothing", "Electronics", "Healthcare", "Education", "Services"]} onChange={v => setForm(p => ({ ...p, type: v }))} /><div className="grid grid-cols-2 gap-4"><DSSelect label="Country" value={form.country} options={["Nigeria", "Ghana", "Kenya", "South Africa"]} onChange={v => setForm(p => ({ ...p, country: v }))} /><DSSelect label="State / Province" value={form.state} options={["Lagos", "Abuja", "Kano", "Rivers", "Ogun", "Oyo"]} onChange={v => setForm(p => ({ ...p, state: v }))} /></div><div className="grid grid-cols-2 gap-4"><DSSelect label="City / Town" value={form.city} options={["Lagos", "Ikeja", "Victoria Island", "Lekki", "Surulere"]} onChange={v => setForm(p => ({ ...p, city: v }))} /><DSInput label="Street" placeholder="e.g. No. 2, Zonas Qtrs, Ayobo" value={form.street} onChange={v => setForm(p => ({ ...p, street: v }))} /></div><div className="pt-2 flex flex-col gap-3"><DSButton variant="secondary" fullWidth size="lg" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>Add Business</DSButton><button className="text-sm font-bold text-center hover:opacity-70" style={{ color: DS.grey3, ...NUN }}>{"I'll do this later."}</button></div></div></div></div></div></div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f4f7f4", ...NUN }}>
      <Sidebar active={screen} onNav={setScreen} />
      {screen === "home" && <HomeScreen />}
      {screen === "sales" && <SalesScreen />}
      {screen === "inventory" && <InventoryScreen />}
      {screen === "search" && <SearchScreen />}
      {screen === "customers" && <CustomersScreen />}
      {screen === "expenses" && <ExpensesScreen />}
      {screen === "orders" && <OrdersScreen />}
      {screen === "transactions" && <TransactionsScreen />}
      {screen === "logistics" && <LogisticsScreen />}
      {screen === "subscriptions" && <SubscriptionsScreen />}
      {screen === "add-business" && <AddBusinessScreen />}
    </div>
  );
}
