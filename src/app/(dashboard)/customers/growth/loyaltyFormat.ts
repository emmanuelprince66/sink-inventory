// Counts come back as either 2 or "2.00" depending on the field, and rates as
// 33.33 — trim the noise so cards read "2" and "33%" rather than "2.00".
export const asNumber = (value: string | number | undefined | null) => {
  const n = Number(value ?? 0);
  return Number.isNaN(n) ? 0 : n;
};

// Rates arrive as 50 or 33.33 — show at most one decimal, no trailing zero.
export const asRate = (value: string | number | undefined | null) => {
  const n = asNumber(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

/** A percentage reward is a share of a bill, so it cannot exceed the whole bill. */
export const PERCENTAGE_MIN = 1;
export const PERCENTAGE_MAX = 100;

/**
 * Keeps a typed percentage inside 1–100.
 *
 * Applied as the field is typed rather than only on submit, so a merchant
 * cannot get as far as a Continue button with "500" in the box. Empty is left
 * empty — an emptied field is someone mid-edit, and rewriting it to "1" under
 * the cursor is worse than letting the required-value check catch it.
 */
export const clampPercentage = (raw: string): string => {
  // One decimal point only. The old filter kept every "." it was given, so
  // "5.5.5" typed straight through and went up as the reward value.
  const cleaned = raw.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
  if (!cleaned || cleaned === ".") return cleaned;

  const n = Number(cleaned);
  if (!Number.isFinite(n)) return "";
  // Only the ceiling is enforced while typing: "0" on the way to "05" is a
  // legitimate keystroke, and the floor is checked when the step is submitted.
  return n > PERCENTAGE_MAX ? String(PERCENTAGE_MAX) : cleaned;
};

/** Why a percentage reward value is unusable, or null when it is fine. */
export const percentageError = (raw: string): string | null => {
  const n = Number(raw);
  if (!raw.trim() || !Number.isFinite(n)) return "Enter a percentage.";
  if (n > PERCENTAGE_MAX) return "Percentage discount cannot exceed 100%.";
  if (n < PERCENTAGE_MIN) return "Percentage discount must be at least 1%.";
  return null;
};

/**
 * A reward figure in the unit its programme actually rewards in.
 *
 * The totals a programme reports are denominated in whatever it hands out:
 * naira for wallet credit, a raw percentage for a percentage discount, a count
 * for points. Formatting all of them as money printed "₦50.00" for a
 * programme giving 50% off, which reads as a fifty-naira discount.
 *
 * Free items and services report the estimated value of what was given away,
 * which is money — the item's *name* lives in reward_summary and is a
 * different question from what it cost.
 */
export const formatRewardAmount = (
  value: string | number | undefined | null,
  rewardType: string | undefined | null,
  formatMoney: (amount: number) => string,
): string => {
  const n = asNumber(value);

  switch (rewardType) {
    case "PERCENTAGE":
      return `${asRate(n)}%`;
    case "POINTS":
      return `${n.toLocaleString()} ${n === 1 ? "Point" : "Points"}`;
    default:
      // WALLET_CREDIT, FREE_ITEM, FREE_SERVICE — and anything new the backend
      // adds, since a money figure is the safer thing to show for an unknown
      // reward than a bare number with no unit at all.
      return formatMoney(n);
  }
};
