// Shared helper for resolving the primary product image URL.
//
// New backend shape (POST /product/...): `media` is an array of
//   { id, file, type: "IMAGE" | "VIDEO" }
// Legacy shape: a single `image` URL string.
//
// Use this helper anywhere a product thumbnail is displayed (POS tile,
// inventory table, order rows, etc.) so both formats render correctly.

export interface ProductMediaItem {
  id?: string;
  file?: string;
  type?: "IMAGE" | "VIDEO" | string;
}

export interface ProductWithMedia {
  media?: ProductMediaItem[] | null;
  image?: string | null;
}

/**
 * Return the URL of the first image attached to a product, or `null`
 * if none is available. Prefers the new `media` array, falls back to
 * the legacy `image` field.
 */
export const getFirstProductImage = (
  product: ProductWithMedia | null | undefined,
): string | null => {
  if (!product) return null;

  if (Array.isArray(product.media)) {
    const firstImage = product.media.find(
      (m) =>
        m &&
        m.type === "IMAGE" &&
        typeof m.file === "string" &&
        m.file.length > 0,
    );
    if (firstImage?.file) return firstImage.file;
  }

  if (typeof product.image === "string" && product.image.length > 0) {
    return product.image;
  }

  return null;
};
