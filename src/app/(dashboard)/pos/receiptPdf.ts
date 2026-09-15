import { jsPDF } from "jspdf";
import type { FinalizeDraftResponse } from "./instoreDraft";

// 80mm is the standard thermal receipt width, so the PDF looks like the paper
// slip a customer expects rather than a mostly-empty A4 page.
const WIDTH = 80;
const MARGIN = 6;
const BODY = WIDTH - MARGIN * 2;
const LINE = 4;

/**
 * "NGN 400.00".
 *
 * Not the naira sign: jsPDF's built-in fonts are WinAnsi-encoded and have no
 * glyph for U+20A6, so a ₦ comes out as a wrong character or a blank box.
 * Embedding a Unicode font to fix that would add ~300KB to the bundle for one
 * symbol on one screen.
 */
const money = (value?: string | number) =>
  "NGN " +
  (Number(value) || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (iso?: string) => {
  const date = iso ? new Date(iso) : new Date();
  return Number.isNaN(date.getTime())
    ? new Date().toLocaleString()
    : date.toLocaleString();
};

/**
 * Builds the customer's receipt as a PDF and saves it.
 *
 * Drawn from the finalize response rather than captured from the DOM:
 * html2canvas can't parse the oklch colours Tailwind v4 emits, and drawn text
 * stays selectable and sharp at any zoom instead of being a screenshot.
 */
export const downloadReceiptPdf = (result: FinalizeDraftResponse) => {
  const receipt = result.receipt;
  const items = receipt?.items ?? [];

  // Wrapping depends on the font, so measure with a throwaway document of the
  // same width, then build the real one at exactly the height needed.
  const measure = new jsPDF({ unit: "mm", format: [WIDTH, 300] });
  measure.setFontSize(8);
  const wrapped = items.map((item) =>
    measure.splitTextToSize(item.name, BODY) as string[],
  );

  const headerLines = 6;
  const footerLines = 7 + (result.balance && Number(result.balance) ? 1 : 0);
  const itemLines = wrapped.reduce((sum, lines) => sum + lines.length + 1, 0);
  const height =
    MARGIN * 2 + (headerLines + itemLines + footerLines) * LINE + 10;

  const doc = new jsPDF({ unit: "mm", format: [WIDTH, height] });
  const centre = WIDTH / 2;
  const right = WIDTH - MARGIN;
  let y = MARGIN + 2;

  const rule = () => {
    doc.setDrawColor(200);
    doc.line(MARGIN, y, right, y);
    y += 3;
  };

  // ---- header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(receipt?.business_name || "Receipt", centre, y, {
    align: "center",
  });
  y += LINE + 1;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (receipt?.business_phone) {
    doc.text(receipt.business_phone, centre, y, { align: "center" });
    y += LINE;
  }

  doc.text(result.order_code, centre, y, { align: "center" });
  y += LINE;
  doc.text(formatDate(receipt?.date), centre, y, { align: "center" });
  y += LINE;

  if (receipt?.customer_name) {
    const contact = [receipt.customer_name, receipt.customer_phone]
      .filter(Boolean)
      .join(" - ");
    doc.text(doc.splitTextToSize(contact, BODY), centre, y, {
      align: "center",
    });
    y += LINE;
  }

  y += 1;
  rule();

  // ---- items
  items.forEach((item, index) => {
    doc.setFont("helvetica", "bold");
    wrapped[index].forEach((line) => {
      doc.text(line, MARGIN, y);
      y += LINE;
    });

    doc.setFont("helvetica", "normal");
    const quantity = Number(item.quantity) || 0;
    doc.text(`${quantity} x ${money(item.unit_price)}`, MARGIN, y);
    doc.text(money(item.line_total), right, y, { align: "right" });
    y += LINE;
  });

  y += 1;
  rule();

  // ---- totals
  const row = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, MARGIN, y);
    doc.text(value, right, y, { align: "right" });
    y += LINE;
  };

  row("Total", money(receipt?.total_amount ?? result.total_price), true);
  row("Paid", money(receipt?.amount_paid));

  // Only shown when there IS one — a "Balance NGN 0.00" line on a settled
  // receipt reads like the customer still owes something.
  if (result.balance && Number(result.balance) > 0) {
    row("Balance", money(result.balance), true);
  }

  row("Method", receipt?.payment_method || result.payment_method || "-");

  y += 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Thank you for shopping with us", centre, y, { align: "center" });

  doc.save(`${result.order_code}.pdf`);
};
