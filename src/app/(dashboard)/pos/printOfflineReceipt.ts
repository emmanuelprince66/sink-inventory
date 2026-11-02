import type { QueuedOfflineSale } from "@/lib/offline/offlineSales";
import { formatToNaira } from "@/utils/formatMoney";
import { format } from "date-fns";

const METHOD_LABEL: Record<string, string> = {
  CASH: "Cash",
  BANK: "Bank Transfer",
  CARD: "Card",
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const row = (label: string, value: string, bold = false) =>
  `<div class="row${bold ? " bold" : ""}"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`;

const STYLE = `
  body { font-family: Arial, sans-serif; color: #000; }
  .receipt { width: 280px; margin: 0 auto; font-size: 12px; }
  h1 { font-size: 15px; text-align: center; margin: 0 0 4px; }
  .center { text-align: center; }
  .rule { border-top: 1px dashed #000; margin: 8px 0; }
  .row { display: flex; justify-content: space-between; gap: 8px; margin: 2px 0; }
  .bold { font-weight: bold; font-size: 14px; }
`;

/**
 * A copy of the receipt for a sale still waiting to sync, built from what was
 * saved with it, so it prints with no internet. print-js is loaded on demand
 * because it needs the browser; the POS fetches it ahead of time.
 */
export const printOfflineReceipt = async (
  sale: QueuedOfflineSale,
  business: any,
) => {
  const { display, payload } = sale;
  const address = [business?.city, business?.state, business?.country]
    .filter(Boolean)
    .join(", ");
  const phone = business?.phone || business?.owner?.phone;

  const html = `
    <div class="receipt">
      <h1>${escapeHtml(business?.name ?? "Receipt")}</h1>
      ${address ? `<div class="center">${escapeHtml(address)}</div>` : ""}
      ${phone ? `<div class="center">${escapeHtml(phone)}</div>` : ""}
      <div class="center">Receipt copy</div>
      <div class="rule"></div>
      ${row("Receipt", `RC-${sale.client_sale_id.slice(0, 4)}`)}
      ${row("Date", format(new Date(payload.occurred_at), "dd MMM yyyy, h:mm a"))}
      ${row("Payment", METHOD_LABEL[payload.method] ?? payload.method)}
      ${display?.attendant_name ? row("Served by", display.attendant_name) : ""}
      ${display?.customer_name ? row("Customer", display.customer_name) : ""}
      <div class="rule"></div>
      ${(display?.items ?? [])
        .map((item) =>
          row(`${item.quantity} x ${item.name}`, formatToNaira(item.line_total)),
        )
        .join("")}
      ${display?.vat_amount ? row("VAT", formatToNaira(display.vat_amount)) : ""}
      <div class="rule"></div>
      ${row("Total", formatToNaira(sale.total), true)}
    </div>
  `;

  const { default: printJS } = await import("print-js");
  printJS({ printable: html, type: "raw-html", style: STYLE });
};
