"use client";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { Button } from "@/components/ui/button";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
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
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

// Updated PDF Styles with VAT styles
const styles = StyleSheet.create({
  page: {
    padding: 4,
    fontSize: 10,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 8,
    textAlign: "center",
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#16a34a",
  },
  subtitle: {
    color: "#16a34a",
    marginBottom: 6,
    fontWeight: "bold",
    fontSize: 10,
  },
  businessName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  businessAddress: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
    lineHeight: 1.2,
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  contactText: {
    fontSize: 8,
    color: "#6b7280",
  },
  separator: {
    marginHorizontal: 4,
    color: "#6b7280",
  },
  table: {
    width: "100%",
    marginVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0fdf4",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  cellItem: {
    flex: 3,
    paddingRight: 2,
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 10,
  },
  cellQty: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
  },
  cellPrice: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "right",
    fontSize: 10,
  },
  cellTotal: {
    flex: 2,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 10,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#16a34a",
    fontSize: 14,
    fontWeight: "bold",
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 14,
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#16a34a",
  },
  transactionDetails: {
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 1,
    marginVertical: 3,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  detailLabel: {
    fontSize: 10,
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
  // VAT STYLES
  vatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    fontSize: 10,
  },
  vatLabel: {
    fontSize: 10,
    color: "#2563eb",
  },
  vatValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2563eb",
  },
  vatBadge: {
    fontSize: 6,
    color: "#2563eb",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 2,
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
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  paymentMethodBox: {
    marginTop: 1,
    padding: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
  },
  paymentMethodEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 1,
    paddingHorizontal: 2,
    fontSize: 9,
    color: "#16a34a",
  },
  paymentMethodTitle: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 1,
  },
  paymentMethodValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#16a34a",
  },
  footer: {
    marginTop: 2,
    textAlign: "center",
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
  thankyou: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
  },
  poweredBy: {
    marginTop: 2,
    fontSize: 6,
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
  vatInfo,
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
  vatInfo?: {
    enabled: boolean;
    rate: number;
    amount: number;
    totalWithVat: number;
    itemsBreakdown?: Array<{
      id: string;
      name: string;
      itemTotal: number;
      itemVat: number;
    }>;
  };
}) => {
  try {
    console.log("vatInfo in receipt PDF", vatInfo);
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

            {(() => {
              // Prefer the direct business email/phone (new schema). Fall
              // back to owner.* for older payloads that still nest contacts
              // under the owner object.
              const contactEmail =
                business?.email || business?.owner?.email || "";
              const contactPhone =
                business?.phone || business?.owner?.phone || "";
              return (
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
              );
            })()}
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
            {cart.map((item) => {
              const hasItemDiscount =
                item.type === "PRODUCT" &&
                item.discount_threshold &&
                item.discount &&
                (item.cartQuantity || 1) >= item.discount_threshold;

              const itemDiscount = hasItemDiscount ? item.discount : 0;
              const hasVat = item.allow_tax && vatInfo?.enabled;

              return (
                <View key={item.id} style={styles.tableRow}>
                  <View style={styles.cellItem}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {hasVat && <Text style={styles.vatBadge}>+VAT</Text>}
                  </View>
                  <Text style={styles.cellQty}>{item.cartQuantity || 1}</Text>
                  <View style={styles.cellPrice}>
                    <Text>
                      {item?.selling_price
                        ? item.selling_price.toLocaleString()
                        : (item.amount.toLocaleString() ?? 0)}
                    </Text>
                    {hasItemDiscount && (
                      <Text
                        style={{
                          fontSize: 6,
                          fontStyle: "italic",
                          color: "green",
                        }}
                      >
                        Discount - ₦{itemDiscount.toLocaleString()} per unit
                      </Text>
                    )}
                  </View>
                  <Text style={styles.cellTotal}>
                    {(
                      (item.selling_price || item.amount || 0) *
                      (item.cartQuantity || 1)
                    ).toLocaleString()}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Summary Section - Discount */}
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

          {/* VAT Display Section */}
          {vatInfo?.enabled && vatInfo?.amount > 0 && (
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal (before VAT):</Text>
                <Text style={styles.summaryValue}>
                  {total.toLocaleString()}
                </Text>
              </View>
              <View style={styles.vatRow}>
                <Text style={styles.vatLabel}>VAT ({vatInfo.rate}%):</Text>
                <Text style={styles.vatValue}>
                  +{vatInfo.amount.toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {/* Total - Updated to use totalWithVat if VAT enabled */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalAmount}>
              {vatInfo?.enabled
                ? vatInfo.totalWithVat.toLocaleString()
                : total.toLocaleString()}
            </Text>
          </View>

          {/* Transaction Details */}
          <View style={styles.transactionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {format(
                  new Date(createSaleResponse?.data?.created_at || Date.now()),
                  "MMMM d, yyyy, h:mm a",
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

          {/* Payment Method */}
          <View style={styles.paymentMethodBox}>
            <Text style={styles.paymentMethodTitle}>PAYMENT METHOD(S):</Text>
            {multiplePayments ? (
              typeof multiplePayments === "object" &&
              !Array.isArray(multiplePayments) ? (
                <View>
                  {Object.entries(multiplePayments).map(
                    ([method, amount], index) => (
                      <View key={index} style={styles.paymentMethodEntry}>
                        <Text>{method.replace("_", " ").toUpperCase()}:</Text>
                        <Text>
                          {parseFloat(amount as string).toLocaleString()}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              ) : Array.isArray(multiplePayments) &&
                multiplePayments.length > 0 ? (
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

          {cart.some((item) => item.type === "PRODUCT") && (
            <View style={styles.footer}>
              <Text style={styles.poweredBy}>
                Goods bought in good condition are not returnable.
              </Text>
            </View>
          )}
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
  business: businessProp,
  vatInfo,
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
  vatInfo?: {
    enabled: boolean;
    rate: number;
    amount: number;
    totalWithVat: number;
    itemsBreakdown?: Array<{
      id: string;
      name: string;
      itemTotal: number;
      itemVat: number;
    }>;
  };
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const { user } = useUserRole();
  // Always read the freshest business profile from the API so receipts pick
  // up edits (email, phone, address, etc.). Precedence: live query > parent
  // prop > persisted store fallback while the query is still loading.
  const business_id = useBusinessStore((s) => s.business_id);
  const { data: liveBusinessQuery } = useFetchBusinessById(business_id, {
    staleTime: 0,
    refetchOnMount: "always",
  });
  const { businessData: cachedBusinessData } = useBusinessDataStore();
  const business =
    liveBusinessQuery?.data || businessProp || cachedBusinessData;
  const businessData = business;

  const multiplePayments = payloadData;

  const [pdfError, setPdfError] = useState<string | null>(null);

  const receiptNumber = `RC-${createSaleResponse?.data?.id?.slice(0, 4)}`;

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
        th { padding: 2px 1px; font-size: 10px; font-weight: bold; background-color: #f0fdf4;  }
       
        .text-green-600 { color: #16a34a !important; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .receipt-header { border-bottom: 0.5px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 3px; }
        .receipt-footer { display: flex; justify-content: center; flex-direction: column; align-items: center;  border-top: 0.5px solid #e5e7eb; padding-top: 2px; margin-top: 2px; }
        .transaction-details { background-color: #f9fafb; padding: 1px; border-radius: 3px; margin: 1px 0; font-size: 10px; }

         .payment-method {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            background-color: #f0fdf4;
            padding: 2px;
            border-radius: 3px;
            margin: 2px 0;
            line-height: 1.2;
        }
        .payment-method-entry {
            display: flex;
            justify-content: space-between;
            width: 100%;
            font-size: 8px;
            color: #000;
            font-weight: bold;
            padding-bottom: 1px;
        }
        .payment-method-title {
            font-size: 8px;
            color: #000;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .payment-method-value {
            font-size: 8px;
            font-weight: bold;
            color: #16a34a;
        }

        .price-cell-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-start;
          min-height: 20px;
        }

        .price-main {
          font-size: 10px;
          font-weight: bold;
          color: #000;
          line-height: 1.2;
        }

        .discount-text {
          font-size: 7px;
          font-style: italic;
          color: #000 !important;
          font-weight: normal;
          line-height: 1;
          font-weight: bold;
          margin-top: 1px;
        }

        .vat-badge {
          font-size: 7px;
          color: #2563eb;
          background-color: #dbeafe;
          padding: 1px 3px;
          border-radius: 2px;
          display: inline-block;
          margin-top: 2px;
          font-weight: bold;
        }

        td {
          padding: 1px; 
          font-size: 10px; 
          border-bottom: 0.5px solid #f3f4f6;
          vertical-align: top;
        }

        .total-value { font-weight: bolder; font-size: 15px; color:#000;}
        .total-row { font-weight: bold; font-size: 12px; border-top: 1px solid #16a34a; padding-top: 3px; margin-top: 5px; }
        .summary-section { border-top: 0.5px solid #e5e7eb; padding-top: 3px; margin-top: 3px; }
        .summary-row, .discount-row, .vat-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 10px; }
        .vat-row { color: #2563eb; }
        .vat-label { color: #2563eb; font-size: 10px; }
        .vat-value { font-weight: bold; font-size: 10px; color: #2563eb; }
        .item-name { font-weight: bold; font-size: 10px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 1px; font-size: 10px; }
        .detail-label { color: #000; font-size: 10px; font-weight: bold; }
        .detail-value { font-weight: bold; font-size: 10px;text-transform: capitalize; }
        .powered-by { font-size: 8px;  text-align: center; }
        .contact-info { display: flex; flex-direction: column; align-items: center; gap: 0; margin-top: 1px; }
        .price-cell { font-weight: bold !important; font-size: 10px; }
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

      {/* Receipt content */}
      <div
        ref={receiptRef}
        className="receipt-container bg-white rounded-lg w-full p-2"
      >
        {/* Receipt header */}
        <div className="receipt-header text-center w-full business-info p-2 flex flex-col items-center gap-1 justify-center">
          <h2 className="receipt-title text-[13px] detail-value">
            PAYMENT RECEIPT
          </h2>
          <p className="business-name receipt-little font-semibold">
            {business?.name}
          </p>
          <p className="business-address text-[11px] receipt-little text-gray-500">
            {business?.street && `${business.street}, `}
            {business?.city}, {business?.state}, {business?.country}
          </p>
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

        {/* Items table */}
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
              {cart.map((item) => {
                const hasItemDiscount =
                  item.type === "PRODUCT" &&
                  item.discount_threshold &&
                  item.discount &&
                  (item.cartQuantity || 1) >= item.discount_threshold;

                const itemDiscount = hasItemDiscount ? item.discount : 0;
                const hasVat = item.allow_tax && vatInfo?.enabled;

                return (
                  <tr key={item.id}>
                    <td className="item-name text-[11px]">
                      <div>
                        {item.name}
                        {hasVat && <span className="vat-badge ml-1">+VAT</span>}
                      </div>
                    </td>
                    <td className="text-center text-[11px]">
                      {item.cartQuantity || 1}
                    </td>
                    <td className="text-right text-[11px] price-cell">
                      <div className="price-cell-container">
                        <div className="price-main">
                          {item?.selling_price
                            ? formatToNaira(item.selling_price)
                            : (formatToNaira(item.amount) ?? "₦0")}
                        </div>
                        {hasItemDiscount && (
                          <div className="discount-text">
                            Discount - {formatToNaira(itemDiscount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right text-[11px] price-cell">
                      {formatToNaira(
                        (item.selling_price || item.amount || 0) *
                          (item.cartQuantity || 1),
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Discount section */}
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

        {/* VAT Display Section */}
        {vatInfo?.enabled && vatInfo?.amount > 0 && (
          <div className="vat-section">
            <div className="summary-row flex justify-between items-center">
              <span className="text-[11px] text-gray-500">
                Subtotal (before VAT):
              </span>
              <span className="text-[11px] font-bold">
                {formatToNaira(total)}
              </span>
            </div>
            <div className="vat-row flex justify-between items-center">
              <span className="text-[11px] vat-label">
                VAT ({vatInfo.rate}%):
              </span>
              <span className="text-[11px] font-bold vat-value">
                +{formatToNaira(vatInfo.amount)}
              </span>
            </div>
          </div>
        )}

        {/* Payment summary - Updated to use totalWithVat if VAT enabled */}
        <div className="total-row">
          <span className="text-[11px]">TOTAL:</span>
          <span className=" text-[11px] detail-value">
            {formatToNaira(vatInfo?.enabled ? vatInfo.totalWithVat : total)}
          </span>
        </div>

        {/* Transaction details */}
        <div className="transaction-details">
          <div className="detail-row flex justify-between items-center">
            <span className="detail-label text-[11px] ">Date:</span>
            <span className="detail-value text-[11px] ">
              {format(
                new Date(createSaleResponse?.data?.created_at || Date.now()),
                "MMMM d, yyyy, h:mm a",
              )}
            </span>
          </div>
          <div className="detail-row flex justify-between items-center">
            <span className="detail-label text-[11px] ">Receipt No:</span>
            <span className="detail-value text-[11px] ">{receiptNumber}</span>
          </div>
          {customer && (
            <div className="detail-row flex justify-between items-center">
              <span className="detail-label text-[11px] ">Customer:</span>
              <span className="detail-value text-[11px] ">
                {customer?.name}
              </span>
            </div>
          )}
          {attendant && (
            <div className="detail-row flex justify-between items-center">
              <span className="detail-label text-[11px] ">Attendant:</span>
              <span className="detail-value text-[11px] ">
                {attendant?.name}
              </span>
            </div>
          )}
          {user?.role === "ATTENDANT" && (
            <div className="detail-row flex justify-between items-center">
              <span className="detail-label text-[11px] ">Attendant:</span>
              <span className="detail-value text-[11px] capitalize ">
                {user?.name}
              </span>
            </div>
          )}
        </div>

        {/* Payment method */}
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
                    className="payment-method-entry detail-value flex justify-between w-full"
                  >
                    <span className="text-[10px] capitalize">
                      {method.replace("_", " ")}:
                    </span>
                    <span className="text-green-600 text-[10px]">
                      {formatToNaira(parseFloat(amount as string))}
                    </span>
                  </div>
                ),
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
        {cart.some((item) => item.type === "PRODUCT") && (
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
              vatInfo={vatInfo}
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
