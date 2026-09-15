/**
 * The two app-store marks, drawn rather than imported as images.
 *
 * Both appear inside artwork that gets captured to an image — the printed
 * payment terminal and the transfer receipt — where an <img> is one more thing
 * that has to have finished loading before the capture is allowed to start.
 * Inline SVG is always ready, and stays sharp at whatever scale the capture
 * runs at.
 *
 * The pill around them is deliberately not here: the terminal's badges step up
 * at the sm breakpoint and the receipt's do not, so each screen keeps its own
 * layout and shares only the marks.
 */

/** Google Play's four-colour triangle. */
export const GooglePlayGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M3 20.5V3.5c0-.59.34-1.11.84-1.35L13.69 12 3.84 21.85C3.34 21.6 3 21.09 3 20.5Z"
      fill="#00D3FF"
    />
    <path d="M16.81 15.12 6.05 21.34l8.49-8.49 2.27 2.27Z" fill="#00F076" />
    <path
      d="M20.16 10.81c.34.27.59.69.59 1.19 0 .5-.22.9-.57 1.18l-2.29 1.32L15.39 12l2.5-2.5 2.27 1.31Z"
      fill="#FFC900"
    />
    <path d="M6.05 2.66 16.81 8.88l-2.27 2.27L6.05 2.66Z" fill="#FF3A44" />
  </svg>
);

/** The Apple mark, in whatever colour the `fill` class sets. */
export const AppStoreGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="#FFFFFF" className={className} aria-hidden>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);
