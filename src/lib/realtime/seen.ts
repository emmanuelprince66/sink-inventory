/**
 * One "have we already alerted about this?" answer, shared by every path that
 * can raise a popup.
 *
 * The same event reaches an open tab twice — once over the socket and once as
 * an FCM foreground message — and the backend sends the same notification_id
 * on both, which is the only thing that makes them recognisable as one event.
 * Without a shared record each path dedupes only against itself, and a till
 * with the tab open gets two stacked modals for one payment.
 *
 * Module state rather than a hook or a context: both providers live in the same
 * tab and sharing is the entire point, so there is nothing to scope it to. It
 * resets on reload, which is correct — a reloaded tab has no modals to double.
 */

/** Keeps the set from growing without bound on a till open all day. */
const SEEN_LIMIT = 200;

const seen = new Set<string>();

/**
 * True the first time an id is seen, false on every repeat.
 *
 * An event with no id cannot be deduped, so it is always treated as new —
 * showing one popup twice is a smaller failure than silently swallowing an
 * alert nobody else will raise.
 */
export const markSeen = (id?: string | null): boolean => {
  if (!id) return true;

  const key = String(id);
  if (seen.has(key)) return false;

  seen.add(key);
  if (seen.size > SEEN_LIMIT) {
    // Sets iterate in insertion order, so the first key is the oldest.
    const oldest = seen.values().next().value;
    if (oldest) seen.delete(oldest);
  }
  return true;
};
