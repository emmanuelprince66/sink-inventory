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

// PDF Styles - enhanced for better visual hierarchy
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#16a34a",
  },
  subtitle: {
    color: "#16a34a",
    marginBottom: 8,
    fontWeight: "bold",
  },
  businessInfo: {
    fontSize: 10,
    marginBottom: 15,
  },
  businessDetails: {
    fontSize: 10,
    marginTop: 3,
    marginBottom: 5,
    color: "#555555",
  },
  dateBox: {
    backgroundColor: "#f7f7f7",
    padding: 8,
    borderRadius: 5,
    marginBottom: 15,
  },
  dateInfo: {
    fontSize: 10,
  },
  receiptNumber: {
    fontSize: 10,
    marginTop: 5,
    fontStyle: "italic",
  },
  table: {
    width: "100%",
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#16a34a",
    paddingBottom: 5,
    marginBottom: 8,
    backgroundColor: "#f0fdf4",
    paddingTop: 5,
    paddingHorizontal: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 8,
  },
  cellItem: {
    flex: 3,
    paddingRight: 5,
  },
  cellCategory: {
    fontSize: 9,
    color: "#666666",
    marginTop: 2,
  },
  cellQty: {
    flex: 1,
    textAlign: "center",
  },
  cellPrice: {
    flex: 2,
    textAlign: "right",
    paddingRight: 5,
  },
  cellTotal: {
    flex: 2,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#16a34a",
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 14,
  },
  paymentMethodBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0fdf4",
    borderRadius: 5,
  },
  paymentMethodTitle: {
    fontSize: 10,
    color: "#666666",
  },
  paymentMethodValue: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 3,
    color: "#16a34a",
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    paddingTop: 15,
  },
  thankyou: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  poweredBy: {
    marginTop: 10,
    fontSize: 8,
    color: "#888888",
  },
});

// PDF Document Component
const ReceiptPDFDocument = ({
  cart,
  business,
  receiptNumber,
  createSaleResponse,
  total,
}: {
  cart: any[];
  business: any;
  receiptNumber: string;
  createSaleResponse: any;
  total: number;
}) => {
  try {
    return (
      <Document>
        <Page size="A5" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            {business?.logo && <img src={business.logo} style={styles.logo} />}
            <Text style={styles.title}>PAYMENT RECEIPT</Text>
            <Text style={styles.subtitle}>TRANSACTION SUCCESSFUL</Text>
            <Text style={styles.businessInfo}>{business?.name || "STORE"}</Text>
            <Text style={styles.businessDetails}>
              {business?.street && `${business.street}, `}
              {business?.city && `${business.city}, `}
              {business?.state || ""}
            </Text>
            {business?.owner?.phone && (
              <Text style={styles.businessDetails}>
                Phone: {business.owner.phone}
              </Text>
            )}
            {business?.owner?.email && (
              <Text style={styles.businessDetails}>
                Email: {business.owner.email}
              </Text>
            )}
          </View>

          {/* Date & Receipt Number */}
          <View style={styles.dateBox}>
            <Text style={styles.dateInfo}>
              Date:{" "}
              {format(
                new Date(createSaleResponse?.data?.created_at || Date.now()),
                "MMMM d, yyyy, h:mm a"
              )}
            </Text>
            <Text style={styles.receiptNumber}>Receipt #: {receiptNumber}</Text>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.cellItem}>ITEM</Text>
              <Text style={styles.cellQty}>QTY</Text>
              <Text style={styles.cellPrice}>PRICE</Text>
              <Text style={styles.cellTotal}>TOTAL</Text>
            </View>

            {/* Table Rows */}
            {cart.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.cellItem}>
                  <Text>{item.name}</Text>
                  {item.category && (
                    <Text style={styles.cellCategory}>{item.category}</Text>
                  )}
                </View>
                <Text style={styles.cellQty}>{item.cartQuantity || 1}</Text>
                <Text style={styles.cellPrice}>
                  {business?.currency || "₦"}{" "}
                  {item.selling_price?.toLocaleString() || "0"}
                </Text>
                <Text style={styles.cellTotal}>
                  {business?.currency || "₦"}{" "}
                  {(
                    (item.selling_price || 0) * (item.cartQuantity || 1)
                  ).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: "bold", marginRight: 10 }}>TOTAL:</Text>
            <Text style={styles.totalAmount}>
              {business?.currency || "₦"} {total.toLocaleString()}
            </Text>
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
            <Text style={styles.thankyou}>THANK YOU FOR YOUR BUSINESS!</Text>
            <Text style={styles.businessDetails}>
              {business?.street && `${business.street}, `}
              {business?.city || ""}
            </Text>
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
  business,
}: {
  setShowReceipt: (show: boolean) => void;
  setShowPrintReceiptView: (show: boolean) => void;
  clearCartFunc: any;
  createSaleResponse: any;
  cart: any[];
  business: any;
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

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
          .receipt-container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th { padding: 8px 4px; font-size: 14px; border-bottom: 2px solid #16a34a; background-color: #f0fdf4; }
          td { padding: 10px 4px; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
          .text-green-600 { color: #16a34a !important; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          img { max-height: 40px; max-width: 40px; object-fit: contain; }
          .receipt-header { border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
          .receipt-footer { border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 20px; }
          .payment-method { background-color: #f0fdf4; padding: 10px; border-radius: 4px; margin: 10px 0; }
          .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #16a34a; padding-top: 10px; }
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
    <div className="w-full flex flex-col items-center gap-4 p-4">
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
          <PlusCircle size={18} />
          Start New Sale
        </Button>
      </div>

      {/* Receipt content */}
      <div
        ref={receiptRef}
        className="receipt-container w-full max-w-md bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        {/* Receipt header */}
        <div className="receipt-header text-center mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-bold mb-2 text-green-600">
            PAYMENT RECEIPT
          </h2>
          <p className="text-green-600 font-semibold text-sm mb-3">
            TRANSACTION SUCCESSFUL
          </p>

          <div className="w-full flex flex-col items-center gap-3">
            {business?.logo && (
              <img
                src={business?.logo}
                alt={business?.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-green-100 shadow-sm"
              />
            )}
            <div className="flex flex-col items-center w-full">
              <p className="font-semibold text-base">{business?.name}</p>
              <p className="text-xs text-gray-500">
                {business?.street && `${business.street}, `}
                {business?.city}, {business?.state}, {business?.country}
              </p>
              {business?.owner?.phone && (
                <p className="text-xs text-gray-500">
                  Phone: {business?.owner?.phone}
                </p>
              )}
              {business?.owner?.email && (
                <p className="text-xs text-gray-500">
                  Email: {business?.owner?.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Transaction details */}
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium">
                {format(
                  new Date(createSaleResponse?.data?.created_at || Date.now()),
                  "MMMM d, yyyy, h:mm a"
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Receipt No:</span>
              <span className="font-medium">{receiptNumber}</span>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="my-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-green-50">
                <th className="py-2 px-1 rounded-tl-md">ITEM</th>
                <th className="py-2 px-1 text-center">QTY</th>
                <th className="py-2 px-1 text-right">PRICE</th>
                <th className="py-2 px-1 text-right rounded-tr-md">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-1">
                    <div className="flex items-center gap-2">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.category && (
                          <p className="text-gray-400 text-xs">
                            {item.category}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-1">
                    {item.cartQuantity || 1}
                  </td>
                  <td className="text-right py-3 px-1">
                    ₦
                    {formatToNaira(item.selling_price) ||
                      formatToNaira(item.amount) ||
                      "0"}
                  </td>
                  <td className="text-right py-3 px-1 font-medium">
                    ₦{" "}
                    {(
                      (item.selling_price || item.amount || 0) *
                      (item.cartQuantity || 1)
                    ).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment summary */}
        <div className="flex justify-between font-bold mt-4 pt-3 border-t-2 border-green-600 text-base">
          <span>TOTAL:</span>
          <span className="text-green-600">₦{formatToNaira(total)}</span>
        </div>

        {/* Payment method */}
        <div className="mt-4 bg-green-50 p-3 rounded-md">
          <p className="text-xs text-gray-500">PAYMENT METHOD:</p>
          <p className="capitalize font-semibold text-green-600">
            {(createSaleResponse?.data?.method || "cash")
              .toUpperCase()
              .replace("_", " ")}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="font-bold text-base">THANK YOU!</p>
          <p className="mt-1 text-xs text-gray-400">Powered by Sync360</p>
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
