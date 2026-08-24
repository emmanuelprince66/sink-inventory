import { BaseUrl } from "@/constants/base-url";

/**
 * Where the realtime socket lives, and how the token reaches it.
 *
 * The browser WebSocket API cannot set an Authorization header, so the backend
 * reads the JWT from the query string instead. Confirmed with the backend; this
 * is the only place that choice appears, so switching to a subprotocol later is
 * a change to one function.
 *
 * NEXT_PUBLIC_WS_URL wins when set. Otherwise the origin is derived from
 * BaseUrl so the socket always follows the API the rest of the app is talking
 * to — pointing the app at staging while the socket stayed on production is
 * exactly the sort of split-brain that is painful to debug.
 */
const originFromBaseUrl = (): string => {
  try {
    const { protocol, host } = new URL(BaseUrl);
    return `${protocol === "https:" ? "wss:" : "ws:"}//${host}`;
  } catch {
    return "wss://staging-api.sync360.africa";
  }
};

export const socketOrigin = (): string =>
  process.env.NEXT_PUBLIC_WS_URL?.replace(/\/+$/, "") || originFromBaseUrl();

/** Returns null when there is no token — callers must not connect without one. */
export const buildSocketUrl = (token?: string | null): string | null => {
  if (!token) return null;
  return `${socketOrigin()}/ws/user/?token=${encodeURIComponent(token)}`;
};
