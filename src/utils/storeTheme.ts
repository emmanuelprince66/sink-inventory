"use client";

import {
  DEFAULT_STORE_THEME_KEY,
  FALLBACK_STORE_THEMES,
} from "@/api/business/get-store-themes";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useMemo } from "react";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const DEFAULT_HEX =
  FALLBACK_STORE_THEMES.find((t) => t.key === DEFAULT_STORE_THEME_KEY)
    ?.primary ?? "#047857";

/**
 * business.store_theme is a hex on newer stores and a preset key on older ones,
 * so both are accepted and anything unrecognised falls back to the default.
 */
export const resolveThemeHex = (value?: string | null): string => {
  const trimmed = value?.trim();
  if (trimmed && HEX.test(trimmed)) return expand(trimmed);
  const preset = FALLBACK_STORE_THEMES.find((t) => t.key === trimmed);
  return preset?.primary ?? DEFAULT_HEX;
};

const expand = (hex: string) => {
  const v = hex.trim();
  if (v.length === 4) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return v;
};

const toRgb = (hex: string) => {
  const v = expand(hex).replace("#", "");
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
};

const toHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b]
    .map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0"))
    .join("")}`;

/** Blends a colour toward another. amount 0 = unchanged, 1 = fully target. */
const mix = (hex: string, target: string, amount: number) => {
  const a = toRgb(hex);
  const b = toRgb(target);
  return toHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
};

/** WCAG relative luminance. */
const luminance = (hex: string) => {
  const { r, g, b } = toRgb(hex);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a: string, b: string) => {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

export interface LoyaltyTheme {
  /** The merchant's colour, as saved. */
  base: string;
  /** Readable text on `base` — white or near-black, whichever wins. */
  onBase: string;
  /** Darker draw of base, for gradients and card headers. */
  dark: string;
  /** Near-black draw of base, for the full-bleed dark panels. */
  deep: string;
  /** Text on `deep`. */
  onDeep: string;
  /** Pale tint of base, for the soft-filled boxes. */
  surface: string;
  /** Slightly stronger tint, for borders on `surface`. */
  surfaceBorder: string;
  /**
   * QR module colour. Scanners want a dark-on-light target, so base is
   * darkened until it clears 7:1 against white and falls back to near-black
   * if it cannot — a pale brand colour must never cost someone a scan.
   */
  qrFg: string;
}

export const buildLoyaltyTheme = (value?: string | null): LoyaltyTheme => {
  const base = resolveThemeHex(value);

  const onBase = contrast(base, "#ffffff") >= 4.5 ? "#ffffff" : "#101828";
  const deep = mix(base, "#000000", 0.78);

  let qrFg = base;
  // Step it toward black until the module/background contrast is comfortable.
  for (let i = 0; i < 12 && contrast(qrFg, "#ffffff") < 7; i += 1) {
    qrFg = mix(qrFg, "#000000", 0.15);
  }
  if (contrast(qrFg, "#ffffff") < 7) qrFg = "#111111";

  return {
    base,
    onBase,
    dark: mix(base, "#000000", 0.42),
    deep,
    onDeep: contrast(deep, "#ffffff") >= 4.5 ? "#ffffff" : "#101828",
    surface: mix(base, "#ffffff", 0.9),
    surfaceBorder: mix(base, "#ffffff", 0.62),
    qrFg,
  };
};

/**
 * The loyalty palette for the business currently in scope. Every QR surface —
 * the merchant card, the detail sheet and the customer's own card — reads from
 * here so a card handed to a customer matches the storefront they scanned it in.
 */
export const useLoyaltyTheme = (): LoyaltyTheme => {
  const businessData = useBusinessDataStore((state: any) => state.businessData);
  const stored = businessData?.store_theme as string | undefined;
  return useMemo(() => buildLoyaltyTheme(stored), [stored]);
};
