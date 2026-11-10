"use client";

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import {
  autoPricingOf,
  calculateSuggestedSellingPrice,
} from "@/utils/autoPricing";
import { useEffect, useRef } from "react";

/** The active business's automatic selling price settings. */
export const useAutoPricing = () => {
  const businessId = useBusinessStore((state) => state.business_id);
  const { data } = useFetchBusinessById(businessId, {
    enabled: Boolean(businessId),
  } as any);
  return autoPricingOf(data?.data);
};

const sameAsSuggested = (selling: unknown, suggested: number) =>
  suggested > 0 && Number(String(selling ?? "").replace(/,/g, "")) === suggested;

/**
 * Add/Edit Product: fills in the selling price as the cost is entered, for the
 * product and for each variation, until someone types their own price. Editing
 * anything else never touches the price.
 *
 * On a saved product it only follows the cost if the business has
 * "recalculate on cost change" on. New products and new variations always do.
 */
export const useProductAutoPrice = (
  form: any,
  isEditMode: boolean,
  /** The saved product, to tell a hand-set price from an automatic one. */
  savedProduct?: any,
) => {
  const pricing = useAutoPricing();
  // Prices typed by hand. Blank, or back to the suggestion, counts as automatic.
  const custom = useRef(new Set<string>());
  // Saved rows already checked against their saved cost and price.
  const checked = useRef(new Set<string>());
  const saved = useRef(savedProduct);
  saved.current = savedProduct;

  useEffect(() => {
    if (!pricing.enabled) return;

    const subscription = form.watch((_: unknown, { name }: { name?: string }) => {
      const match = name?.match(
        /^(?:product_variations\.(\d+)\.)?(cost_price|selling_price)$/,
      );
      if (!match) return;

      const [, index, field] = match;
      const prefix = index === undefined ? "" : `product_variations.${index}.`;
      const rowId: string =
        index === undefined ? "" : (form.getValues(`${prefix}id`) ?? "");
      const key = index === undefined ? "single" : rowId;
      const suggested = calculateSuggestedSellingPrice(
        form.getValues(`${prefix}cost_price`),
        pricing.margin,
      );

      if (field === "selling_price") {
        const selling = form.getValues(`${prefix}selling_price`);
        if (selling === "" || sameAsSuggested(selling, suggested)) {
          custom.current.delete(key);
        } else {
          custom.current.add(key);
        }
        return;
      }

      const isSaved = isEditMode && !rowId.startsWith("variation-");
      // A saved price that didn't match its saved cost was set by hand, and
      // changing the cost mustn't silently replace it.
      if (isSaved && !checked.current.has(key)) {
        checked.current.add(key);
        const item =
          index === undefined
            ? saved.current
            : saved.current?.variations?.find((v: any) => v.id === rowId);
        if (
          item &&
          !sameAsSuggested(
            item.selling_price,
            calculateSuggestedSellingPrice(item.cost_price, pricing.margin),
          )
        ) {
          custom.current.add(key);
        }
      }
      if (custom.current.has(key)) return;
      if (isSaved && !pricing.recalculate) return;

      form.setValue(`${prefix}selling_price`, suggested ? String(suggested) : "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    });

    return () => subscription.unsubscribe();
  }, [form, isEditMode, pricing.enabled, pricing.margin, pricing.recalculate]);

  return pricing;
};

/**
 * Restock: when a new cost is typed, the selling price follows it, until someone
 * types their own. Only typing counts: picking a variation loads that
 * variation's saved cost and price, which must stay as they are.
 */
export const useRestockAutoPrice = (form: any) => {
  const pricing = useAutoPricing();
  const custom = useRef(false);

  useEffect(() => {
    if (!pricing.enabled) return;

    const subscription = form.watch(
      (_: unknown, { name, type }: { name?: string; type?: string }) => {
        if (type !== "change") return;

        if (name === "variation_id") {
          custom.current = false;
          return;
        }

        const suggested = calculateSuggestedSellingPrice(
          form.getValues("cost_price"),
          pricing.margin,
        );

        if (name === "selling_price") {
          const selling = form.getValues("selling_price");
          custom.current =
            selling !== "" && !sameAsSuggested(selling, suggested);
          return;
        }

        // Restocking changes an existing product's cost, so the business's
        // "recalculate on cost change" setting decides.
        if (
          name === "cost_price" &&
          pricing.recalculate &&
          !custom.current &&
          suggested
        ) {
          form.setValue("selling_price", suggested, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [form, pricing.enabled, pricing.margin, pricing.recalculate]);

  return pricing;
};
