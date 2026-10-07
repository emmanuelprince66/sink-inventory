/**
 * Looking a scanned barcode up against the catalogue.
 *
 * A barcode identifies a manufactured product, not one shop's listing of it —
 * the same EAN is the same bottle wherever it is sold, with the same photo,
 * the same unit and the same name on the label. So anything already recorded
 * against that code is worth offering rather than making someone retype it.
 *
 *     GET /product/sku/?sku={barcode}
 *
 * Everything here fails soft. A barcode nobody has listed is a normal outcome,
 * so a miss and an outage both come back as `null` and the merchant fills the
 * form in by hand. Nothing about adding a product may depend on this working.
 */

/**
 * One product as `/product/sku/` returns it.
 *
 * Note what is deliberately NOT used from this response. `quantity`,
 * `low_stock_threshold`, `expiry_date`, `cost_price`, `selling_price` and the
 * discount pair all describe the other merchant's stock and pricing decisions,
 * not the product — copying them would quietly set this shop's prices from
 * somebody else's shelf.
 */
export interface CatalogueProduct {
  name: string;
  sku?: string | null;
  /** Absolute URL, or null when the listing has no photo. */
  image?: string | null;
  /** "Pcs", "kg", "litre"… maps to the form's product_unit. */
  unit?: string | null;
  description?: string | null;
  /** Not yet returned — see the asks in the scan component. */
  weight?: string | number | null;

  // Present on the response, intentionally unused. Listed so the next person
  // can see they were considered rather than missed.
  quantity?: string | null;
  low_stock_threshold?: string | null;
  expiry_date?: string | null;
  cost_price?: string | null;
  selling_price?: string | null;
  discount?: string | null;
  discount_type?: string | null;
}

/** The product's image URL, where it has one. */
export const imageUrlOf = (product: CatalogueProduct): string | null =>
  typeof product.image === "string" && product.image ? product.image : null;

/** Unwraps the route handler's envelope; null for a miss. */
const unwrap = (payload: any): CatalogueProduct | null => {
  const body = payload?.data ?? payload;
  return body?.name ? (body as CatalogueProduct) : null;
};

export const lookupProductByBarcode = async (
  barcode: string,
): Promise<CatalogueProduct | null> => {
  const code = barcode.trim();
  if (!code) return null;

  try {
    const url = new URL("/api/products/sku-lookup", window.location.origin);
    url.searchParams.set("sku", code);

    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) return null;

    return unwrap(await response.json().catch(() => null));
  } catch {
    return null;
  }
};

/**
 * The found image as an uploadable File.
 *
 * Creating a product uploads real files — a URL is only honoured on edit, as a
 * kept media id — so the image has to be fetched and re-uploaded. It goes
 * through our own origin because the bucket sends no CORS header and a direct
 * fetch from the page is blocked outright.
 *
 * Null on any failure: the photo is the nicest part of this and the least
 * important. Losing it must never cost the merchant the rest of the details.
 */
export const fetchImageAsFile = async (
  imageUrl: string,
  fileName = "scanned-product",
): Promise<File | null> => {
  try {
    const proxied = new URL("/api/media/image-proxy", window.location.origin);
    proxied.searchParams.set("url", imageUrl);

    const response = await fetch(proxied.toString());
    if (!response.ok) return null;

    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;

    const extension = blob.type.split("/")[1]?.split("+")[0] || "jpg";
    return new File([blob], `${fileName}.${extension}`, { type: blob.type });
  } catch {
    return null;
  }
};
