"use client";
import { Button } from "@/components/ui/button";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useUserRole } from "@/lib/store/user-store";
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
import moment from "moment";
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
    color: "#16a34a",
  },
  subtitle: {
    color: "#16a34a",
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
    backgroundColor: "#f0fdf4",
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
  cellQty: {
    flex: 1,
    textAlign: "center",
    fontSize: 10, // Added for consistency
  },
  cellPrice: {
    flex: 2,
    textAlign: "right",
    display: "flex",
    alignItems: "center",
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
    borderTopColor: "#16a34a",
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
    color: "#16a34a",
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
  summarySection: {
    marginTop: 2,
    paddingTop: 2,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    fontSize: 10,
  },
  discountLabel: {
    fontSize: 10,
    color: "#dc2626",
  },
  discountValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#dc2626",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    fontSize: 10,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 10, // Reduced from 14
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  paymentMethodBox: {
    marginTop: 1, // Reduced from 2
    padding: 2, // Reduced from 4
    flexDirection: "row", // Keep as row for single line or header
    justifyContent: "space-between",
    backgroundColor: "#f0fdf4",
    borderRadius: 4, // Reduced from 6
  },
  // New style for individual payment lines in PDF
  paymentMethodEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 1,
    paddingHorizontal: 2,
    fontSize: 9, // Slightly smaller for multiple entries
    color: "#16a34a",
  },
  paymentMethodTitle: {
    fontSize: 10, // Reduced from 10
    color: "#6b7280",
    marginBottom: 1, // Reduced from 3
  },
  paymentMethodValue: {
    fontSize: 8, // Kept same
    fontWeight: "bold",
    color: "#16a34a",
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
// Updated PDF Document Component
const ReceiptPDFDocument = ({
  cart,
  business,
  receiptNumber,
  createSaleResponse,
  customer,
  user,
  businessData,
  multiplePayments,
  attendant,
  discount,
  discountAmount,
  subtotal,
  total,
}: {
  cart: any[];
  business: any;
  receiptNumber: string;
  createSaleResponse: any;
  multiplePayments: any;
  total: number;
  discount: any;
  subtotal: any;
  discountAmount: any;
  customer: any;
  user: any;
  businessData: any;
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
              {/* <Text style={[styles.cellQty, styles.tableHeaderText]}>QTY</Text> */}
              <Text style={[styles.cellPrice, styles.tableHeaderText]}>
                UNIT/PRICE
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
                {/* <Text style={styles.cellQty}>{item.cartQuantity || 1}</Text> */}
                <Text style={styles.cellPrice}>
                  {/* {(
                    (item.selling_price || item.amount || 0) *
                    (item.cartQuantity || 1)
                  ).toLocaleString()} */}
                  {item.cartQuantity || 1}* {""}
                  {item?.selling_price
                    ? item.selling_price.toLocaleString()
                    : item.amount.toLocaleString() ?? 0}
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

          {/* Summary Section */}
          {discount && discountAmount > 0 && (
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>
                  {subtotal.toLocaleString()}
                </Text>
              </View>
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>
                  Discount (
                  {discount.type === "fixed"
                    ? `₦${discount.value}`
                    : `${discount.value}%`}
                  ):
                </Text>
                <Text style={styles.discountValue}>
                  -{discountAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {/* Total */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalAmount}>{total.toLocaleString()}</Text>
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
            {user?.role === "ATTENDANT" && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Attendant:</Text>
                <Text style={styles.detailValue}>{user?.name} </Text>
              </View>
            )}
          </View>

          {/* Payment Method - Dynamically display single or multiple payments */}
          <View style={styles.paymentMethodBox}>
            <Text style={styles.paymentMethodTitle}>PAYMENT METHOD(S):</Text>
            {multiplePayments ? (
              typeof multiplePayments === "object" &&
              !Array.isArray(multiplePayments) ? (
                // Handle object format {cash: 1000, moniepoint: 500}
                <View>
                  {Object.entries(multiplePayments).map(
                    ([method, amount], index) => (
                      <View key={index} style={styles.paymentMethodEntry}>
                        <Text>{method.replace("_", " ").toUpperCase()}:</Text>
                        <Text>
                          {parseFloat(amount as string).toLocaleString()}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              ) : Array.isArray(multiplePayments) &&
                multiplePayments.length > 0 ? (
                // Handle array format
                <View>
                  {multiplePayments.map((payment: any, index: number) => (
                    <View key={index} style={styles.paymentMethodEntry}>
                      <Text>
                        {payment.name.replace("_", " ").toUpperCase()}:
                      </Text>
                      <Text>{parseFloat(payment.amount).toLocaleString()}</Text>
                    </View>
                  ))}
                </View>
              ) : null
            ) : (
              // Fallback to single payment
              <Text style={styles.paymentMethodValue}>
                {(createSaleResponse?.data?.method || "cash")
                  .replace("_", " ")
                  .toUpperCase()}
              </Text>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.thankyou}>THANK YOU!</Text>
            <Text style={styles.poweredBy}>
              Powered by Sync360 | www.sync360.africa
            </Text>
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
  payloadData,
  customer,
  total,
  subtotal,
  discountAmount,
  discount,
  attendant,
  business,
}: {
  setShowReceipt: (show: boolean) => void;
  setShowPrintReceiptView: (show: boolean) => void;
  clearCartFunc: any;
  createSaleResponse: any;
  total: any;
  payloadData: any;
  subtotal: any;
  customer: any;
  attendant: any;
  discount: any;
  cart: any[];
  discountAmount: any;
  business: any;
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const { user } = useUserRole();
  const { businessData } = useBusinessDataStore();

  const multiplePayments = payloadData;

  // console.log("customer", customer);
  // console.log("attendant", attendant);
  // console.log("username", user?.name);
  // console.log("pa", user?.role);

  console.log("business", business);
  console.log("businessData", businessData);

  console.log("multiplePayments", multiplePayments);

  const [pdfError, setPdfError] = useState<string | null>(null);
  // Calculate total amount
  // const total = cart.reduce((sum, item) => {
  //   return sum + (item.selling_price || 0) * (item.cartQuantity || 1);
  // }, 0);

  // Generate receipt number

  const receiptNumber = `${business.name
    .slice(0, 2)
    .toUpperCase()}-${createSaleResponse?.data?.id.slice(0, 4)}`;
  // const receiptNumber =
  //   createSaleResponse?.data?.receipt_number ||
  //   `RC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

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
    .receipt-container { 
      width: 100%; 
      max-width: 60mm; 
      margin: 0 auto; 
      padding: 1mm; 
      background: white;
      border-radius: 2px;
      box-sizing: border-box;
    }
        table { width: 100%; border-collapse: collapse; margin: 2px 0; font-size: 10px; }
        th { padding: 2px 1px; font-size: 10px; font-weight: bold; background-color: #f0fdf4; }
        td { padding: 1px; font-size: 10px; border-bottom: 0.5px solid #f3f4f6; }
        .text-green-600 { color: #16a34a !important; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .receipt-header { border-bottom: 0.5px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 3px; }
        .receipt-footer { display: flex; justify-content: center; flex-direction: column; align-items: center;  border-top: 0.5px solid #e5e7eb; padding-top: 2px; margin-top: 2px; }
        .transaction-details { background-color: #f9fafb; padding: 1px; border-radius: 3px; margin: 1px 0; font-size: 10px; }

         .payment-method {
            display: flex;
            flex-direction: column; /* Changed to column for multiple entries */
            justify-content: flex-start; /* Align header to start */
            align-items: flex-start; /* Align header to start */
            background-color: #f0fdf4;
            padding: 2px;
            border-radius: 3px;
            margin: 2px 0;
            line-height: 1.2; /* Added for compact multiple lines */
        }
        .payment-method-entry { /* New class for individual payment lines */
            display: flex;
            justify-content: space-between;
            width: 100%;
            font-size: 8px;
            color: #16a34a;
            padding-bottom: 1px; /* Small padding between entries */
        }
        .payment-method-title {
            font-size: 8px; /* Slightly larger title for the whole section */
            color: #6b7280;
            font-weight: bold;
            margin-bottom: 2px; /* Space between title and entries */
        }
        .payment-method-value {
            font-size: 8px;
            font-weight: bold;
            color: #16a34a;
        }


        .total-row { font-weight: bold; font-size: 12px; border-top: 1px solid #16a34a; padding-top: 3px; margin-top: 5px; }
        .summary-section { border-top: 0.5px solid #e5e7eb; padding-top: 3px; margin-top: 3px; }
        .summary-row, .discount-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 10px; }
        .item-name { font-weight: bold; font-size: 10px; }
        .detail-row { display: flex; justify-content: start; margin-bottom: 1px; font-size: 10px; }
        .detail-label { color: #6b7280; font-size: 10px; }
        .detail-value { font-weight: bold; font-size: 10px;text-transform: capitalize; }
        .powered-by { font-size: 8px;  text-align: center; }
        .contact-info { display: flex; flex-direction: column; align-items: center; gap: 0; margin-top: 1px; }
        .price-cell { font-weight: bold !important; font-size: 10px; display: flex; align-items: center; }
        .price-celll { font-weight: bold !important; font-size: 10px; }
        .receipt-title { font-size: 12px; font-weight: bold; color: #16a34a; margin-bottom: 2px; }
        .receipt-subtitle { font-size: 10px; font-weight: semibold; color: #16a34a; margin-bottom: 2px; }
        .receipt-little { font-size: 10px; font-weight: semibold; margin: 1px 0; }
        .receipt-little-one { font-size: 8px; font-weight: semibold; margin: 1px 0; }
        .business-info { margin-bottom: 3px; }
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
        className="receipt-container max-w-[90%] mx-auto bg-white rounded-lg w-full p-2"
      >
        {/* Receipt header */}
        <div className="receipt-header text-center w-full business-info p-2 flex flex-col items-center gap-1 justify-center">
          <h2 className="receipt-title text-[13px] ">PAYMENT RECEIPT</h2>
          <p className="business-name receipt-little font-semibold">
            {business?.name}
          </p>
          <p className="business-address text-[11px] receipt-little text-gray-500">
            {business?.street && `${business.street}, `}
            {business?.city}, {business?.state}, {business?.country}
          </p>
          {business?.owner?.email && (
            <p className="business-email text-[11px]  receipt-little text-gray-500">
              {business?.owner?.email}
            </p>
          )}
          {business?.owner?.phone && (
            <p className="business-phone text-[11px]  receipt-little text-gray-500">
              {business?.owner?.phone}
            </p>
          )}
        </div>

        {/* Items table */}
        <div className="items-table">
          <table className="w-full table-fit ">
            <thead className="w-full">
              <tr className="text-left bg-green-50 w-full">
                <th>ITEM</th>
                {/* <th className="text-center text-[11px] ">QTY</th> */}
                <th className="text-right text-[11px] ">Unit/Price</th>
                <th className="text-right text-[11px] ">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td className="item-name text-[11px] ">{item.name}</td>
                  {/* <td className="text-center text-[11px] ">
                    {item.cartQuantity || 1}
                  </td> */}
                  <td className="text-right text-[11px]  price-cell">
                    {/* {formatToNaira(item.selling_price) ||
                      formatToNaira(item.amount) ||
                      "₦0"} */}
                    {item.cartQuantity || 1} *{" "}
                    {item?.selling_price
                      ? formatToNaira(item.selling_price)
                      : formatToNaira(item.amount) ?? "₦0"}
                  </td>
                  <td className="text-right text-[11px] price-celll">
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

        {discount && discountAmount > 0 && (
          <div className="summary-section">
            <div className="summary-row flex justify-between items-center">
              <span className="text-[11px] text-gray-500">Subtotal:</span>
              <span className="text-[11px] font-bold">
                {formatToNaira(subtotal)}
              </span>
            </div>
            <div className="discount-row flex justify-between items-center">
              <span className="text-[11px] text-red-600">
                Discount (
                {discount.type === "fixed"
                  ? `₦${discount.value}`
                  : `${discount.value}%`}
                ):
              </span>
              <span className="text-[11px] font-bold text-red-600">
                -{formatToNaira(discountAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Payment summary */}
        <div className="total-row">
          <span className="text-[11px]">TOTAL:</span>
          <span className="text-green-600 text-[11px]">
            {formatToNaira(total)}
          </span>
        </div>

        {/* Transaction details */}
        <div className="transaction-details">
          <div className="detail-row flex justify-start items-center">
            <span className="detail-label text-[11px] ">Date:</span>
            <span className="detail-value text-[11px] ">
              {moment(createSaleResponse?.data?.created_at).format(
                "DD/MM/YYYY"
              ) || Date.now()}
              {/* {format(
                new Date(createSaleResponse?.data?.created_at || Date.now()),
                "MMMM d, yyyy, h:mm a"
              )} */}
            </span>
          </div>
          <div className="detail-row flex justify-start items-center">
            <span className="detail-label text-[11px] ">Receipt No:</span>
            <span className="detail-value text-[11px] ">{receiptNumber}</span>
          </div>
          {customer && (
            <div className="detail-row flex justify-start items-center">
              <span className="detail-label text-[11px] ">Customer:</span>
              <span className="detail-value text-[11px] ">
                {customer?.name}
              </span>
            </div>
          )}
          {attendant && (
            <div className="detail-row flex justify-start items-center">
              <span className="detail-label text-[11px] ">Attendant:</span>
              <span className="detail-value text-[11px] ">
                {attendant?.name}
              </span>
            </div>
          )}
          {user?.role === "ATTENDANT" && (
            <div className="detail-row flex justify-start items-center">
              <span className="detail-label text-[11px] ">Attendant:</span>
              <span className="detail-value text-[11px] capitalize ">
                {user?.name}
              </span>
            </div>
          )}
        </div>
        {/* Payment method - Updated to handle multiple payments */}
        <div className="payment-method">
          <span className="payment-method-title text-[11px]">
            PAYMENT METHOD(S):
          </span>
          {multiplePayments && Object.keys(multiplePayments).length > 0 ? (
            typeof multiplePayments === "object" &&
            !Array.isArray(multiplePayments) ? (
              Object.entries(multiplePayments).map(
                ([method, amount], index) => (
                  <div
                    key={index}
                    className="payment-method-entry flex justify-between w-full"
                  >
                    <span className="text-[10px] capitalize">
                      {method.replace("_", " ")}:
                    </span>
                    <span className="text-green-600 text-[10px]">
                      {formatToNaira(parseFloat(amount as string))}
                    </span>
                  </div>
                )
              )
            ) : Array.isArray(multiplePayments) &&
              multiplePayments.length > 0 ? (
              multiplePayments.map((payment: any, index: number) => (
                <div
                  key={index}
                  className="payment-method-entry flex justify-between w-full"
                >
                  <span className="text-[10px] capitalize">
                    {payment.name.replace("_", " ")}:
                  </span>
                  <span className="text-green-600 text-[10px]">
                    {formatToNaira(parseFloat(payment.amount))}
                  </span>
                </div>
              ))
            ) : null
          ) : (
            <span className="payment-method-value text-[11px]">
              {(createSaleResponse?.data?.method || "cash")
                .toUpperCase()
                .replace("_", " ")}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="receipt-footer flex justify-between flex-col items-center">
          <p className="thank-you text-[13px] ">THANK YOU!</p>
          <p className="powered-by text-[9px] ">
            Powered by Sync360 | www.sync360.africa
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
              user={user}
              multiplePayments={multiplePayments}
              subtotal={subtotal}
              discountAmount={discountAmount}
              discount={discount}
              businessData={businessData}
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
