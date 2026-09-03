// Pulling something readable out of an API error body.
//
// The wallet endpoints answer in two shapes. Some send {"message": "..."};
// others send DRF's field dictionary, where the useful text is one level down
// inside a list:
//
//   {"business_type": ["business_type is required for corporate account
//                       (choices: 'RC' or 'BN')."]}
//
// Reading only `message` and `error` turned the second kind into a flat
// "Failed to create account", which is how a merchant ends up staring at a
// form that looks complete with no idea which field the server rejected.

/** Nested wrappers seen in these responses — the real errors are inside. */
const WRAPPERS = ["details", "payload", "errors", "data"];

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * The first human-readable message in an error body, or `fallback`.
 *
 * Depth-limited: these bodies nest a couple of levels at most, and a cycle or
 * a pathological payload should not be able to hang a route handler.
 */
export const firstApiError = (
  body: unknown,
  fallback: string,
  depth = 0,
): string => {
  // A string is the answer, never a step towards one, so it is read before
  // the depth guard: {"details": {"payload": {"directors": ["..."]}}} is four
  // levels down, and a cap that cut it off would fall back to the generic
  // message this exists to avoid.
  if (typeof body === "string") return body.trim() || fallback;

  if (depth > 6 || !body) return fallback;

  if (Array.isArray(body)) {
    for (const entry of body) {
      const found = firstApiError(entry, "", depth + 1);
      if (found) return found;
    }
    return fallback;
  }

  if (!isPlainObject(body)) return fallback;

  // A message the server wrote for display wins over a field error.
  for (const key of ["message", "error", "detail"]) {
    const value = body[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  // Then the wrappers, which usually hold the field dictionary.
  for (const key of WRAPPERS) {
    if (key in body) {
      const found = firstApiError(body[key], "", depth + 1);
      if (found) return found;
    }
  }

  // Finally any field: {"business_type": ["business_type is required..."]}.
  for (const [key, value] of Object.entries(body)) {
    if (["message", "error", "detail", "status_code", ...WRAPPERS].includes(key))
      continue;
    const found = firstApiError(value, "", depth + 1);
    if (found) return found;
  }

  return fallback;
};
