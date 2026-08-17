import { downloadFile } from "./download-utils";

/**
 * Rasterises a DOM element to a canvas, matching how the payment terminal and
 * e-setup screens already export — html2canvas-pro at scale 3.
 *
 * Images are awaited first: html2canvas captures whatever is painted at that
 * instant, so a QR or logo still in flight would rasterise as a blank square.
 */
export const captureElementCanvas = async (element: HTMLElement | null) => {
  if (!element) return null;

  await Promise.all(
    Array.from(element.querySelectorAll("img")).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );

  const html2canvas = (await import("html2canvas-pro")).default;
  return html2canvas(element, {
    scale: 3,
    backgroundColor: "#ffffff",
    logging: false,
    useCORS: true,
    allowTaint: true,
    imageTimeout: 15000,
    removeContainer: true,
  });
};

/** Captures an element and saves it as a PNG. Resolves false if it could not. */
export const downloadElementAsPng = async (
  element: HTMLElement | null,
  filename: string,
) => {
  const canvas = await captureElementCanvas(element);
  if (!canvas) return false;

  return new Promise<boolean>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(false);
      downloadFile(blob, filename);
      resolve(true);
    }, "image/png");
  });
};
