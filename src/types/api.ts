// types/api.ts
// Shape every Next.js route handler in this app wraps its backend response in.
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// The list envelope the Sync360 API actually returns. Note this differs from
// the stock DRF `{count, next, previous, results}` the OpenAPI spec advertises —
// verified against live /loyalty/programs/ and /loyalty/rewards/analytics/.
// `count` is kept optional so stock-DRF endpoints still type-check.
export interface Paginated<T> {
  links?: {
    next?: string | null;
    previous?: string | null;
  };
  total?: number;
  limit?: number;
  pages?: number;
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

// Endpoints vary between returning a bare array, a single object, or the
// paginated envelope above — normalise all three to a plain array.
export const toList = <T>(
  payload: Paginated<T> | T[] | T | undefined | null,
): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && "results" in (payload as Paginated<T>)) {
    return (payload as Paginated<T>).results ?? [];
  }
  return [payload as T];
};
