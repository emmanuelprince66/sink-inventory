import {
  Document,
  Font,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { Download, Printer, Undo2 } from "lucide-react";
import moment from "moment";
import printJS from "print-js";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { rewardBreakdownOf, SalesOrder } from "./types";

import { Spinner } from "@/components/app/Spinner";
import LoyaltyRewardTag from "@/components/LoyaltyRewardTag";
import { useSalesHook } from "@/hooks/useSalesHook";
import { formatToNaira } from "@/utils/formatMoney";

/**
 * What was actually charged.
 *
 * `total_price` is the backend's own figure and is what the customer paid, so
 * it wins — a percentage reward comes off the bill without touching any line,
 * and summing the items would print more than was taken.
 *
 * The line sum stands in only where the field is missing. `price` is the net
 * line total the backend already worked out, quantity and discount included,
 * so the lines are summed as they are; multiplying by quantity again would
 * triple a three-unit line.
 */
const totalOf = (order: SalesOrder): number => {
  const stated = Number(order?.total_price);
  if (Number.isFinite(stated)) return stated;

  return (order?.products ?? []).reduce(
    (total, product) => total + (Number(product?.price) || 0),
    0,
  );
};

// Register fonts for PDF
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: "normal",
      fontStyle: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
      fontStyle: "normal",
    },
  ],
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 4, // Reduced from 8
    fontSize: 10, // Reduced from 12
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 8, // Reduced from 16
    textAlign: "center",
    paddingBottom: 4, // Reduced from 12
    borderBottomWidth: 0.5, // Reduced from 1
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 14, // Reduced from 20
    fontWeight: "bold",
    marginBottom: 4, // Reduced from 8
    color: "#329661",
  },
  subtitle: {
    color: "#329661",
    marginBottom: 6, // Reduced from 12
    fontWeight: "bold",
    fontSize: 10, // Reduced from 14
  },
  businessName: {
    fontSize: 12, // Reduced from 16
    fontWeight: "bold",
    marginBottom: 2, // Reduced from 4
  },
  businessAddress: {
    fontSize: 8, // Reduced from 10
    color: "#6b7280",
    marginBottom: 2, // Reduced from 4
    lineHeight: 1.2, // Added to make multiline text more compact
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2, // Reduced from 4
  },
  contactText: {
    fontSize: 8, // Reduced from 10
    color: "#6b7280",
  },
  separator: {
    marginHorizontal: 4, // Reduced from 8
    color: "#6b7280",
  },
  table: {
    width: "100%",
    marginVertical: 8, // Reduced from 16
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eef7e0",
    paddingVertical: 4, // Reduced from 8
    paddingHorizontal: 2, // Reduced from 4
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 10, // Reduced from 12
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5, // Reduced from 1
    borderBottomColor: "#f3f4f6",
    paddingVertical: 6, // Reduced from 12
    paddingHorizontal: 2, // Reduced from 4
  },
  cellItem: {
    flex: 3,
    paddingRight: 2, // Reduced from 4
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 10, // Reduced from 12
  },
  // Same green as the POS receipt's badge, so a reward reads the same on the
  // paper the customer took home and on the copy reprinted from history.
  rewardBadge: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#0f7b4f",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 2,
    alignSelf: "flex-start",
  },
  rewardNote: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 2,
    fontSize: 9,
    color: "#0f7b4f",
  },
  subtotalNote: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 2,
    fontSize: 9,
    color: "#6b7280",
  },
  cellQty: {
    flex: 1,
    textAlign: "center",
    fontSize: 10, // Added for consistency
  },
  cellPrice: {
    flex: 2,
    textAlign: "right",
    paddingRight: 2, // Reduced from 4
    fontSize: 10, // Added for consistency
  },
  cellTotal: {
    flex: 2,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 10, // Added for consistency
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8, // Reduced from 16
    paddingTop: 6, // Reduced from 12
    borderTopWidth: 1, // Reduced from 2
    borderTopColor: "#329661",
    fontSize: 14, // Reduced from 16
    fontWeight: "bold",
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 14, // Reduced from 16
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 14, // Reduced from 16
    color: "#329661",
  },
  transactionDetails: {
    backgroundColor: "#f9fafb",
    borderRadius: 4, // Reduced from 6
    padding: 1, // Reduced from 2
    marginVertical: 3, // Reduced from 5
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  detailLabel: {
    fontSize: 10, // Reduced from 14
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 12, // Reduced from 14
    fontWeight: "bold",
    flexShrink: 1, // Allow text to wrap if needed
  },
  paymentMethodBox: {
    marginTop: 1, // Reduced from 2
    padding: 2, // Reduced from 4
    flexDirection: "row", // Keep as row for single line or header
    justifyContent: "space-between",
    backgroundColor: "#eef7e0",
    borderRadius: 4, // Reduced from 6
  },
  paymentMethodEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 1,
    paddingHorizontal: 2,
    fontSize: 9, // Slightly smaller for multiple entries
    color: "#329661",
  },
  paymentMethodTitle: {
    fontSize: 10, // Reduced from 10
    color: "#6b7280",
    marginBottom: 1, // Reduced from 3
  },
  paymentMethodValue: {
    fontSize: 8, // Kept same
    fontWeight: "bold",
    color: "#329661",
  },
  footer: {
    marginTop: 2, // Reduced from 5
    textAlign: "center",
    paddingTop: 4, // Reduced from 8
    borderTopWidth: 0.5, // Reduced from 1
    borderTopColor: "#e5e7eb",
  },
  thankyou: {
    fontSize: 8, // Kept same
    fontWeight: "bold",
    marginBottom: 2, // Reduced from 4
  },
  poweredBy: {
    marginTop: 2, // Reduced from 4
    fontSize: 6, // Increased from 5 for better readability
    color: "#9ca3af",
  },
});

// PDF Document Component for Order History
const OrderHistoryPDFDocument = ({
  orderDetails,
  business,
  tt,
}: {
  orderDetails: SalesOrder;
  business: any;
  tt: any;
}) => {
  const shortOrderId = orderDetails.id.substring(0, 6);

  const receiptNumber = `${business.name
    .slice(0, 2)
    .toUpperCase()}-${orderDetails?.id.slice(0, 8)}`;

  const reward = rewardBreakdownOf(orderDetails);

  try {
    return (
      <Document>
        <Page size="A5" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>ORDER RECEIPT</Text>
            <Text style={styles.subtitle}>ORDER DETAILS</Text>

            <Text style={styles.businessName}>{business?.name || "STORE"}</Text>
          </View>

          {/* Order Info */}
          <View style={styles.transactionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID:</Text>
              <Text style={styles.detailValue}>#{shortOrderId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {format(
                  new Date(orderDetails.created_at),
                  "MMMM d, yyyy, h:mm a",
                )}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>
                {orderDetails.payment_status}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Attendant:</Text>
              <Text style={styles.detailValue}>{orderDetails.attendant}</Text>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellItem, styles.tableHeaderText]}>
                ITEM
              </Text>
              <Text style={[styles.cellQty, styles.tableHeaderText]}>QTY</Text>
              <Text style={[styles.cellPrice, styles.tableHeaderText]}>
                PRICE
              </Text>
              <Text style={[styles.cellTotal, styles.tableHeaderText]}>
                TOTAL
              </Text>
            </View>

            {orderDetails.products.map((product, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.cellItem}>
                  <Text style={styles.itemName}>{product.name}</Text>
                  {product.is_loyalty_reward && (
                    <Text style={styles.rewardBadge}>FREE · LOYALTY</Text>
                  )}
                </View>
                <Text style={styles.cellQty}>{product.quantity}</Text>
                <Text style={styles.cellPrice}>
                  {formatToNaira(parseFloat(product?.unit_price))}
                </Text>
                <Text style={styles.cellTotal}>
                  {formatToNaira(Number(product.price) || 0)}
                </Text>
              </View>
            ))}
          </View>

          {/* The reward, on the printed copy too — the subtotal row is what
              makes a percentage add up on paper, where there is no line item
              to point at. */}
          {reward && (
            <>
              {reward.deducts && (
                <View style={styles.subtotalNote}>
                  <Text>Subtotal</Text>
                  <Text>{formatToNaira(reward.subtotal)}</Text>
                </View>
              )}
              <View style={styles.rewardNote}>
                <Text>{reward.label}</Text>
                <Text>
                  {reward.saving > 0
                    ? `-${formatToNaira(reward.saving)}`
                    : "FREE"}
                </Text>
              </View>
            </>
          )}

          {/* Total */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalAmount}>{tt}</Text>
          </View>

          {/* Payment Method */}
          <View style={styles.paymentMethodBox}>
            <Text style={styles.paymentMethodTitle}>PAYMENT METHOD:</Text>
            <Text style={styles.paymentMethodValue}>
              {orderDetails.method.toUpperCase()}
            </Text>
          </View>

          {/* Transaction ID */}
          <View style={styles.transactionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID:</Text>
              <Text style={styles.detailValue}>{receiptNumber}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.thankyou}>THANK YOU!</Text>
            <Text style={styles.poweredBy}>Powered by Sync360</Text>
          </View>
        </Page>
      </Document>
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    return (
      <Document>
        <Page size="A5" style={styles.page}>
          <Text>Error generating receipt. Please try again.</Text>
        </Page>
      </Document>
    );
  }
};

const OrderHistoryDetails = ({
  orderDetails,
  closeModal,
  business, // Add business prop
}: {
  orderDetails: SalesOrder;
  business?: any; // Make it optional
  closeModal: () => void;
}) => {
  const { ReverseSalePending, handleReverseSale, loading } = useSalesHook({
    closeModal,
  });
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const receiptNumber = `${business.name
    .slice(0, 2)
    .toUpperCase()}-${orderDetails?.id.slice(0, 4)}`;

  const tt = orderDetails && formatToNaira(totalOf(orderDetails));

  const reward = rewardBreakdownOf(orderDetails);

  // Format the date using moment.js
  const formattedDate = moment(orderDetails.created_at).format(
    "MMMM DD, YYYY, h:mm A",
  );

  // Extract the order ID (last 6 characters)
  const shortOrderId = orderDetails.id.substring(0, 6);

  // Extract transaction ID (first 6 characters)
  const transactionId = orderDetails.id.substring(0, 6);

  // Handle print functionality
  const handlePrint = () => {
    if (isPrinting) return;

    try {
      setIsPrinting(true);

      if (!receiptRef.current) {
        throw new Error("Nothing to print");
      }

      const printContent = receiptRef.current.cloneNode(true) as HTMLElement;
      const noPrintElements = printContent.querySelectorAll(".no-print");
      noPrintElements.forEach((el) => el.remove());

      printContent.classList.add("print-mode");

      const timeoutId = setTimeout(() => {
        setIsPrinting(false);
      }, 5000);

      printJS({
        printable: printContent.innerHTML,
        type: "raw-html",
        style: `
       @page { size: auto; margin: 2mm; }
        body { padding: 0; margin: 0; font-family: Arial, sans-serif; font-size: 10px; }
        .receipt-container { width: 80mm; max-width: 80mm; margin: 0 auto; padding: 2px; }
        table { width: 100%; border-collapse: collapse; margin: 2px 0; font-size: 10px; }
        th { padding:  1px; font-size: 10px; font-weight: bold; background-color: #eef7e0; }
        td { padding: 1px; font-size: 10px; border-bottom: 0.5px solid #f3f4f6; }
        .text-green-600 { color: #329661 !important; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .detail-value { font-weight: bold; font-size: 10px;text-transform: capitalize; }
        .receipt-header { border-bottom: 0.5px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 3px; }
        .receipt-footer { display: flex; justify-content: center; flex-direction: column; align-items: center;  border-top: 0.5px solid #e5e7eb; padding-top: 2px; margin-top: 2px; }
        .transaction-details { background-color: #f9fafb; padding: 1px; border-radius: 3px; margin: 1px 0; font-size: 10px; }
          .payment-method {width: 98%; background-color: #eef7e0; display: flex; justify-content: space-between; padding: 1px; border-radius: 6px; margin: 1px 0; }
          .total-row { font-weight: bold; font-size: 10px; border-top: 2px solid #329661; padding-top: 1px; margin-top: 1px; }
           .item-name { font-weight: bold; font-size: 10px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 1px; }
          .detail-label { color: #6b7280; font-size: 10px; }
          .detail-value { font-weight: bold; font-size: 10px; }
          .contact-info { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 1px; }
          .receipt-title { font-size: 13px; font-weight: bold; color: #329661; }
          /* print-js copies the markup into a bare document, so none of the
             utility classes come with it — the badge is restyled here or it
             prints as unformatted text. The border keeps it readable on a
             thermal printer, which drops background fills. */
          .reward-badge {
            font-size: 7px;
            font-weight: bold;
            color: #ffffff;
            background-color: #0f7b4f;
            border: 1px solid #0f7b4f;
            padding: 1px 3px;
            border-radius: 2px;
            display: inline-block;
            text-transform: uppercase;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .reward-badge svg { display: none; }
          .reward-row { display: flex; justify-content: space-between; font-size: 10px; color: #0f7b4f; font-weight: bold; margin-top: 2px; }
          .subtotal-row { display: flex; justify-content: space-between; font-size: 10px; color: #6b7280; margin-top: 2px; }
        `,
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
      console.error("Print failed:", error);
      setIsPrinting(false);
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="w-full">
          <div>
            {/* Printable content - Styled like PDF receipt */}
            <div
              ref={receiptRef}
              className="receipt-container w-full  bg-white p-1 mx-auto"
            >
              {/* Receipt header */}
              <div className="receipt-header text-center mb-4 pb-3 border-b border-grey-5">
                <p className="text-xl receipt-title font-extrabold mb-2 text-primary-green-300">
                  ORDER RECEIPT
                </p>
              </div>

              {/* Items table */}
              <div className="my-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-grey-6">
                      <th className="py-2 px-1 rounded-tl-md text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                        ITEM
                      </th>
                      <th className="py-2 px-1 text-center text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                        QTY
                      </th>
                      <th className="py-2 px-1 text-right text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                        PRICE
                      </th>
                      <th className="py-2 px-1 text-right rounded-tr-md text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.products.map((product, index) => (
                      <tr key={index} className="border-b border-grey-6">
                        <td className="py-3 px-1">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="item-name font-bold text-grey-1">
                                {product.name}
                              </p>
                              {/* The line is priced at zero, which on its own
                                  reads as a mistake. The badge is what says it
                                  was given away on purpose. */}
                              {product.is_loyalty_reward && (
                                <LoyaltyRewardTag
                                  label="Free · Loyalty"
                                  title={
                                    product.loyalty_reward_info
                                      ?.reward_summary ??
                                    product.loyalty_reward_info?.program_name
                                  }
                                  className="reward-badge mt-1"
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-1 font-medium text-grey-3">
                          {product.quantity}
                        </td>
                        <td className="text-right py-3 px-1 font-medium text-grey-3">
                          {formatToNaira(parseFloat(product.unit_price))}
                        </td>
                        <td className="text-right py-3 px-1 font-bold text-grey-1">
                          {formatToNaira(Number(product.price) || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* The reward, spelled out.
                  A percentage comes off the whole bill and leaves no line of
                  its own, so without this the seller sees a total that does
                  not match the items and nothing explaining the gap. Shown as
                  Subtotal / less the reward / Total where the reward is still
                  to come off, and as a plain "saved" note where the items were
                  already comped. */}
              {reward && (
                <div className="mt-3 px-1 space-y-1 text-sm">
                  {reward.deducts && (
                    <div className="subtotal-row flex justify-between text-grey-3">
                      <span>Subtotal</span>
                      <span className="font-medium">
                        {formatToNaira(reward.subtotal)}
                      </span>
                    </div>
                  )}
                  <div className="reward-row flex justify-between font-bold text-primary-green-300">
                    <span className="flex items-center gap-2">
                      <LoyaltyRewardTag
                        label={reward.label}
                        title={reward.program}
                        className="reward-badge"
                      />
                    </span>
                    <span>
                      {reward.saving > 0
                        ? `-${formatToNaira(reward.saving)}`
                        : "FREE"}
                    </span>
                  </div>
                  {reward.program && (
                    <p className="text-xs text-grey-4">
                      Redeemed from {reward.program}
                    </p>
                  )}
                </div>
              )}

              {/* Payment summary */}
              <div className="total-row flex justify-between font-extrabold mt-4 pt-3 border-t-2 border-primary-green-300 text-base">
                <span className="text-grey-1">TOTAL:</span>
                <span className="text-primary-green-300 detail-value">
                  {formatToNaira(parseFloat(orderDetails?.total_price ?? "0"))}
                </span>
              </div>

              {/* Transaction details */}
              <div className="transaction-details bg-grey-6 rounded-xl p-3 my-4">
                <div className="space-y-1 text-sm">
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-grey-4">Date:</span>
                    <span className="detail-value font-bold text-grey-1">
                      {formattedDate}
                    </span>
                  </div>
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-grey-4">
                      Order ID:
                    </span>
                    <span className="detail-value font-bold text-grey-1">
                      {receiptNumber}
                    </span>
                  </div>
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-grey-4">
                      Presaled By:
                    </span>
                    <span className="detail-value font-bold text-grey-1">
                      {orderDetails?.pre_sale || "N/A"}
                    </span>
                  </div>
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-grey-4">Status:</span>
                    <span className="detail-value font-bold text-grey-1">
                      {orderDetails.payment_status}
                    </span>
                  </div>
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-grey-4">
                      Attendant:
                    </span>
                    <span className="detail-value font-bold text-grey-1">
                      {orderDetails.attendant}
                    </span>
                  </div>
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-grey-4">VAT:</span>
                    <span className="detail-value font-bold text-grey-1">
                      {formatToNaira(parseFloat(orderDetails?.total_tax ?? "0"))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="payment-method mt-2 flex justify-between bg-secondary-6 p-3 rounded-xl">
                <p className="text-xs font-medium text-grey-4">PAYMENT METHOD:</p>
                <p className="capitalize font-extrabold text-primary-green-300">
                  {orderDetails.method.toUpperCase()}
                </p>
              </div>

              {/* Reverse Sale Button */}
              <div
                onClick={() => handleReverseSale(orderDetails?.id)}
                className="w-full bg-warning-2 text-warning-1 font-bold rounded-xl gap-2 p-3 flex items-center justify-center border border-warning-1/30 cursor-pointer no-print mt-4 hover:bg-warning-2/70 transition-colors"
              >
                {ReverseSalePending || loading ? (
                  <Spinner />
                ) : (
                  <>
                    <Undo2 size={16} />
                    <span>Reverse Sale</span>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons - Print and Download */}
            <div className="w-full px-4 pb-4 flex gap-3 no-print mt-4">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="gap-2 flex-1"
                disabled={isPrinting}
              >
                {isPrinting ? (
                  "Printing..."
                ) : (
                  <>
                    <Printer size={18} />
                    <span>Print Order</span>
                  </>
                )}
              </Button>

              <PDFDownloadLink
                document={
                  <OrderHistoryPDFDocument
                    orderDetails={orderDetails}
                    business={business}
                    tt={tt}
                  />
                }
                fileName={`order-${shortOrderId}.pdf`}
                className="flex-1"
              >
                {({ loading, error }) => {
                  if (error) {
                    console.error("PDF generation error:", error);
                    return (
                      <Button variant="outline" className="gap-2 w-full" disabled>
                        <Download size={18} />
                        Error generating PDF
                      </Button>
                    );
                  }

                  return (
                    <Button
                      variant="outline"
                      className="gap-2 w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        "Generating PDF..."
                      ) : (
                        <>
                          <Download size={18} />
                          <span>Save as PDF</span>
                        </>
                      )}
                    </Button>
                  );
                }}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderHistoryDetails;
