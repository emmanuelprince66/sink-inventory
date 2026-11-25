/**
 * Small lists the POS checkout needs that change rarely — the business's bank
 * accounts and its attendants. Kept on this device so a refresh with no
 * connection still shows them (react-query only holds them in memory).
 *
 * Products and customers are too big for this and live in IndexedDB instead
 * (offlineCache.ts). Cleared on logout with the rest of the offline copies.
 */

export type PosSnapshotKind = "banks" | "attendants";

const PREFIX = "sync360-pos-snapshot:";
const keyFor = (kind: PosSnapshotKind, businessId: string) =>
  `${PREFIX}${kind}:${businessId}`;

/** Saves the server's answer as it came, so callers read it the same way. */
export const saveSnapshot = (
  kind: PosSnapshotKind,
  businessId: string | null | undefined,
  value: unknown,
) => {
  if (!businessId || value == null) return;
  try {
    localStorage.setItem(keyFor(kind, businessId), JSON.stringify(value));
  } catch {
    // Storage full or blocked: offline just won't have this list.
  }
};

export const readSnapshot = <T = any,>(
  kind: PosSnapshotKind,
  businessId: string | null | undefined,
): T | undefined => {
  if (!businessId) return undefined;
  try {
    const raw = localStorage.getItem(keyFor(kind, businessId));
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};

/** On logout: these belong to the business that was signed in. */
export const clearSnapshots = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
};
