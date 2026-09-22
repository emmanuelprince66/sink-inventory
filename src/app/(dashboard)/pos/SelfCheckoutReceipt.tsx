"use client";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { Button } from "@/components/ui/button";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import {
  Document,
  Page,
  PDFDownloadLink,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { CheckCircle2, Download, Printer } from "lucide-react";
import printJS from "print-js";
import { useRef, useState } from "react";
import type { FinalizeDraftResponse } from "./instoreDraft";
import { RECEIPT_PRINT_STYLE, styles } from "./PrintReceiptView";

/**
 * The self-checkout receipt, laid out exactly like the POS one
 * (PrintReceiptView): same header, items table, total, transaction details,
 * payment block and footer, printed with the same stylesheet and saved with
 * the same PDF styles.
 *
 * It is its own component rather than PrintReceiptView fed a fake sale,
 * because that one reads the live cart and a createSale response — this reads
 * the finalize response, so the receipt shows what the backend actually
 * charged, including any quantities the cashier changed at the counter.
 */

type ReceiptLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
};

const money = (value?: string | number | null) => Number(value) || 0;

/** "BANK-TRANSFER" → "BANK TRANSFER". */
const methodLabel = (method?: string | null) =>
  (method || "cash").replace(/[_-]/g, " ").toUpperCase();

const readReceipt = (result: FinalizeDraftResponse) => {
  const receipt = result.receipt;
  const lines: ReceiptLine[] = (receipt?.items ?? []).map((item) => ({
    name: item.name,
    quantity: Number(item.quantity) || 0,
    unitPrice: money(item.unit_price),
    discount: money(item.discount),
    lineTotal: money(item.line_total),
  }));
  const total = money(result.total_price ?? receipt?.total_amount);
  const paid = money(receipt?.amount_paid);
  const balance = money(result.balance);

  return {
    lines,
    total,
    // Only when there is one: "Balance ₦0.00" on a settled receipt reads as
    // if the customer still owes something.
    paid: balance > 0 ? paid : null,
    balance: balance > 0 ? balance : null,
    dueDate: balance > 0 ? result.due_date : null,
    method: methodLabel(result.payment_method || receipt?.payment_method),
    date: receipt?.date,
    // Same short form the POS prints, off the sale this finalize created.
    receiptNumber: `RC-${(result.sale_id || result.id || "").slice(0, 4)}`,
    orderCode: result.order_code,
    customerName: receipt?.customer_name,
  };
};

type ReceiptData = ReturnType<typeof readReceipt>;

const dateText = (date?: string) => {
  const parsed = date ? new Date(date) : new Date();
  return format(
    Number.isNaN(parsed.getTime()) ? new Date() : parsed,
    "MMMM d, yyyy, h:mm a",
  );
};

const SelfCheckoutReceiptPDF = ({
  data,
  business,
  attendantName,
  userAttendantName,
}: {
  data: ReceiptData;
  business: any;
  attendantName?: string;
  userAttendantName?: string;
}) => {
  const contactEmail = business?.email || business?.owner?.email || "";
  const contactPhone = business?.phone || business?.owner?.phone || "";

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>PAYMENT RECEIPT</Text>
          <Text style={styles.subtitle}>TRANSACTION SUCCESSFUL</Text>
          <Text style={styles.businessName}>{business?.name || "STORE"}</Text>
          {(business?.street || business?.city) && (
            <Text style={styles.businessAddress}>
              {business?.street && `${business.street}, `}
              {business?.city}, {business?.state}, {business?.country}
            </Text>
          )}
          <View style={styles.contactInfo}>
            {contactEmail && (
              <Text style={styles.contactText}>{contactEmail}</Text>
            )}
            {contactEmail && contactPhone && (
              <Text style={styles.separator}>|</Text>
            )}
            {contactPhone && (
              <Text style={styles.contactText}>{contactPhone}</Text>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cellItem, styles.tableHeaderText]}>ITEM</Text>
            <Text style={[styles.cellQty, styles.tableHeaderText]}>QTY</Text>
            <Text style={[styles.cellPrice, styles.tableHeaderText]}>
              PRICE
            </Text>
            <Text style={[styles.cellTotal, styles.tableHeaderText]}>
              TOTAL
            </Text>
          </View>
          {data.lines.map((line, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.cellItem}>
                <Text style={styles.itemName}>{line.name}</Text>
              </View>
              <Text style={styles.cellQty}>{line.quantity}</Text>
              <View style={styles.cellPrice}>
                <Text>{formatToNaira(line.unitPrice)}</Text>
                {line.discount > 0 && (
                  <Text
                    style={{ fontSize: 6, fontStyle: "italic", color: "green" }}
                  >
                    Discount - {formatToNaira(line.discount)}
                  </Text>
                )}
              </View>
              <Text style={styles.cellTotal}>
                {formatToNaira(line.lineTotal)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalAmount}>{formatToNaira(data.total)}</Text>
        </View>

        <View style={styles.transactionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{dateText(data.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Receipt No:</Text>
            <Text style={styles.detailValue}>{data.receiptNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Code:</Text>
            <Text style={styles.detailValue}>{data.orderCode}</Text>
          </View>
          {data.customerName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer:</Text>
              <Text style={styles.detailValue}>{data.customerName}</Text>
            </View>
          )}
          {attendantName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Attendant:</Text>
              <Text style={styles.detailValue}>{attendantName}</Text>
            </View>
          )}
          {userAttendantName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Attendant:</Text>
              <Text style={styles.detailValue}>{userAttendantName}</Text>
            </View>
          )}
          {data.paid !== null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid:</Text>
              <Text style={styles.detailValue}>{formatToNaira(data.paid)}</Text>
            </View>
          )}
          {data.balance !== null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Balance:</Text>
              <Text style={styles.detailValue}>
                {formatToNaira(data.balance)}
              </Text>
            </View>
          )}
          {data.dueDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>
                {format(new Date(data.dueDate), "MMMM d, yyyy")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.paymentMethodBox}>
          <Text style={styles.paymentMethodTitle}>PAYMENT METHOD(S):</Text>
          <Text style={styles.paymentMethodValue}>{data.method}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.thankyou}>THANK YOU!</Text>
          <Text style={styles.poweredBy}>
            Powered by Sync360 | www.sync360.africa
          </Text>
        </View>
        {data.lines.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.poweredBy}>
              Goods bought in good condition are not returnable.
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="detail-row flex justify-between items-center">
    <span className="detail-label text-[11px] ">{label}</span>
    <span className="detail-value text-[11px] ">{value}</span>
  </div>
);

const SelfCheckoutReceipt = ({
  result,
  attendant,
  onDone,
  onNext,
}: {
  result: FinalizeDraftResponse;
  /** Picked in the modal's attendant drawer, if any. */
  attendant?: { name?: string } | null;
  onDone: () => void;
  onNext: () => void;
}) => {
  const data = readReceipt(result);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const { user } = useUserRole();

  // Same business source as the POS receipt: the live profile first, so edits
  // to address or phone show up, then the cached copy while it loads. The
  // finalize response's own name and phone are the last resort.
  const business_id = useBusinessStore((s) => s.business_id);
  const { data: liveBusinessQuery } = useFetchBusinessById(business_id, {
    staleTime: 0,
    refetchOnMount: "always",
  });
  const { businessData: cachedBusinessData } = useBusinessDataStore();
  const business = liveBusinessQuery?.data ||
    cachedBusinessData || {
      name: result.receipt?.business_name,
      phone: result.receipt?.business_phone,
    };

  const attendantName = attendant?.name;
  const userAttendantName =
    user?.role === "ATTENDANT" ? user?.name : undefined;

  const handlePrint = () => {
    if (isPrinting || !receiptRef.current) return;
    setIsPrinting(true);
    const timeoutId = setTimeout(() => setIsPrinting(false), 5000);
    try {
      printJS({
        printable: receiptRef.current.innerHTML,
        type: "raw-html",
        style: RECEIPT_PRINT_STYLE,
        onPrintDialogClose: () => {
          clearTimeout(timeoutId);
          setIsPrinting(false);
        },
        onError: (err) => {
          clearTimeout(timeoutId);
          setIsPrinting(false);
          console.error("Print error:", err);
        },
        modalMessage: "Preparing print...",
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Print failed:", error);
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center pt-2 text-center">
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-success-2">
          <CheckCircle2 className="h-5 w-5 text-success-1" />
        </div>
        <h3 className="text-base font-extrabold text-grey-1">
          {result.message || "Order completed"}
        </h3>
      </div>

      <div className="flex justify-center rounded-xl border border-grey-5 bg-grey-6/40 p-3">
        {/* Same markup and class names as PrintReceiptView — the print
            stylesheet targets these classes. */}
        <div
          ref={receiptRef}
          className="receipt-container bg-white rounded-lg w-full max-w-[380px] p-2"
        >
          <div className="receipt-header text-center w-full business-info p-2 flex flex-col items-center gap-1 justify-center">
            <h2 className="receipt-title text-[13px] detail-value">
              PAYMENT RECEIPT
            </h2>
            <p className="business-name receipt-little font-semibold">
              {business?.name}
            </p>
            {(business?.street || business?.city) && (
              <p className="business-address text-[11px] receipt-little text-gray-500">
                {business?.street && `${business.street}, `}
                {business?.city}, {business?.state}, {business?.country}
              </p>
            )}
            {(business?.email || business?.owner?.email) && (
              <p className="business-email text-[11px]  receipt-little text-gray-500">
                {business?.email || business?.owner?.email}
              </p>
            )}
            {(business?.phone || business?.owner?.phone) && (
              <p className="business-phone text-[11px]  receipt-little text-gray-500">
                {business?.phone || business?.owner?.phone}
              </p>
            )}
          </div>

          <div className="items-table w-full">
            <table className="w-full table-auto ">
              <thead className="w-full">
                <tr className="text-left bg-green-50 w-full">
                  <th>ITEM</th>
                  <th className="text-center text-[11px] ">QTY</th>
                  <th className="text-right text-[11px] ">PRICE</th>
                  <th className="text-right text-[11px] ">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {data.lines.map((line, index) => (
                  <tr key={index}>
                    <td className="item-name text-[11px]">
                      <div>{line.name}</div>
                    </td>
                    <td className="text-center text-[11px]">{line.quantity}</td>
                    <td className="text-right text-[11px] price-cell">
                      <div className="price-cell-container">
                        <div className="price-main">
                          {formatToNaira(line.unitPrice)}
                        </div>
                        {line.discount > 0 && (
                          <div className="discount-text">
                            Discount - {formatToNaira(line.discount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right text-[11px] price-cell">
                      {formatToNaira(line.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="total-row flex justify-between">
            <span className="text-[11px]">TOTAL:</span>
            <span className=" text-[11px] detail-value">
              {formatToNaira(data.total)}
            </span>
          </div>

          <div className="transaction-details">
            <DetailRow label="Date:" value={dateText(data.date)} />
            <DetailRow label="Receipt No:" value={data.receiptNumber} />
            <DetailRow label="Order Code:" value={data.orderCode} />
            {data.customerName && (
              <DetailRow label="Customer:" value={data.customerName} />
            )}
            {attendantName && (
              <DetailRow label="Attendant:" value={attendantName} />
            )}
            {userAttendantName && (
              <DetailRow label="Attendant:" value={userAttendantName} />
            )}
            {data.paid !== null && (
              <DetailRow label="Amount Paid:" value={formatToNaira(data.paid)} />
            )}
            {data.balance !== null && (
              <DetailRow label="Balance:" value={formatToNaira(data.balance)} />
            )}
            {data.dueDate && (
              <DetailRow
                label="Due Date:"
                value={format(new Date(data.dueDate), "MMMM d, yyyy")}
              />
            )}
          </div>

          <div className="payment-method">
            <span className="payment-method-title text-[11px]">
              PAYMENT METHOD(S):
            </span>
            <span className="payment-method-value text-[11px]">
              {data.method}
            </span>
          </div>

          {data.lines.length > 0 && (
            <div className="receipt-footer flex justify-between flex-col items-center">
              <p className="powered-by text-[9px] py-4 ">
                Goods bought in good condition are not returnable.
              </p>
            </div>
          )}

          <div className="receipt-footer flex justify-between flex-col items-center">
            <p className="thank-you text-[13px] ">THANK YOU!</p>
            <p className="powered-by text-[9px] ">
              Powered by Sync360 | www.sync360.africa
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-11 flex-1 gap-2 hover:bg-gray-50 border-green-200"
            disabled={isPrinting}
          >
            {isPrinting ? (
              "Printing..."
            ) : (
              <>
                <Printer size={18} className="text-green-600" />
                <span className="text-green-600">Print Receipt</span>
              </>
            )}
          </Button>

          <PDFDownloadLink
            className="flex-1"
            document={
              <SelfCheckoutReceiptPDF
                data={data}
                business={business}
                attendantName={attendantName}
                userAttendantName={userAttendantName}
              />
            }
            fileName={`receipt-${data.orderCode || data.receiptNumber}.pdf`}
          >
            {({ loading, error }) => (
              <Button
                variant="outline"
                className="h-11 w-full gap-2 hover:bg-gray-50 border-green-200"
                disabled={loading || !!error}
              >
                {error ? (
                  "Error generating PDF"
                ) : loading ? (
                  "Generating PDF..."
                ) : (
                  <>
                    <Download size={18} className="text-green-600" />
                    <span className="text-green-600">Save as PDF</span>
                  </>
                )}
              </Button>
            )}
          </PDFDownloadLink>
        </div>

        {/* Kept on their own row: side by side with Print, a cashier mis-taps
            Done instead of Print. */}
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 flex-1" onClick={onNext}>
            Next Order
          </Button>
          <Button className="h-11 flex-1" onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelfCheckoutReceipt;
