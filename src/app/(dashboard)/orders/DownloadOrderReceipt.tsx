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
  address?: string;
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
  name: string;
  image?: string;
  unit_price: string;
  price: string;
  quantity: string;
  discount?: string;
}

interface OrderData {
  id: string;
  created_at: string;
  channel: string;
  method: string;
  total_price: string;
  amount_paid: number;
  customer_info: CustomerInfo;
  delivery: {
    delivery_address: DeliveryAddress;
    shipping_status: "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED";
    shipping_fee: number;
  };
  payment_status: "PAID" | "PARTIAL" | "UNPAID";
  description: string;
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

// PDF Styles with green theme and tighter spacing
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#059669",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#065f46",
    letterSpacing: 1,
  },
  orderInfo: {
    marginTop: 6,
  },
  orderNumber: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 3,
  },
  statusContainer: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  statusBadge: {
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: "bold",
  },
  statusPaid: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusUnpaid: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  statusPartial: {
    backgroundColor: "#fed7aa",
    color: "#9a3412",
  },
  statusPending: {
    backgroundColor: "#e0f2fe",
    color: "#075985",
  },
  statusShipped: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  statusDelivered: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusReturned: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  dateInfo: {
    textAlign: "right",
  },
  dateText: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  createdBy: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 3,
  },
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 20,
  },
  addressBlock: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  addressTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#065f46",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
    marginBottom: 2,
  },
  table: {
    width: "100%",
    marginBottom: 15,
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ecfdf5",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#065f46",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  cellQty: {
    width: "8%",
    fontSize: 9,
    color: "#1f2937",
  },
  cellDescription: {
    width: "52%",
    fontSize: 9,
    color: "#1f2937",
    paddingRight: 8,
  },
  productName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  discountBadge: {
    fontSize: 7,
    color: "#059669",
    marginTop: 2,
  },
  cellUnitPrice: {
    width: "20%",
    textAlign: "right",
    fontSize: 9,
    color: "#4b5563",
  },
  cellAmount: {
    width: "20%",
    textAlign: "right",
    fontSize: 9,
    color: "#065f46",
    fontWeight: "bold",
  },
  summarySection: {
    marginTop: 15,
    alignItems: "flex-end",
  },
  summaryBox: {
    width: "50%",
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  summaryRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#4b5563",
  },
  summaryValue: {
    fontSize: 10,
    color: "#065f46",
    fontWeight: "bold",
    minWidth: 80,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#059669",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: -15,
    marginBottom: -15,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#065f46",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#059669",
    minWidth: 80,
    textAlign: "right",
  },
  noteSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
  noteTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#92400e",
  },
  noteText: {
    fontSize: 8,
    color: "#78350f",
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#d1fae5",
    alignItems: "center",
  },
  thankYou: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 12,
  },
  businessInfo: {
    alignItems: "center",
  },
  businessName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 6,
  },
  contactText: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
  },
});

// Helper function to safely parse numbers
const safeParseFloat = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to format currency - improved version with NGN prefix
const formatCurrency = (value: string | number | undefined | null): string => {
  const num = safeParseFloat(value);
  // Use standard number formatting without locale to avoid symbol issues
  return num.toFixed(2);
};

// PDF Document Component
const OrderReceiptPDF: React.FC<OrderReceiptPDFProps> = React.memo(
  ({ orderData, business }) => {
    const businessData = business?.data;

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
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
          safeParseFloat(orderData.total_price) -
          safeParseFloat(orderData.delivery?.shipping_fee)
        );
      }

      return orderData.products.reduce((sum, product) => {
        const price = safeParseFloat(product.price);
        const quantity = safeParseFloat(product.quantity);
        return sum + price * quantity;
      }, 0);
    };

    const subtotal = calculateSubtotal();
    const shippingFee = safeParseFloat(orderData.delivery?.shipping_fee);
    const tax = 0; // No tax in current data structure
    const total = safeParseFloat(orderData.total_price);

    // Get payment status badge style
    const getPaymentStatusStyle = () => {
      switch (orderData.payment_status) {
        case "PAID":
          return styles.statusPaid;
        case "PARTIAL":
          return styles.statusPartial;
        case "UNPAID":
          return styles.statusUnpaid;
        default:
          return styles.statusUnpaid;
      }
    };

    // Get shipping status badge style
    const getShippingStatusStyle = () => {
      switch (orderData.delivery?.shipping_status) {
        case "DELIVERED":
          return styles.statusDelivered;
        case "SHIPPED":
          return styles.statusShipped;
        case "RETURNED":
          return styles.statusReturned;
        case "PENDING":
          return styles.statusPending;
        default:
          return styles.statusPending;
      }
    };

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>
                  Order #{orderData.id.slice(0, 8).toUpperCase()}
                </Text>
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusBadge, getPaymentStatusStyle()]}>
                    {orderData.payment_status}
                  </Text>
                  <Text style={[styles.statusBadge, getShippingStatusStyle()]}>
                    {orderData.delivery?.shipping_status || "PENDING"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>
                {formatDate(orderData.created_at)}
              </Text>
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
              {orderData.delivery?.delivery_address ? (
                <>
                  <Text style={[styles.addressText, { fontWeight: "bold" }]}>
                    {orderData.delivery.delivery_address.first_name}{" "}
                    {orderData.delivery.delivery_address.last_name}
                  </Text>
                  {orderData.delivery.delivery_address.address && (
                    <Text style={styles.addressText}>
                      {orderData.delivery.delivery_address.address}
                    </Text>
                  )}
                  {orderData.delivery.delivery_address.city && (
                    <Text style={styles.addressText}>
                      {orderData.delivery.delivery_address.city}
                      {orderData.delivery.delivery_address.state &&
                        `, ${orderData.delivery.delivery_address.state}`}
                    </Text>
                  )}
                  {orderData.delivery.delivery_address.country && (
                    <Text style={styles.addressText}>
                      {orderData.delivery.delivery_address.country}
                    </Text>
                  )}
                  {orderData.delivery.delivery_address.phone && (
                    <Text style={styles.addressText}>
                      {orderData.delivery.delivery_address.phone}
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
                PRODUCT NAME
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
                      <Text style={styles.productName}>{product.name}</Text>
                      {discount > 0 && (
                        <Text style={styles.discountBadge}>
                          Discount: -NGN {formatCurrency(discount)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.cellUnitPrice}>
                      NGN {formatCurrency(unitPrice)}
                    </Text>
                    <Text style={styles.cellAmount}>
                      NGN {formatCurrency(lineTotal)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.tableRow}>
                <Text style={styles.cellQty}>1</Text>
                <Text style={styles.cellDescription}>Order Payment</Text>
                <Text style={styles.cellUnitPrice}>
                  NGN {formatCurrency(subtotal)}
                </Text>
                <Text style={styles.cellAmount}>
                  NGN {formatCurrency(subtotal)}
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
                  NGN {formatCurrency(subtotal)}
                </Text>
              </View>

              {shippingFee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping Fee</Text>
                  <Text style={styles.summaryValue}>
                    NGN {formatCurrency(shippingFee)}
                  </Text>
                </View>
              )}

              {tax > 0 && (
                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>
                    NGN {formatCurrency(tax)}
                  </Text>
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>
                  NGN {formatCurrency(total)}
                </Text>
              </View>
            </View>
          </View>

          {/* Note Section */}
          {orderData.description && (
            <View style={styles.noteSection}>
              <Text style={styles.noteTitle}>Note</Text>
              <Text style={styles.noteText}>{orderData.description}</Text>
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
  },
);

OrderReceiptPDF.displayName = "OrderReceiptPDF";

// Download Button Component
const DownloadOrderReceipt: React.FC<DownloadOrderReceiptProps> = ({
  orderData,
  business,
}) => {
  console.log("orderData in the receipt", orderData);
  const receiptNumber = orderData?.id?.slice(0, 8).toUpperCase() || "INVOICE";

  const dataSignature = useMemo(() => {
    if (!orderData) return "";
    return JSON.stringify({
      orderId: orderData.id,
      businessId: business?.data?.id,
      amount: orderData.total_price,
      paymentStatus: orderData.payment_status,
      productsCount: orderData.products?.length || 0,
    });
  }, [
    orderData?.id,
    orderData?.total_price,
    orderData?.payment_status,
    orderData?.products?.length,
    business?.data?.id,
  ]);

  console.log("dataSignature", dataSignature);

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
