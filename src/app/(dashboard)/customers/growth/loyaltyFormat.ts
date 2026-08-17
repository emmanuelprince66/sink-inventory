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
