import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useDebounce } from "./useDebounce";

/**
 * Answers "have we met this person before?" while a phone number is being
 * typed.
 *
 * A till creates duplicates the same way every time: a regular gives their
 * number, the attendant does not recognise the name, and a second record is
 * created for someone who already has a loyalty card and a wallet balance. The
 * customer search already matches on phone, so the number being typed is
 * enough to catch it before the Save button is reached.
 *
 * Nothing here writes to the form — it reports matches and lets the caller
 * decide, because overwriting a half-typed record is worse than the duplicate
 * it would prevent.
 */

/** Six digits: enough to be a real prefix, short enough to hit mid-typing. */
const MIN_DIGITS = 6;

const digitsOf = (value: string) => value.replace(/\D/g, "");

export const useCustomerPhoneLookup = (phone: string) => {
  const business_id = useBusinessStore((state) => state.business_id);

  // Longer than a keystroke, shorter than the 500ms list search: this runs
  // while someone is reading a number off a card, not while they browse.
  const debounced = useDebounce(phone ?? "", 400);
  const digits = digitsOf(debounced);
  const enabled = Boolean(business_id) && digits.length >= MIN_DIGITS;

  const { data, isFetching } = useGetCustomerQuery({
    params: { id: business_id, search: digits, limit: 5, page: 1 },
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  const results: any[] = enabled ? (data?.data?.results?.data ?? []) : [];

  // The endpoint searches name and email as well, so a number that happens to
  // appear in someone's email would come back too. Only a real phone match is
  // worth interrupting the attendant over.
  const matches = results.filter((customer) =>
    digitsOf(String(customer?.phone ?? "")).includes(digits),
  );

  return {
    matches,
    /** True only while a lookup that can produce matches is in flight. */
    isSearching: enabled && isFetching,
  };
};
