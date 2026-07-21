import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export interface StoreThemeOption {
  key: string;
  label: string;
  primary: string;
  on_primary: string;
  surface: string;
  accent: string;
}

// Mirrors backend's STORE_THEMES (business/store_themes/) — used as an
// immediate/fallback source so the picker never renders empty while the
// list is loading or if the request fails.
export const DEFAULT_STORE_THEME_KEY = "emerald";

export const FALLBACK_STORE_THEMES: StoreThemeOption[] = [
  {
    key: "emerald",
    label: "Emerald",
    primary: "#047857",
    on_primary: "#FFFFFF",
    surface: "#ECFDF5",
    accent: "#10B981",
  },
  {
    key: "royal",
    label: "Royal Blue",
    primary: "#1D4ED8",
    on_primary: "#FFFFFF",
    surface: "#EFF6FF",
    accent: "#3B82F6",
  },
  {
    key: "plum",
    label: "Plum",
    primary: "#7E22CE",
    on_primary: "#FFFFFF",
    surface: "#FAF5FF",
    accent: "#A855F7",
  },
  {
    key: "indigo",
    label: "Indigo",
    primary: "#4338CA",
    on_primary: "#FFFFFF",
    surface: "#EEF2FF",
    accent: "#6366F1",
  },
  {
    key: "violet",
    label: "Violet",
    primary: "#6D28D9",
    on_primary: "#FFFFFF",
    surface: "#F5F3FF",
    accent: "#8B5CF6",
  },
  {
    key: "rose",
    label: "Rose",
    primary: "#BE123C",
    on_primary: "#FFFFFF",
    surface: "#FFF1F2",
    accent: "#F43F5E",
  },
  {
    key: "sunset",
    label: "Sunset Orange",
    primary: "#C2410C",
    on_primary: "#FFFFFF",
    surface: "#FFF7ED",
    accent: "#F97316",
  },
  {
    key: "bronze",
    label: "Bronze",
    primary: "#92400E",
    on_primary: "#FFFFFF",
    surface: "#FFFBEB",
    accent: "#D97706",
  },
  {
    key: "amber",
    label: "Amber",
    primary: "#B45309",
    on_primary: "#FFFFFF",
    surface: "#FFFBEB",
    accent: "#F59E0B",
  },
  {
    key: "teal",
    label: "Teal",
    primary: "#0F766E",
    on_primary: "#FFFFFF",
    surface: "#F0FDFA",
    accent: "#14B8A6",
  },
  {
    key: "charcoal",
    label: "Charcoal",
    primary: "#334155",
    on_primary: "#FFFFFF",
    surface: "#F8FAFC",
    accent: "#64748B",
  },
];

interface FetchStoreThemesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface StoreThemesResult {
  themes: StoreThemeOption[];
  defaultKey: string;
}

const toThemeOption = (item: any, fallbackKey?: string): StoreThemeOption => ({
  key: item.key ?? item.id ?? item.value ?? fallbackKey,
  label: item.label ?? item.name ?? item.key ?? fallbackKey,
  primary: item.primary,
  on_primary: item.on_primary,
  surface: item.surface,
  accent: item.accent,
});

// Normalizes the various shapes a DRF list endpoint might come back as.
// Real shape (confirmed): `{success, data: {default, themes: [...]}, message}`
// from the Next proxy, i.e. `payload.data.data` = `{default, themes}`.
// Also tolerates a bare array, a paginated `{results: [...]}`, or a dict
// keyed by theme key (`{emerald: {...}}`) — same shape as the backend's
// STORE_THEMES constant — as fallbacks in case the endpoint's shape shifts.
const normalizeStoreThemes = (payload: any): StoreThemesResult => {
  const root = payload?.data?.data ?? payload?.data ?? payload;
  const defaultKey = root?.default ?? DEFAULT_STORE_THEME_KEY;
  const list = root?.themes ?? root?.results ?? root?.data ?? root;

  if (Array.isArray(list)) {
    return { themes: list.map((item) => toThemeOption(item)), defaultKey };
  }

  if (list && typeof list === "object") {
    const themes = Object.entries(list)
      .filter(([, value]) => value && typeof value === "object")
      .map(([key, value]) => toThemeOption(value as any, key));
    return { themes, defaultKey };
  }

  return { themes: [], defaultKey };
};

export const fetchStoreThemes = async ({
  search = "",
  page,
  limit,
}: FetchStoreThemesParams = {}) => {
  const url = new URL("/api/businesses/store-themes", window.location.origin);
  if (search) url.searchParams.append("search", search);
  if (page) url.searchParams.append("page", String(page));
  if (limit) url.searchParams.append("limit", String(limit));

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = new Error("Error fetching store themes");
    (error as any).status = response.status;
    throw error;
  }

  const data = await response.json();
  return normalizeStoreThemes(data);
};

type QueryFnType = typeof fetchStoreThemes;

type UseGetStoreThemesOptions = QueryConfigType<QueryFnType> & {
  params?: FetchStoreThemesParams;
};

export const useGetStoreThemesQuery = ({
  params,
  ...config
}: UseGetStoreThemesOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error?.status)) return false;
      return failureCount < 1;
    },
    queryKey: [queryKey.business.getStoreThemes, params?.search, params?.page],
    queryFn: () => fetchStoreThemes(params),
    staleTime: 5 * 60 * 1000,
    ...config,
  });
};
