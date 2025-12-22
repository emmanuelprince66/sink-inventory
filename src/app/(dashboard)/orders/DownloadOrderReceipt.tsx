import {
  Document,
  Font,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { Download } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { JSX } from "react/jsx-runtime";

// TypeScript Interfaces
interface CustomerInfo {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address?: string;
}

interface PaymentHistory {
  amount: string;
  method: string;
  bank: string | null;
  created_at: string;
}

interface Product {
  id: string;
  unit_price: string;
  quantity: string;
  discount: string;
  name?: string;
}

interface OrderData {
  id: string;
  created_at: string;
  channel: string;
  payment_method: string | null;
  type: string;
  amount: string;
  amount_paid: number;
  shipping_status: "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED";
  customer_info: CustomerInfo;
  payment_status: "PAID" | "PARTIAL" | "UNPAID";
  note: string;
  shipping_fee: string;
  tax: string;
  shipping_date: string;
  created_by: string | null;
  last_updated_by: string | null;
  payment_history: PaymentHistory[];
  products?: Product[];
}

interface OrderReceiptPDFProps {
  orderData: OrderData;
  business: any;
}

interface DownloadOrderReceiptProps {
  orderData: OrderData;
  business: any;
}

// Register fonts
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

// PDF Styles - Updated to match invoice design
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 12,
    color: "#666666",
  },
  dateText: {
    fontSize: 11,
    color: "#666666",
    textAlign: "right",
  },
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  addressBlock: {
    width: "45%",
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  addressText: {
    fontSize: 10,
    color: "#4a4a4a",
    lineHeight: 1.5,
    marginBottom: 2,
  },
  table: {
    width: "100%",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  cellQty: {
    width: "10%",
    fontSize: 10,
  },
  cellDescription: {
    width: "50%",
    fontSize: 10,
  },
  cellUnitPrice: {
    width: "20%",
    textAlign: "right",
    fontSize: 10,
  },
  cellAmount: {
    width: "20%",
    textAlign: "right",
    fontSize: 10,
    fontWeight: "bold",
  },
  summarySection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#4a4a4a",
  },
  summaryValue: {
    fontSize: 11,
    color: "#1a1a1a",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#1a1a1a",
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  bankDetails: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
  },
  bankTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  bankText: {
    fontSize: 10,
    color: "#4a4a4a",
    lineHeight: 1.5,
  },
  paymentLink: {
    fontSize: 10,
    color: "#4a4a4a",
    marginTop: 4,
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
  },
  thankYou: {
    fontSize: 11,
    color: "#4a4a4a",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 2,
  },
});

// PDF Document Component
const OrderReceiptPDF: React.FC<OrderReceiptPDFProps> = React.memo(
  ({ orderData, business }) => {
    const businessData = business?.data;
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }) +
        ", " +
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    const calculateSubtotal = (): number => {
      if (!orderData.products) return parseFloat(orderData.amount);

      return orderData.products.reduce((sum, product) => {
        const unitPrice = parseFloat(product.unit_price);
        const quantity = parseFloat(product.quantity);
        return sum + unitPrice * quantity;
      }, 0);
    };

    const subtotal = calculateSubtotal();

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.orderNumber}>
                Order: {orderData.id.slice(0, 8)}
              </Text>
            </View>
            <View>
              <Text style={styles.dateText}>
                {formatDate(orderData.created_at)}
              </Text>
            </View>
          </View>

          {/* Billing and Shipping Address */}
          <View style={styles.addressSection}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>Bill To:</Text>
              <Text style={styles.addressText}>
                {orderData.customer_info.name}
              </Text>
              {orderData.customer_info.address && (
                <Text style={styles.addressText}>
                  {orderData.customer_info.address}
                </Text>
              )}
              {orderData.customer_info.phone && (
                <Text style={styles.addressText}>
                  {orderData.customer_info.phone}
                </Text>
              )}
            </View>

            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>Ship To:</Text>
              <Text style={styles.addressText}>
                {orderData.customer_info.name}
              </Text>
              {orderData.customer_info.address && (
                <Text style={styles.addressText}>
                  {orderData.customer_info.address}
                </Text>
              )}
              {orderData.customer_info.phone && (
                <Text style={styles.addressText}>
                  {orderData.customer_info.phone}
                </Text>
              )}
            </View>
          </View>

          {/* Products Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.cellQty}>QTY</Text>
              <Text style={styles.cellDescription}>DESCRIPTION</Text>
              <Text style={styles.cellUnitPrice}>UNIT PRICE</Text>
              <Text style={styles.cellAmount}>AMOUNT</Text>
            </View>

            {orderData.products && orderData.products.length > 0 ? (
              orderData.products.map((product, index) => {
                const unitPrice = parseFloat(product.unit_price);
                const quantity = parseFloat(product.quantity);
                const amount = unitPrice * quantity;

                return (
                  <View key={product.id} style={styles.tableRow}>
                    <Text style={styles.cellQty}>{quantity}</Text>
                    <Text style={styles.cellDescription}>
                      {product.name || `Item ${index + 1}`}
                    </Text>
                    <Text style={styles.cellUnitPrice}>
                      NGN {unitPrice.toLocaleString()}
                    </Text>
                    <Text style={styles.cellAmount}>
                      NGN {amount.toLocaleString()}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.tableRow}>
                <Text style={styles.cellQty}>1</Text>
                <Text style={styles.cellDescription}>Order Payment</Text>
                <Text style={styles.cellUnitPrice}>
                  NGN {parseFloat(orderData.amount).toLocaleString()}
                </Text>
                <Text style={styles.cellAmount}>
                  NGN {parseFloat(orderData.amount).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {/* Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                NGN {subtotal.toLocaleString()}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                NGN {parseFloat(orderData.amount).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Bank Details */}
          <View style={styles.bankDetails}>
            <Text style={styles.bankTitle}>Bank Details</Text>
            {business?.owner?.firstname && business?.owner?.lastname && (
              <Text style={styles.bankText}>
                {business.owner.firstname} {business.owner.lastname}
              </Text>
            )}
            {business?.name && (
              <Text style={styles.bankText}>{business.name}</Text>
            )}
            {orderData.payment_history?.[0]?.bank && (
              <Text style={styles.bankText}>
                {orderData.payment_history[0].bank}
              </Text>
            )}
            {orderData.payment_history?.[0] && (
              <Text style={styles.paymentLink}>
                Payment Method: {orderData.payment_history[0].method}
              </Text>
            )}
          </View>

          {/* Footer with Business Info */}
          <View style={styles.footer}>
            <Text style={styles.thankYou}>Thank you.</Text>
            <Text style={styles.contactText}>. .</Text>
            {businessData?.owner?.email && (
              <Text style={styles.contactText}>{businessData.owner.email}</Text>
            )}
            {businessData?.name &&
              businessData?.street &&
              businessData?.city && (
                <Text style={styles.contactText}>
                  {businessData.name} - {businessData.street},{" "}
                  {businessData.city}, {businessData.state},{" "}
                  {businessData.country}
                </Text>
              )}
            {businessData?.owner?.phone && (
              <Text style={styles.contactText}>{businessData.owner.phone}</Text>
            )}
          </View>
        </Page>
      </Document>
    );
  }
);

OrderReceiptPDF.displayName = "OrderReceiptPDF";

// Download Button Component - TRULY FIXED VERSION
const DownloadOrderReceipt: React.FC<DownloadOrderReceiptProps> = ({
  orderData,
  business,
}) => {
  const receiptNumber = orderData?.id?.slice(0, 8) || "INVOICE";

  // Create a stable string representation of the data we care about
  const dataSignature = useMemo(() => {
    if (!orderData) return "";
    return JSON.stringify({
      orderId: orderData.id,
      businessId: business?.data?.id,
      amount: orderData.amount,
      paymentStatus: orderData.payment_status,
      productsCount: orderData.products?.length || 0,
    });
  }, [
    orderData?.id,
    orderData?.amount,
    orderData?.payment_status,
    orderData?.products?.length,
    business?.data?.id,
  ]);

  // Store the PDF document in state, only update when dataSignature changes
  const [pdfDoc, setPdfDoc] = useState<JSX.Element | null>(null);

  useEffect(() => {
    if (orderData) {
      setPdfDoc(<OrderReceiptPDF orderData={orderData} business={business} />);
    }
  }, [dataSignature]); // Only regenerate when the signature changes

  if (!orderData || !pdfDoc) {
    return null;
  }

  return (
    <PDFDownloadLink
      document={pdfDoc}
      fileName={`Invoice-${receiptNumber}.pdf`}
    >
      {({ loading, error }) => {
        if (error) {
          console.error("PDF generation error:", error);
          return (
            <button
              className="flex items-center cursor-pointer space-x-2 px-3 py-2 bg-gray-400 text-white text-sm font-medium rounded-md"
              disabled
            >
              <Download className="h-4 w-4" />
              <span>Error</span>
            </button>
          );
        }

        return (
          <button
            className="flex items-center cursor-pointer space-x-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            <span>{loading ? "Generating..." : "Download"}</span>
          </button>
        );
      }}
    </PDFDownloadLink>
  );
};

export default DownloadOrderReceipt;
