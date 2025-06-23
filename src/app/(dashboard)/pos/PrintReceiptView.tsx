"use client";
import { Button } from "@/components/ui/button";
import { formatToNaira } from "@/utils/formatMoney";
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
import { ArrowBigLeftDash, Download, PlusCircle, Printer } from "lucide-react";
import printJS from "print-js";
import { useRef, useState } from "react";

// Register fonts with all necessary variants
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
    {
      // Add italic font variant
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
    {
      // Add bold-italic font variant
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

// Updated PDF Styles to match the print receipt exactly
const styles = StyleSheet.create({
  page: {
    padding: 8,
    fontSize: 12,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 16,
    textAlign: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#16a34a",
  },
  subtitle: {
    color: "#16a34a",
    marginBottom: 12,
    fontWeight: "bold",
    fontSize: 14,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  contactText: {
    fontSize: 10,
    color: "#6b7280",
  },
  separator: {
    marginHorizontal: 8,
    color: "#6b7280",
  },
  table: {
    width: "100%",
    marginVertical: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0fdf4",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  cellItem: {
    flex: 3,
    paddingRight: 4,
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 12,
  },
  cellQty: {
    flex: 1,
    textAlign: "center",
  },
  cellPrice: {
    flex: 2,
    textAlign: "right",
    paddingRight: 4,
  },
  cellTotal: {
    flex: 2,
    textAlign: "right",
    fontWeight: "bold",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#16a34a",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#16a34a",
  },
  transactionDetails: {
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    padding: 12,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  paymentMethodBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 6,
  },
  paymentMethodTitle: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 3,
  },
  paymentMethodValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#16a34a",
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  thankyou: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  poweredBy: {
    marginTop: 4,
    fontSize: 10,
    color: "#9ca3af",
  },
});

// Updated PDF Document Component
const ReceiptPDFDocument = ({
  cart,
  business,
  receiptNumber,
  createSaleResponse,
  customer,
  attendant,
  total,
}: {
  cart: any[];
  business: any;
  receiptNumber: string;
  createSaleResponse: any;
  total: number;
  customer: any;
  attendant: any;
}) => {
  try {
    return (
      <Document>
        <Page size="A5" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>PAYMENT RECEIPT</Text>
            <Text style={styles.subtitle}>TRANSACTION SUCCESSFUL</Text>

            <Text style={styles.businessName}>{business?.name || "STORE"}</Text>
            <Text style={styles.businessAddress}>
              {business?.street && `${business.street}, `}
              {business?.city}, {business?.state}, {business?.country}
            </Text>

            <View style={styles.contactInfo}>
              {business?.owner?.email && (
                <Text style={styles.contactText}>{business.owner.email}</Text>
              )}
              {business?.owner?.email && business?.owner?.phone && (
                <Text style={styles.separator}>|</Text>
              )}
              {business?.owner?.phone && (
                <Text style={styles.contactText}>{business.owner.phone}</Text>
              )}
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            {/* Table Header */}
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

            {/* Table Rows */}
            {cart.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.cellItem}>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <Text style={styles.cellQty}>{item.cartQuantity || 1}</Text>
                <Text style={styles.cellPrice}>
                  {(
                    (item.selling_price || item.amount || 0) *
                    (item.cartQuantity || 1)
                  ).toLocaleString()}
                </Text>
                <Text style={styles.cellTotal}>
                  {(
                    (item.selling_price || item.amount || 0) *
                    (item.cartQuantity || 1)
                  ).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalAmount}>{total}</Text>
          </View>

          {/* Transaction Details */}
          <View style={styles.transactionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {format(
                  new Date(createSaleResponse?.data?.created_at || Date.now()),
                  "MMMM d, yyyy, h:mm a"
                )}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Receipt No:</Text>
              <Text style={styles.detailValue}>{receiptNumber}</Text>
            </View>
            {customer && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer:</Text>
                <Text style={styles.detailValue}>{customer?.name}</Text>
              </View>
            )}
            {attendant && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Attendant:</Text>
                <Text style={styles.detailValue}>{attendant?.name}</Text>
              </View>
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.paymentMethodBox}>
            <Text style={styles.paymentMethodTitle}>PAYMENT METHOD:</Text>
            <Text style={styles.paymentMethodValue}>
              {(createSaleResponse?.data?.method || "cash")
                .replace("_", " ")
                .toUpperCase()}
            </Text>
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

const PrintReceiptView = ({
  setShowReceipt,
  setShowPrintReceiptView,
  cart,
  clearCartFunc,
  createSaleResponse,
  customer,
  attendant,
  business,
}: {
  setShowReceipt: (show: boolean) => void;
  setShowPrintReceiptView: (show: boolean) => void;
  clearCartFunc: any;
  createSaleResponse: any;
  customer: any;
  attendant: any;
  cart: any[];
  business: any;
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  console.log("customer", customer);
  console.log("attendant", attendant);

  const [pdfError, setPdfError] = useState<string | null>(null);
  // Calculate total amount
  const total = cart.reduce((sum, item) => {
    return sum + (item.selling_price || 0) * (item.cartQuantity || 1);
  }, 0);

  // Generate receipt number
  const receiptNumber =
    createSaleResponse?.data?.receipt_number ||
    `RC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

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
          @page { size: 100% auto; margin: 10mm; }
          body { padding: 0; margin: 0; font-family: Arial, sans-serif; }
          .receipt-container { width: 100%; max-width: 100%; margin: 0 auto; padding: 6px; }
          table { width: 100%; border-collapse: collapse; margin: 5px 0; }
          th { padding: 4px 2px; font-size: 10px; font-weight: bold; background-color: #f0fdf4; border-top-left-radius: 4px; border-top-right-radius: 4px; }
          td { padding: 2px 1px; font-size: 10px; border-bottom: 1px solid #f3f4f6; }
          .text-green-600 { color: #16a34a !important; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .receipt-header { border-bottom: 1px solid #e5e7eb; padding-bottom: 7px; margin-bottom: 7px; }
          .receipt-footer { border-top: 1px solid #e5e7eb; padding-top: 4px; margin-top: 1px; }
          .transaction-details { background-color: #f9fafb; padding: 1px; border-radius: 6px; margin: 1px 0; }
          .payment-method { background-color: #f0fdf4; padding: 9px; border-radius: 6px; margin: 8px 0; }
          .total-row { font-weight: bold; font-size: 12px; border-top: 2px solid #16a34a; padding-top: 7px; margin-top: 10px; }
          .item-name { font-weight: bold; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 1px; }
          .detail-label { color: #6b7280; font-size: 10px; }
          .detail-value { font-weight: bold; font-size: 10px; }
          .contact-info { display: flex; flex-direction: column; align-items: center; gap: -6px; margin-top: 3px; }
          .price-cell { font-weight: bold !important; }
          .receipt-title { font-size: 13px; font-weight: bold; color: #16a34a; }
          .receipt-subtitle { font-size: 13px; font-weight: semibold; color: #16a34a; }
          .receipt-little { font-size: 12px; font-weight: semibold;  }
          .receipt-little-one { font-size: 10px; font-weight: semibold;  }
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

  // Handle new sale
  const handleNewSale = () => {
    setShowReceipt(false);
    setShowPrintReceiptView(false);
    clearCartFunc();
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 p-1">
      {/* Top action bar */}
      <div className="w-full flex justify-between items-center no-print">
        <button
          onClick={() => setShowPrintReceiptView(false)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
          disabled={isPrinting}
        >
          <ArrowBigLeftDash className="text-green-600" size={24} />
        </button>

        <Button
          onClick={handleNewSale}
          className="gap-2 bg-green-600 hover:bg-green-700"
          disabled={isPrinting}
        >
          <PlusCircle size={11} />
          <p className="text-sm"> Start New Sale</p>
        </Button>
      </div>

      {/* Receipt content - Updated to match desired format */}
      <div
        ref={receiptRef}
        className="receipt-container w-full max-w-md bg-white p-1 rounded-lg shadow-md border border-gray-200"
      >
        {/* Receipt header */}
        <div className="receipt-header text-center mb-1 pb-3 border-b border-gray-200">
          <h2 className="text-[15px] receipt-title font-bold mb-1 text-green-600">
            PAYMENT RECEIPT
          </h2>
          {/* <p className="text-green-600  receipt-subtitle text-[13px] font-semibold text-sm mb-3">
            TRANSACTION SUCCESSFUL
          </p> */}

          <div className="w-full flex flex-col items-center gap-3">
            <div className="flex flex-col items-center w-full">
              <p className="font-semibold receipt-little text-base">
                {business?.name}
              </p>
              <p className="text-xs receipt-little text-gray-500">
                {business?.street && `${business.street}, `}
                {business?.city}, {business?.state}, {business?.country}
              </p>
              {business?.owner?.email && (
                <p className="text-xs receipt-little text-gray-500">
                  {business?.owner?.email}
                </p>
              )}
              {business?.owner?.phone && (
                <p className="text-xs receipt-little text-gray-500">
                  {business?.owner?.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="my-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-green-50">
                <th className="py-1 px-1 rounded-tl-md">ITEM</th>
                <th className="py-1 px-1 text-center">QTY</th>
                <th className="py-1 px-1 text-right">PRICE</th>
                <th className="py-1 px-1 text-right rounded-tr-md">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-1 px-1">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="item-name font-medium">{item.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-1 px-1">
                    {item.cartQuantity || 1}
                  </td>
                  <td className="text-right py-1 px-1 price-cell font-bold">
                    {formatToNaira(item.selling_price) ||
                      formatToNaira(item.amount) ||
                      "₦0"}
                  </td>
                  <td className="text-right py-1 px-1 font-bold price-cell">
                    {formatToNaira(
                      (item.selling_price || item.amount || 0) *
                        (item.cartQuantity || 1)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment summary */}
        <div className="total-row flex justify-between font-bold mt-4 pt-3 border-t-2 border-green-600 text-base">
          <span>TOTAL:</span>
          <span className="text-green-600">{formatToNaira(total)}</span>
        </div>

        {/* Transaction details */}
        <div className="transaction-details bg-gray-50 rounded-md p-3 my-1">
          <div className="space-y-1 text-sm">
            <div className="detail-row flex justify-between">
              <span className="detail-label text-gray-500">Date:</span>
              <span className="detail-value font-medium">
                {format(
                  new Date(createSaleResponse?.data?.created_at || Date.now()),
                  "MMMM d, yyyy, h:mm a"
                )}
              </span>
            </div>
            <div className="detail-row flex justify-between">
              <span className="detail-label text-gray-500">Receipt No:</span>
              <span className="detail-value font-medium">{receiptNumber}</span>
            </div>
            {customer && (
              <div className="detail-row flex justify-between">
                <span className="detail-label text-gray-500">Customer:</span>
                <span className="detail-value font-medium">
                  {customer?.name}
                </span>
              </div>
            )}
            {attendant && (
              <div className="detail-row flex justify-between">
                <span className="detail-label text-gray-500">Attendant:</span>
                <span className="detail-value font-medium">
                  {attendant?.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment method */}
        <div className="detail-row  flex justify-between mt-1 bg-green-50 p-3 rounded-md">
          <p className="text-[13px] receipt-little text-gray-500">
            PAYMENT METHOD:
          </p>
          <p className="capitalize receipt-little  text-[13px]  font-semibold text-green-600">
            {(createSaleResponse?.data?.method || "cash")
              .toUpperCase()
              .replace("_", " ")}
          </p>
        </div>

        {/* Footer */}
        <div className="receipt-footer flex flex-col items-center justify-center pt-1 border-t border-gray-200 text-center">
          <p className="font-bold text-[10px] receipt-little-one">THANK YOU!</p>
          <p className="mt-1 text-[8px] receipt-little-one text-gray-400">
            Powered by Sync360
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-md flex flex-col gap-3 no-print">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="gap-2 w-full hover:bg-gray-50 border-green-200"
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
          document={
            <ReceiptPDFDocument
              cart={cart}
              business={business}
              receiptNumber={receiptNumber}
              createSaleResponse={createSaleResponse}
              total={total}
              customer={customer}
              attendant={attendant}
            />
          }
          fileName={`receipt-${receiptNumber}.pdf`}
        >
          {({ loading, error }) => {
            if (error) {
              console.error("PDF generation error:", error);
              return (
                <Button
                  variant="outline"
                  className="gap-2 w-full hover:bg-gray-50"
                  disabled
                >
                  <Download size={18} />
                  Error generating PDF
                </Button>
              );
            }

            return (
              <Button
                variant="outline"
                className="gap-2 w-full hover:bg-gray-50 border-green-200"
                disabled={loading}
              >
                {loading ? (
                  "Generating PDF..."
                ) : (
                  <>
                    <Download size={18} className="text-green-600" />
                    <span className="text-green-600">Save as PDF</span>
                  </>
                )}
              </Button>
            );
          }}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default PrintReceiptView;
