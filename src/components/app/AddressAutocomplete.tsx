"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import {
  Coordinates,
  AddressSuggestion,
  fetchAddressDetails,
  fetchAddressSuggestions,
  newSessionToken,
} from "@/utils/address";
import { Check, Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AddressAutocompleteProps {
  value: string;
  /** Fired on every keystroke. The caller should clear any stored coordinates
   * here — coordinates from a previously picked suggestion no longer describe
   * whatever the user is now typing. */
  onChange: (value: string) => void;
  /** Fired when a suggestion is picked. Carries street/city/state + coords. */
  onSelect: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Render as a Textarea (order form) rather than an Input (settings form). */
  multiline?: boolean;
  rows?: number;
  /** Bias results toward this point — pass the merchant's pickup coordinates. */
  proximity?: Coordinates | null;
  /** Show the "Location pinned" confirmation. Caller owns coordinate state. */
  hasCoordinates?: boolean;
  /** Hide the helper line under the field. */
  hideHint?: boolean;
  /** Rendered under the field when a completed search returned nothing —
   * used for the GPS fallback on the pickup address. Deliberately a render
   * prop rather than a built-in button: the fallback only makes sense where
   * the user is physically at the address being entered, which is true of the
   * merchant's own pickup point and false of a customer's delivery address. */
  renderNoResults?: () => React.ReactNode;
}

/**
 * What a picked suggestion reads as in the field.
 *
 * The prediction's own two lines, minus the trailing country. Deliberately not
 * the resolved address that comes back from Place Details: those are different
 * strings, and swapping one for the other a moment after the click makes the
 * field look like it overrode the choice. Whatever is shown here is what gets
 * stored, and nothing rewrites it afterwards.
 */
const pickedText = (suggestion: AddressSuggestion) => {
  const full =
    suggestion.secondary
      ? `${suggestion.address}, ${suggestion.secondary}`
      : suggestion.label || suggestion.address;
  return full.replace(/,\s*Nigeria\s*$/i, "").trim();
};

const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing an address...",
  disabled = false,
  className,
  id,
  multiline = false,
  rows = 2,
  proximity,
  hasCoordinates = false,
  hideHint = false,
  renderNoResults,
}: AddressAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  // The query a search actually completed for. Gating the no-results fallback
  // on this (rather than just `suggestions.length === 0`) stops it flashing on
  // mount, when the field is prefilled but nothing has been searched yet.
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // Set when the proxy reports GOOGLE_MAPS_API_KEY is missing — the field then
  // behaves as a plain text input instead of showing a permanently empty
  // dropdown.
  const [lookupDisabled, setLookupDisabled] = useState(false);
  // A pick is not instant any more: Google returns no coordinates with a
  // prediction, so selecting one costs a Place Details round trip.
  const [isResolving, setIsResolving] = useState(false);

  // One Google Places session spans every keystroke plus the single Place
  // Details call that follows, and is billed as one lookup. Rotated after each
  // pick, because that is exactly what closes a session.
  const sessionToken = useRef<string>(newSessionToken());

  const containerRef = useRef<HTMLDivElement>(null);
  // Text that arrived programmatically — a picked suggestion, or a parent
  // hydrating the field. Searching for it would just re-query the exact
  // string we already resolved. Compared by value rather than tracked with a
  // boolean flag: a flag set for a debounce tick that never fires (because
  // the text didn't actually change) stays set and silently swallows the
  // user's next real search.
  const suppressedQuery = useRef<string | null>(null);

  const debouncedQuery = useDebounce(query, 350);

  // `isSearching` only covers the request itself, which leaves the 350ms
  // debounce window with no feedback at all — the field reads as frozen right
  // after a keystroke. isBusy spans typing → debounce → response so the
  // spinner is continuous.
  const isBusy =
    isSearching ||
    isResolving ||
    (query.trim().length >= 3 &&
      query !== debouncedQuery &&
      suppressedQuery.current !== query);

  // Keep in sync when the parent resets or hydrates the field (e.g. the
  // customer's saved address prefilling the order form).
  useEffect(() => {
    if (value !== query) {
      suppressedQuery.current = value;
      setQuery(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (suppressedQuery.current === debouncedQuery) return;
    if (lookupDisabled || disabled) return;
    if (!debouncedQuery || debouncedQuery.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let ignore = false;
    setIsSearching(true);

    fetchAddressSuggestions(debouncedQuery, {
      limit: 6,
      proximity,
      sessionToken: sessionToken.current,
    })
      .then((res) => {
        if (ignore) return;
        if (res.disabled) {
          setLookupDisabled(true);
          setSuggestions([]);
          setIsOpen(false);
          return;
        }
        setSuggestions(res.data);
        setIsOpen(res.data.length > 0);
        setSearchedQuery(debouncedQuery);
      })
      .catch(() => {
        if (!ignore) {
          setSuggestions([]);
          setIsOpen(false);
        }
      })
      .finally(() => {
        if (!ignore) setIsSearching(false);
      });

    return () => {
      ignore = true;
    };
    // `proximity` is an object rebuilt on each render by some callers —
    // depending on it directly would refire the search endlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, lookupDisabled, disabled]);

  // Close on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (next: string) => {
    // Typing is always a real search intent, even if it lands back on the
    // previously suppressed string.
    suppressedQuery.current = null;
    setQuery(next);
    onChange(next);
  };

  const handleSelect = async (suggestion: AddressSuggestion) => {
    // Settled once, here, and never touched again.
    const text = pickedText(suggestion);
    suppressedQuery.current = text;
    setQuery(text);
    setSuggestions([]);
    setIsOpen(false);

    // Anything already carrying coordinates (a reverse-geocode result) needs
    // no resolving.
    if (!suggestion.placeId || suggestion.latitude) {
      onSelect({ ...suggestion, address: text });
      return;
    }

    setIsResolving(true);
    const resolved = await fetchAddressDetails(
      suggestion.placeId,
      sessionToken.current,
    );
    setIsResolving(false);

    // A pick closes the session whether or not the lookup succeeded.
    sessionToken.current = newSessionToken();

    // Details supplies city, state and coordinates — the structured fields the
    // prediction cannot fill. Its own address line is dropped: the merchant
    // already chose one, and replacing it is the flicker this avoids. On
    // failure the pick still stands, just without coordinates, which every
    // caller already handles.
    onSelect({ ...(resolved ?? suggestion), address: text });
  };

  const sharedProps = {
    id,
    value: query,
    placeholder,
    disabled,
    onFocus: () => {
      if (suggestions.length > 0) setIsOpen(true);
    },
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {multiline ? (
        <Textarea
          {...sharedProps}
          rows={rows}
          onChange={(e) => handleChange(e.target.value)}
        />
      ) : (
        <Input
          {...sharedProps}
          onChange={(e) => handleChange(e.target.value)}
          icon={
            isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasCoordinates ? (
              <Check className="h-4 w-4 text-primary-green-300" />
            ) : (
              <Search className="h-4 w-4" />
            )
          }
        />
      )}

      {/* Multiline variant can't use the Input `icon` slot — show the spinner
          in the corner instead so there's still feedback while searching. */}
      {multiline && isBusy && (
        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-grey-4" />
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-grey-5 bg-white shadow-lg">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-3 py-2.5 hover:bg-secondary-6 transition-colors cursor-pointer flex items-start gap-2.5 border-b border-grey-5 last:border-b-0"
              >
                <MapPin className="w-4 h-4 text-primary-green-300 shrink-0 mt-0.5" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-grey-1 truncate">
                    {s.address || s.label}
                  </span>
                  <span className="block text-xs text-grey-3 truncate">
                    {s.secondary ||
                      [s.city, s.state].filter(Boolean).join(", ") ||
                      s.label}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Fallback slot — only once a search has genuinely come back empty,
          and never when the user already pinned a location. */}
      {renderNoResults &&
        !lookupDisabled &&
        !disabled &&
        !isBusy &&
        !hasCoordinates &&
        suggestions.length === 0 &&
        searchedQuery !== null &&
        searchedQuery === debouncedQuery &&
        renderNoResults()}

      {!hideHint && !lookupDisabled && (
        <p
          className={cn(
            "text-[11px] mt-1",
            hasCoordinates ? "text-primary-green-300" : "text-grey-3",
          )}
        >
          {hasCoordinates
            ? "Location pinned — coordinates will be sent with this address."
            : "Pick a suggestion so we can pin the exact location for the courier."}
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
