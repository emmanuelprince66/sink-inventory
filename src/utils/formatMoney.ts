// utils/formatMoney.ts
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";

// ─── Currency → locale map ────────────────────────────────────────────────────

const CURRENCY_LOCALE_MAP: Record<string, string> = {
  NGN: "en-NG",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  JPY: "ja-JP",
  CHF: "de-CH",
  CAD: "en-CA",
  AUD: "en-AU",
  NZD: "en-NZ",
  CNY: "zh-CN",
  INR: "en-IN",
  RUB: "ru-RU",
  BRL: "pt-BR",
  ZAR: "en-ZA",
  MXN: "es-MX",
  SGD: "en-SG",
  HKD: "zh-HK",
  SEK: "sv-SE",
  KES: "sw-KE",
  GHS: "en-GH",
};

// ─── Core formatter (pure function — no hooks, safe anywhere) ─────────────────

export const formatMoney = (amount: number, currency: string): string => {
  console.log("formatMoney called with amount:", amount, "currency:", currency);
  const safeCurrency = currency?.toUpperCase() || "NGN";
  const locale = CURRENCY_LOCALE_MAP[safeCurrency] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: safeCurrency,
  }).format(amount ?? 0);
};

// ─── Hook-based formatter (use inside React components) ───────────────────────
// Returns a pre-bound format function using the active business currency.
// Usage:
//   const formatMoney = useFormatMoney();
//   <span>{formatMoney(amount)}</span>

export const useFormatMoney = () => {
  const businessData = useBusinessDataStore((state: any) => state.businessData);
  const currency = businessData?.currency || "NGN";
  return (amount: number) => formatMoney(amount, currency);
};

// ─── Legacy shim — keeps all existing formatToNaira() call sites working ──────
// Reads currency from the store via getState() — safe outside React components.
// No call sites need to change. The currency just automatically switches to
// whatever the active business currency is.
//
// How the Inventory card works:
//   formatToNaira(InventoryData?.data?.results?.profit)
//   → getState() reads businessData.currency (e.g. "NGN", "USD", etc.)
//   → formats the number with the correct symbol and locale
//   → if profit is undefined, amount ?? 0 returns 0 safely

export const formatToNaira = (amount: number): string => {
  const data = useBusinessDataStore.getState()?.businessData;

  console.log("data003", data);
  const currency =
    useBusinessDataStore.getState()?.businessData?.currency || "NGN";
  return formatMoney(amount, currency);
};
