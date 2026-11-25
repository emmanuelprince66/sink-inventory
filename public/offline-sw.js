/* eslint-disable no-restricted-globals */
/**
 * Lets the POS open with no connection at all.
 *
 * Loaded into firebase-messaging-sw.js with importScripts rather than
 * registered on its own: that worker already owns scope "/", and a second
 * worker on the same scope would replace it and break push notifications.
 *
 * What it keeps on this device:
 * - The POS page itself (OFFLINE_PAGES), always fetched fresh when online and
 *   served from here only when the network fails. Saved by the page asking
 *   (WARM_PAGE), because the POS is usually reached by clicking a link, which
 *   never requests the page as a whole.
 * - Next's build files (/_next/static). Their names change with every deploy,
 *   so a saved one never goes stale; old ones are trimmed.
 * - Images, fonts and sounds, refreshed in the background.
 *
 * Never touched: /api (products, customers and queued sales already live in
 * IndexedDB), anything that isn't GET, other sites, and Next's in-app
 * navigation requests.
 *
 * Bump VERSION to throw every saved copy away on the next deploy.
 */
(() => {
  const VERSION = "v1";
  const STATIC_CACHE = `sync360-static-${VERSION}`;
  const PAGE_CACHE = `sync360-pages-${VERSION}`;
  const CONFIG_CACHE = "sync360-sw-config";
  const DISABLED_KEY = "/__sw/offline-disabled";
  const OWN_CACHES = [STATIC_CACHE, PAGE_CACHE, CONFIG_CACHE];

  /** Pages that can open offline. */
  const OFFLINE_PAGES = ["/pos"];
  /** How long a page request may hang before the saved copy is used. */
  const PAGE_TIMEOUT_MS = 6000;
  const MAX_STATIC_ENTRIES = 500;

  const isOfflinePage = (pathname) =>
    OFFLINE_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  /* ------------------------------------------------ dev switch (next dev) */
  // Dev builds reuse file names, so serving saved copies would hide code
  // changes. The app tells the worker which build it is (SET_ENABLED); the
  // answer is kept so it holds after the worker restarts.
  let enabled = true;
  const configReady = caches
    .open(CONFIG_CACHE)
    .then((cache) => cache.match(DISABLED_KEY))
    .then((hit) => {
      enabled = !hit;
    })
    .catch(() => undefined);

  const setEnabled = async (value) => {
    enabled = value;
    const cache = await caches.open(CONFIG_CACHE);
    if (value) {
      await cache.delete(DISABLED_KEY);
    } else {
      await cache.put(DISABLED_KEY, new Response("1"));
      await Promise.all([caches.delete(STATIC_CACHE), caches.delete(PAGE_CACHE)]);
    }
  };

  /* ------------------------------------------------------------- helpers */
  const cacheable = (response) =>
    response &&
    response.ok &&
    response.type === "basic" &&
    !response.redirected;

  const trim = async (cacheName, max) => {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    // Oldest first: keys come back in the order they were added.
    await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
  };

  const withTimeout = (promise, ms) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), ms);
      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
      );
    });

  /**
   * Shown when a page can't be loaded and there's no saved copy of it. Offers
   * the POS when it is saved here, since that's the one page that works
   * offline.
   */
  const offlineHtml = (posSaved) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
font-family:system-ui,sans-serif;background:#F4F7F4;color:#1f2937}main{max-width:420px;padding:32px;
text-align:center}h1{font-size:20px;margin:0 0 8px}p{font-size:14px;line-height:1.6;color:#6b7280}
.row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px}
a,button{padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;
text-decoration:none;font-family:inherit}a{background:#0f5132;color:#fff;border:0}
button{background:#fff;color:#1f2937;border:1px solid #d1d5db}</style></head><body><main>
<h1>You're offline</h1>${
    posSaved
      ? `<p>This page needs an internet connection. The POS still works offline — you can keep
selling, and sales sync when the connection is back.</p><div class="row">
<a href="/pos">Open the POS</a><button onclick="location.reload()">Try again</button></div>`
      : `<p>This device hasn't saved the POS for offline use yet. Connect to the internet and open
the POS once — after that it will open here even without a connection.</p><div class="row">
<button onclick="location.reload()">Try again</button></div>`
  }</main></body></html>`;

  const offlineResponse = async () => {
    const posSaved = Boolean(
      await caches
        .open(PAGE_CACHE)
        .then((cache) => cache.match("/pos"))
        .catch(() => undefined),
    );
    return new Response(offlineHtml(posSaved), {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  };

  /* ------------------------------------------------------------ handlers */

  /** Fresh when the network answers; the saved copy when it doesn't. */
  const pageNetworkFirst = async (request, pathname) => {
    const cache = await caches.open(PAGE_CACHE);
    try {
      const response = await withTimeout(fetch(request), PAGE_TIMEOUT_MS);
      if (cacheable(response)) cache.put(pathname, response.clone());
      return response;
    } catch {
      return (await cache.match(pathname)) || offlineResponse();
    }
  };

  /** Build files never change under the same name. */
  const cacheFirst = async (request) => {
    const cache = await caches.open(STATIC_CACHE);
    const saved = await cache.match(request);
    if (saved) return saved;
    const response = await fetch(request);
    if (cacheable(response)) {
      await cache.put(request, response.clone());
      trim(STATIC_CACHE, MAX_STATIC_ENTRIES).catch(() => undefined);
    }
    return response;
  };

  /** Images, fonts, sounds: the saved copy now, a fresh one for next time. */
  const staleWhileRevalidate = async (request) => {
    const cache = await caches.open(STATIC_CACHE);
    const saved = await cache.match(request);
    const fresh = fetch(request)
      .then((response) => {
        if (cacheable(response)) cache.put(request, response.clone());
        return response;
      })
      .catch(() => undefined);
    return saved || (await fresh) || Response.error();
  };

  /**
   * Saves a page and every build file it names, so it opens offline even if
   * it was only ever reached by an in-app link, or its files were loaded
   * before this worker was in control.
   */
  const warmPage = async (pathname) => {
    if (!enabled || !isOfflinePage(pathname)) return;
    const response = await fetch(pathname, { credentials: "same-origin" });
    if (!cacheable(response)) return;
    const html = await response.clone().text();
    await (await caches.open(PAGE_CACHE)).put(pathname, response);

    const assets = new Set(
      (html.match(/\/_next\/static\/[^"'\s)\\]+/g) || []).map((u) =>
        u.replace(/&amp;/g, "&"),
      ),
    );
    const staticCache = await caches.open(STATIC_CACHE);
    await Promise.all(
      [...assets].map(async (url) => {
        if (await staticCache.match(url)) return;
        try {
          const asset = await fetch(url);
          if (cacheable(asset)) await staticCache.put(url, asset);
        } catch {
          // One missing file shouldn't stop the rest.
        }
      }),
    );
    await trim(STATIC_CACHE, MAX_STATIC_ENTRIES);
  };

  /* ------------------------------------------------------------- events */

  self.addEventListener("activate", (event) => {
    // Drop saved copies from older VERSIONs.
    event.waitUntil(
      caches
        .keys()
        .then((names) =>
          Promise.all(
            names
              .filter((n) => n.startsWith("sync360-") && !OWN_CACHES.includes(n))
              .map((n) => caches.delete(n)),
          ),
        ),
    );
  });

  self.addEventListener("message", (event) => {
    const data = event.data || {};
    if (data.type === "OFFLINE_SET_ENABLED") {
      event.waitUntil(setEnabled(Boolean(data.enabled)));
    } else if (data.type === "OFFLINE_WARM_PAGE" && typeof data.path === "string") {
      event.waitUntil(configReady.then(() => warmPage(data.path)).catch(() => undefined));
    } else if (data.type === "OFFLINE_CLEAR_PAGES") {
      event.waitUntil(caches.delete(PAGE_CACHE));
    }
  });

  self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith("/api/")) return;

    let handler = null;
    if (request.mode === "navigate") {
      handler = isOfflinePage(url.pathname)
        ? () => pageNetworkFirst(request, url.pathname)
        : // Any other page: straight to the network, untouched while online.
          // Only when it fails is the browser's "no internet" page replaced
          // with ours, which points to the POS.
          () => fetch(request).catch(() => offlineResponse());
    } else if (request.headers.get("RSC") || url.searchParams.has("_rsc")) {
      // Next's in-app navigation data: always live.
      handler = null;
    } else if (url.pathname.startsWith("/_next/static/")) {
      handler = () => cacheFirst(request);
    } else if (
      url.pathname.startsWith("/_next/image") ||
      /\.(png|jpe?g|svg|webp|gif|ico|woff2?|mp3|wav|ogg)$/i.test(url.pathname)
    ) {
      handler = () => staleWhileRevalidate(request);
    }
    if (!handler) return;

    event.respondWith(
      configReady.then(() => (enabled ? handler() : fetch(request))),
    );
  });
})();
