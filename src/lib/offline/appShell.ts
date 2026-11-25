/**
 * The app side of public/offline-sw.js: keeps a copy of the POS page on this
 * device so it opens with no connection at all (a refresh while offline used
 * to land on the browser's "no internet" page).
 *
 * The worker is firebase-messaging-sw.js, which also does push notifications.
 * Registering it here as well as in lib/notification.ts is harmless — the same
 * script on the same scope is one registration — and means the POS works
 * offline even for someone who never turned notifications on.
 */

const SW_URL = "/firebase-messaging-sw.js";
const WARMED_KEY = "sync360-pos-shell-saved-at";
/** A POS left open all day re-saves now and then, to pick up a new deploy. */
const REWARM_AFTER_MS = 30 * 60_000;

const supported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator;

const post = async (message: Record<string, unknown>) => {
  if (!supported()) return;
  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage(message);
};

/** Registers the worker and tells it whether to keep offline copies. */
export const setUpOfflineShell = async () => {
  if (!supported()) return;
  try {
    await navigator.serviceWorker.register(SW_URL, { scope: "/" });
    // `next dev` reuses file names between edits, so saved copies would hide
    // code changes there. Only real builds keep them.
    await post({
      type: "OFFLINE_SET_ENABLED",
      enabled: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error("Offline POS setup failed:", error);
  }
};

/**
 * Saves the POS page and its files for offline use. Call while online on the
 * POS: it's usually reached by an in-app link, which never loads the page
 * whole, so nothing would be saved otherwise.
 */
export const saveOfflinePage = async (path = "/pos") => {
  if (!supported() || process.env.NODE_ENV !== "production") return;
  try {
    const last = Number(sessionStorage.getItem(WARMED_KEY)) || 0;
    if (Date.now() - last < REWARM_AFTER_MS) return;
    sessionStorage.setItem(WARMED_KEY, String(Date.now()));
  } catch {
    // Storage blocked: save anyway, it's only a little extra traffic.
  }
  await post({ type: "OFFLINE_WARM_PAGE", path }).catch(() => undefined);
};

/**
 * On logout: the saved page belongs to the person who was signed in, so it
 * mustn't open for the next one.
 */
export const clearOfflinePages = async () => {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    sessionStorage.removeItem(WARMED_KEY);
  } catch {
    // ignore
  }
  try {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name.startsWith("sync360-pages-"))
        .map((name) => caches.delete(name)),
    );
  } catch {
    // Nothing saved, or storage blocked.
  }
};
