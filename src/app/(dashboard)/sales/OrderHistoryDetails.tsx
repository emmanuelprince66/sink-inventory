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
import { SalesOrder } from "./types";

import { Spinner } from "@/components/app/Spinner";
import { useSalesHook } from "@/hooks/useSalesHook";
import { formatToNaira } from "@/utils/formatMoney";

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
    padding: 8,
    fontSize: 12,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
    width: "100%",
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
    padding: 10, // Reduced from 12
    marginVertical: 16,
    width: "100%", // Ensure full width
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12, // Reduced from 14
    color: "#6b7280",
    flexShrink: 1, // Allow text to wrap if needed
  },
  detailValue: {
    fontSize: 12, // Reduced from 14
    fontWeight: "bold",
    flexShrink: 1, // Allow text to wrap if needed
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
  const transactionId = orderDetails.id.substring(0, 6);

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
                  "MMMM d, yyyy, h:mm a"
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
                </View>
                <Text style={styles.cellQty}>{product.quantity}</Text>
                <Text style={styles.cellPrice}>
                  {parseFloat(product.price).toLocaleString()}
                </Text>
                <Text style={styles.cellTotal}>
                  {(
                    parseFloat(product.price) * product.quantity
                  ).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

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
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue}>#{transactionId}</Text>
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
  console.log("orderDetails", orderDetails);
  const { ReverseSalePending, handleReverseSale, loading } = useSalesHook({
    closeModal,
  });
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  console.log("business", business);

  const tt =
    orderDetails &&
    orderDetails?.products
      ?.reduce((total, product) => {
        return total + parseFloat(product.price) * product.quantity;
      }, 0)
      .toLocaleString();

  console.log("tt", tt);

  // Format the date using moment.js
  const formattedDate = moment(orderDetails.created_at).format(
    "MMMM DD, YYYY, h:mm A"
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
          table { width: 100%; border-collapse: collapse; margin: 3px 0; }
          th { padding: 5px 3px; font-size: 12px; font-weight: bold; background-color: #f0fdf4; border-top-left-radius: 4px; border-top-right-radius: 4px; }
          td { padding: 6px 3px; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
          .text-green-600 { color: #16a34a !important; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .receipt-header { border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 20px; }
          .receipt-footer { border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 30px; }
          .transaction-details { background-color: #f9fafb; border-radius: 6px; margin: 5px 0;width: 98%; }
          .payment-method {width: 98%; background-color: #f0fdf4; display: flex; justify-content: space-between; padding: 3px; border-radius: 6px; margin: 1px 0; }
          .total-row { font-weight: bold; font-size: 10px; border-top: 2px solid #16a34a; padding-top: 4px; margin-top: 5px; }
          .item-name { font-weight: bold; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .detail-label { color: #6b7280; font-size: 10px; }
          .detail-value { font-weight: bold; font-size: 10px; }
          .contact-info { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 5px; }
          .receipt-title { font-size: 13px; font-weight: bold; color: #16a34a; }
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
      <div className="flex items-center justify-center">
        <div className="bg-white w-full max-w-full overflow-hidden max-h-[90vh] flex flex-col">
          <div className="overflow-y-auto flex-1">
            {/* Printable content - Styled like PDF receipt */}
            <div
              ref={receiptRef}
              className="receipt-container w-full  bg-white p-1 mx-auto"
            >
              {/* Receipt header */}
              <div className="receipt-header text-center mb-4 pb-3 border-b border-gray-200">
                <p className="text-xl receipt-title font-bold mb-2 text-green-600">
                  ORDER RECEIPT
                </p>
                {/* <p className="text-green-600 font-semibold text-sm mb-3">
                  ORDER DETAILS
                </p> */}

                {/* <div className="w-full flex flex-col items-center gap-3">
                  <div className="flex flex-col items-center w-full">
                    <p className="font-semibold text-base">
                      {business?.name || "STORE"}
                    </p>
                    {business?.street && (
                      <p className="text-xs text-gray-500">
                        {business.street}, {business.city}, {business.state},{" "}
                        {business.country}
                      </p>
                    )}

                    {(business?.owner?.email || business?.owner?.phone) && (
                      <div className="contact-info flex items-center gap-2 mt-1">
                        {business?.owner?.email && (
                          <p className="text-xs text-gray-500">
                            {business.owner.email}
                          </p>
                        )}
                        {business?.owner?.email && business?.owner?.phone && (
                          <p className="text-gray-500">|</p>
                        )}
                        {business?.owner?.phone && (
                          <p className="text-xs text-gray-500">
                            {business.owner.phone}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div> */}
              </div>

              {/* Items table */}
              <div className="my-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-green-50">
                      <th className="py-2 px-1 rounded-tl-md">ITEM</th>
                      <th className="py-2 px-1 text-center">QTY</th>
                      <th className="py-2 px-1 text-right">PRICE</th>
                      <th className="py-2 px-1 text-right rounded-tr-md">
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.products.map((product, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-1">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="item-name font-medium">
                                {product.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-1">
                          {product.quantity}
                        </td>
                        <td className="text-right py-3 px-1">
                          {formatToNaira(parseFloat(product.price))}
                        </td>
                        <td className="text-right py-3 px-1 font-medium">
                          {parseFloat(product.price) * product.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment summary */}
              <div className="total-row flex justify-between font-bold mt-4 pt-3 border-t-2 border-green-600 text-base">
                <span>TOTAL:</span>
                <span className="text-green-600">{tt}</span>
              </div>

              {/* Transaction details */}
              <div className="transaction-details bg-gray-50 rounded-md p-3 my-4">
                <div className="space-y-1 text-sm">
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-gray-500">Date:</span>
                    <span className="detail-value font-medium">
                      {formattedDate}
                    </span>
                  </div>
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-gray-500">
                      Order ID:
                    </span>
                    <span className="detail-value font-medium">
                      #{shortOrderId}
                    </span>
                  </div>
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-gray-500">Status:</span>
                    <span className="detail-value font-medium">
                      {orderDetails.payment_status}
                    </span>
                  </div>
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-gray-500">
                      Attendant:
                    </span>
                    <span className="detail-value font-medium">
                      {orderDetails.attendant}
                    </span>
                  </div>
                  <div className="detail-row flex justify-between">
                    <span className="detail-label text-gray-500">
                      Transaction ID:
                    </span>
                    <span className="detail-value font-medium">
                      #{transactionId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="payment-method mt-2 flex justify-between bg-green-50 p-3 rounded-md">
                <p className="text-xs text-gray-500">PAYMENT METHOD:</p>
                <p className="capitalize font-semibold text-green-600">
                  {orderDetails.method.toUpperCase()}
                </p>
              </div>

              {/* Reverse Sale Button */}
              <div
                onClick={() => handleReverseSale(orderDetails?.id)}
                className="w-full bg-yellow-50 rounded-lg gap-2 p-3 flex items-center justify-center border border-yellow-100 cursor-pointer no-print mt-4"
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

              {/* Footer */}
              {/* <div className="receipt-footer mt-6 pt-4 border-t border-gray-200 text-center">
                <p className="font-bold text-base">THANK YOU!</p>
                <p className="mt-1 text-xs text-gray-400">Powered by Sync360</p>
              </div> */}
            </div>

            {/* Action buttons - Print and Download */}
            <div className="w-full px-4 pb-4 flex gap-3 no-print mt-4">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="gap-2 flex-1 hover:bg-gray-50 border-green-200"
                disabled={isPrinting}
              >
                {isPrinting ? (
                  "Printing..."
                ) : (
                  <>
                    <Printer size={18} className="text-green-600" />
                    <span className="text-green-600">Print Order</span>
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
        </div>
      </div>
    </>
  );
};

export default OrderHistoryDetails;
