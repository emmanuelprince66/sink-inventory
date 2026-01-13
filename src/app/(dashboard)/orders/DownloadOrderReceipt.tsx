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
}

interface DeliveryAddress {
  first_name: string;
  last_name: string;
  phone: string;
  alt_phone: string | null;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string | null;
}

interface PaymentHistory {
  amount: string;
  method: string;
  bank: string | null;
  created_at: string;
}

interface Product {
  product_name: string;
  unit_price: string;
  price: string;
  quantity: string;
  discount: string;
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
  delivery_address: DeliveryAddress;
  payment_status: "PAID" | "PARTIAL" | "UNPAID";
  note: string;
  shipping_fee: string;
  tax: string;
  shipping_date: string;
  created_by: string | null;
  last_updated_by: string | null;
  payment_history: PaymentHistory[];
  products: Product[];
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

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  invoiceTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1f2937",
    letterSpacing: 1,
  },
  orderInfo: {
    marginTop: 8,
  },
  orderNumber: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  statusBadge: {
    fontSize: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "bold",
  },
  statusUnpaid: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  statusPending: {
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
  },
  dateInfo: {
    textAlign: "right",
  },
  dateText: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 3,
  },
  createdBy: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 4,
  },
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 35,
    gap: 30,
  },
  addressBlock: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 6,
  },
  addressTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.6,
    marginBottom: 3,
  },
  table: {
    width: "100%",
    marginBottom: 25,
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  cellQty: {
    width: "10%",
    fontSize: 10,
    color: "#1f2937",
  },
  cellDescription: {
    width: "48%",
    fontSize: 10,
    color: "#1f2937",
    paddingRight: 10,
  },
  productName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  discountBadge: {
    fontSize: 8,
    color: "#059669",
    marginTop: 2,
  },
  cellUnitPrice: {
    width: "21%",
    textAlign: "right",
    fontSize: 10,
    color: "#4b5563",
  },
  cellAmount: {
    width: "21%",
    textAlign: "right",
    fontSize: 10,
    color: "#1f2937",
    fontWeight: "bold",
  },
  summarySection: {
    marginTop: 25,
    alignItems: "flex-end",
  },
  summaryBox: {
    width: "45%",
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  summaryRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 10,
    color: "#1f2937",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#2563eb",
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2563eb",
  },
  noteSection: {
    marginTop: 35,
    padding: 15,
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#92400e",
  },
  noteText: {
    fontSize: 9,
    color: "#78350f",
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 50,
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  thankYou: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 15,
  },
  businessInfo: {
    alignItems: "center",
  },
  businessName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 3,
  },
});

// Helper function to safely parse numbers
const safeParseFloat = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to format currency
const formatCurrency = (value: string | number | undefined | null): string => {
  const num = safeParseFloat(value);
  return num.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// PDF Document Component
const OrderReceiptPDF: React.FC<OrderReceiptPDFProps> = React.memo(
  ({ orderData, business }) => {
    const businessData = business?.data;

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    const calculateSubtotal = (): number => {
      if (!orderData.products || orderData.products.length === 0) {
        return (
          safeParseFloat(orderData.amount) -
          safeParseFloat(orderData.shipping_fee)
        );
      }

      return orderData.products.reduce((sum, product) => {
        const price = safeParseFloat(product.price);
        const quantity = safeParseFloat(product.quantity);
        return sum + price * quantity;
      }, 0);
    };

    const subtotal = calculateSubtotal();
    const shippingFee = safeParseFloat(orderData.shipping_fee);
    const tax = safeParseFloat(orderData.tax);
    const total = safeParseFloat(orderData.amount);

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>
                  Order: #{orderData.id.slice(0, 8).toUpperCase()}
                </Text>
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusBadge, styles.statusUnpaid]}>
                    {orderData.payment_status}
                  </Text>
                  <Text style={[styles.statusBadge, styles.statusPending]}>
                    {orderData.shipping_status}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>
                {formatDate(orderData.created_at)}
              </Text>
              {orderData.created_by && (
                <Text style={styles.createdBy}>
                  Created by: {orderData.created_by}
                </Text>
              )}
            </View>
          </View>

          {/* Billing and Shipping Address */}
          <View style={styles.addressSection}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>Bill To</Text>
              <Text style={[styles.addressText, { fontWeight: "bold" }]}>
                {orderData.customer_info.name}
              </Text>
              {orderData.customer_info.email && (
                <Text style={styles.addressText}>
                  {orderData.customer_info.email}
                </Text>
              )}
              {orderData.customer_info.phone && (
                <Text style={styles.addressText}>
                  {orderData.customer_info.phone}
                </Text>
              )}
            </View>

            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>Ship To</Text>
              {orderData.delivery_address ? (
                <>
                  <Text style={[styles.addressText, { fontWeight: "bold" }]}>
                    {orderData.delivery_address.first_name}{" "}
                    {orderData.delivery_address.last_name}
                  </Text>
                  {orderData.delivery_address.address && (
                    <Text style={styles.addressText}>
                      {orderData.delivery_address.address}
                    </Text>
                  )}
                  {orderData.delivery_address.city && (
                    <Text style={styles.addressText}>
                      {orderData.delivery_address.city}
                      {orderData.delivery_address.state &&
                        `, ${orderData.delivery_address.state}`}
                    </Text>
                  )}
                  {orderData.delivery_address.country && (
                    <Text style={styles.addressText}>
                      {orderData.delivery_address.country}
                    </Text>
                  )}
                  {orderData.delivery_address.phone && (
                    <Text style={styles.addressText}>
                      {orderData.delivery_address.phone}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={[styles.addressText, { fontWeight: "bold" }]}>
                  {orderData.customer_info.name}
                </Text>
              )}
            </View>
          </View>

          {/* Products Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.cellQty]}>QTY</Text>
              <Text style={[styles.tableHeaderText, styles.cellDescription]}>
                DESCRIPTION
              </Text>
              <Text style={[styles.tableHeaderText, styles.cellUnitPrice]}>
                UNIT PRICE
              </Text>
              <Text style={[styles.tableHeaderText, styles.cellAmount]}>
                AMOUNT
              </Text>
            </View>

            {orderData.products && orderData.products.length > 0 ? (
              orderData.products.map((product, index) => {
                const unitPrice = safeParseFloat(product.unit_price);
                const quantity = safeParseFloat(product.quantity);
                const price = safeParseFloat(product.price);
                const discount = safeParseFloat(product.discount);
                const lineTotal = price * quantity;

                const rowStyles =
                  index % 2 === 1
                    ? [styles.tableRow, styles.tableRowAlt]
                    : [styles.tableRow];

                return (
                  <View key={index} style={rowStyles}>
                    <Text style={styles.cellQty}>{quantity}</Text>
                    <View style={styles.cellDescription}>
                      <Text style={styles.productName}>
                        {product.product_name}
                      </Text>
                      {discount > 0 && (
                        <Text style={styles.discountBadge}>
                          Discount: -₦{formatCurrency(discount)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.cellUnitPrice}>
                      ₦{formatCurrency(unitPrice)}
                    </Text>
                    <Text style={styles.cellAmount}>
                      ₦{formatCurrency(lineTotal)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.tableRow}>
                <Text style={styles.cellQty}>1</Text>
                <Text style={styles.cellDescription}>Order Payment</Text>
                <Text style={styles.cellUnitPrice}>
                  ₦{formatCurrency(subtotal)}
                </Text>
                <Text style={styles.cellAmount}>
                  ₦{formatCurrency(subtotal)}
                </Text>
              </View>
            )}
          </View>

          {/* Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ₦{formatCurrency(subtotal)}
                </Text>
              </View>

              {shippingFee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping Fee</Text>
                  <Text style={styles.summaryValue}>
                    ₦{formatCurrency(shippingFee)}
                  </Text>
                </View>
              )}

              {tax > 0 && (
                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>
                    ₦{formatCurrency(tax)}
                  </Text>
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>₦{formatCurrency(total)}</Text>
              </View>
            </View>
          </View>

          {/* Note Section */}
          {orderData.note && (
            <View style={styles.noteSection}>
              <Text style={styles.noteTitle}>Delivery Instructions</Text>
              <Text style={styles.noteText}>{orderData.note}</Text>
            </View>
          )}

          {/* Footer with Business Info */}
          <View style={styles.footer}>
            <Text style={styles.thankYou}>Thank You For Your Business!</Text>
            <View style={styles.businessInfo}>
              {businessData?.name && (
                <Text style={styles.businessName}>{businessData.name}</Text>
              )}
              {businessData?.owner?.email && (
                <Text style={styles.contactText}>
                  {businessData.owner.email}
                </Text>
              )}
              {businessData?.street && (
                <Text style={styles.contactText}>
                  {businessData.street}
                  {businessData?.city && `, ${businessData.city}`}
                  {businessData?.state && `, ${businessData.state}`}
                  {businessData?.country && `, ${businessData.country}`}
                </Text>
              )}
              {businessData?.owner?.phone && (
                <Text style={styles.contactText}>
                  {businessData.owner.phone}
                </Text>
              )}
            </View>
          </View>
        </Page>
      </Document>
    );
  }
);

OrderReceiptPDF.displayName = "OrderReceiptPDF";

// Download Button Component
const DownloadOrderReceipt: React.FC<DownloadOrderReceiptProps> = ({
  orderData,
  business,
}) => {
  const receiptNumber = orderData?.id?.slice(0, 8).toUpperCase() || "INVOICE";

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

  const [pdfDoc, setPdfDoc] = useState<JSX.Element | null>(null);

  useEffect(() => {
    if (orderData) {
      setPdfDoc(<OrderReceiptPDF orderData={orderData} business={business} />);
    }
  }, [dataSignature]);

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
            <span>{loading ? "Generating..." : "Download Invoice"}</span>
          </button>
        );
      }}
    </PDFDownloadLink>
  );
};

export default DownloadOrderReceipt;
