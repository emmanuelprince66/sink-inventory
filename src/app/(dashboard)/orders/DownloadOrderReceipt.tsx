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
  shipping_address?: string;
  city: string;
  state: string;
  country: string;
  zip_code: string | null;
}

interface PaymentHistory {
  amount: string;
  method: string;
  bank: string | null;
  account_name?: string | null;
  account_number?: string | null;
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

// Number-to-words helper (Nigeria-friendly Naira suffix)
const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const belowThousand = (n: number): string => {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100)
    return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  const remainder = n % 100;
  return (
    ONES[Math.floor(n / 100)] +
    " Hundred" +
    (remainder ? " And " + belowThousand(remainder) : "")
  );
};
const numberToNairaWords = (num: number): string => {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return "Zero Naira Only";
  const parts: string[] = [];
  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const remainder = n % 1000;
  if (billions) parts.push(belowThousand(billions) + " Billion");
  if (millions) parts.push(belowThousand(millions) + " Million");
  if (thousands) parts.push(belowThousand(thousands) + " Thousand");
  if (remainder) parts.push(belowThousand(remainder));
  return parts.join(" ") + " Naira Only";
};

// Black & white invoice styles
const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
    color: "#111111",
  },

  // Header bar (solid black, rounded)
  headerBar: {
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1.5,
  },
  invoiceNumber: {
    fontSize: 9,
    color: "#cccccc",
    marginTop: 4,
  },
  issueDateLabel: {
    fontSize: 8,
    color: "#cccccc",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "right",
  },
  issueDateValue: {
    fontSize: 10,
    color: "#ffffff",
    marginTop: 3,
    textAlign: "right",
  },

  // Business identity row
  businessBlock: {
    marginBottom: 18,
  },
  businessLogoPlaceholder: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 6,
  },
  businessText: {
    fontSize: 9,
    color: "#444444",
    lineHeight: 1.5,
  },

  // Bill To / Pay To
  addressRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  addressCard: {
    flex: 1,
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
    padding: 12,
  },
  addressTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 6,
  },
  addressLine: {
    fontSize: 9,
    color: "#333333",
    lineHeight: 1.6,
  },

  // Items table
  table: {
    width: "100%",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#555555",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  colDescription: {
    width: "55%",
    fontSize: 9,
    color: "#111111",
    paddingRight: 8,
  },
  colQuantity: {
    width: "10%",
    fontSize: 9,
    color: "#111111",
    textAlign: "center",
  },
  colUnitPrice: {
    width: "17%",
    fontSize: 9,
    color: "#111111",
    textAlign: "right",
  },
  colLineTotal: {
    width: "18%",
    fontSize: 9,
    color: "#111111",
    textAlign: "right",
    fontWeight: "bold",
  },

  // Totals (right-aligned)
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  totalsBox: {
    width: "55%",
  },
  totalsLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 9,
    color: "#555555",
  },
  totalsValue: {
    fontSize: 9,
    color: "#111111",
  },
  totalsValueDiscount: {
    fontSize: 9,
    color: "#666666",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#000000",
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000000",
  },

  // Amount in words callout
  amountWordsBox: {
    marginTop: 22,
    backgroundColor: "#f4f4f5",
    borderLeftWidth: 4,
    borderLeftColor: "#000000",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  amountWordsLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 3,
  },
  amountWordsText: {
    fontSize: 9,
    color: "#444444",
  },

  // Note section
  noteSection: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  noteTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 9,
    color: "#444444",
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    marginTop: 28,
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  footerBrand: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  footerText: {
    fontSize: 8,
    color: "#888888",
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
    const businessData = business?.data || business || {};

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
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
    const tax = 0;
    const total = safeParseFloat(orderData.total_price);
    const totalDiscount = (orderData.products || []).reduce(
      (sum, p) => sum + safeParseFloat(p.discount),
      0,
    );

    // Pay To details — prefer payment_history, fall back to business bank info.
    const firstPayment = orderData.payment_history?.[0];
    const payToBank: string =
      firstPayment?.bank ||
      businessData?.bank_name ||
      businessData?.bank ||
      "";
    const payToAccountName: string =
      firstPayment?.account_name ||
      businessData?.account_name ||
      businessData?.name ||
      "";
    const payToAccountNumber: string =
      firstPayment?.account_number || businessData?.account_number || "";
    const paymentMethod: string =
      orderData.method || firstPayment?.method || "—";

    const businessAddressParts = [
      businessData?.street,
      businessData?.city,
      businessData?.state,
      businessData?.country,
    ].filter(Boolean);

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header bar */}
          <View style={styles.headerBar}>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>
                #{orderData.id?.slice(0, 8).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.issueDateLabel}>Issue Date</Text>
              <Text style={styles.issueDateValue}>
                {formatDate(orderData.created_at)}
              </Text>
            </View>
          </View>

          {/* Business identity */}
          <View style={styles.businessBlock}>
            {businessData?.name && (
              <Text style={styles.businessLogoPlaceholder}>
                {businessData.name}
              </Text>
            )}
            {businessAddressParts.length > 0 && (
              <Text style={styles.businessText}>
                {businessAddressParts.join(", ")}
              </Text>
            )}
            {businessData?.owner?.phone && (
              <Text style={styles.businessText}>
                {businessData.owner.phone}
              </Text>
            )}
          </View>

          {/* Bill To + Pay To */}
          <View style={styles.addressRow}>
            <View style={styles.addressCard}>
              <Text style={styles.addressTitle}>Bill To</Text>
              <Text style={styles.addressLine}>
                {orderData.customer_info?.name || "—"}
              </Text>
              {orderData.customer_info?.phone && (
                <Text style={styles.addressLine}>
                  {orderData.customer_info.phone}
                </Text>
              )}
              {orderData.customer_info?.email && (
                <Text style={styles.addressLine}>
                  {orderData.customer_info.email}
                </Text>
              )}
            </View>

            <View style={styles.addressCard}>
              <Text style={styles.addressTitle}>Pay To</Text>
              {payToBank ? (
                <>
                  <Text style={styles.addressLine}>Bank: {payToBank}</Text>
                  {payToAccountName ? (
                    <Text style={styles.addressLine}>
                      Account Name: {payToAccountName}
                    </Text>
                  ) : null}
                  {payToAccountNumber ? (
                    <Text style={styles.addressLine}>
                      Account: {payToAccountNumber}
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.addressLine}>
                  Payment Method: {paymentMethod}
                </Text>
              )}
            </View>
          </View>

          {/* Items table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colDescription]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderText, styles.colQuantity]}>
                Quantity
              </Text>
              <Text style={[styles.tableHeaderText, styles.colUnitPrice]}>
                Unit Price
              </Text>
              <Text style={[styles.tableHeaderText, styles.colLineTotal]}>
                Total
              </Text>
            </View>

            {orderData.products && orderData.products.length > 0 ? (
              orderData.products.map((product, index) => {
                const unitPrice = safeParseFloat(product.unit_price);
                const quantity = safeParseFloat(product.quantity);
                const price = safeParseFloat(product.price);
                const lineTotal = price * quantity;
                return (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.colDescription}>{product.name}</Text>
                    <Text style={styles.colQuantity}>{quantity}</Text>
                    <Text style={styles.colUnitPrice}>
                      NGN {formatCurrency(unitPrice)}
                    </Text>
                    <Text style={styles.colLineTotal}>
                      NGN {formatCurrency(lineTotal)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.tableRow}>
                <Text style={styles.colDescription}>Order Payment</Text>
                <Text style={styles.colQuantity}>1</Text>
                <Text style={styles.colUnitPrice}>
                  NGN {formatCurrency(subtotal)}
                </Text>
                <Text style={styles.colLineTotal}>
                  NGN {formatCurrency(subtotal)}
                </Text>
              </View>
            )}
          </View>

          {/* Totals — right-aligned */}
          <View style={styles.totalsRow}>
            <View style={styles.totalsBox}>
              <View style={styles.totalsLine}>
                <Text style={styles.totalsLabel}>Subtotal:</Text>
                <Text style={styles.totalsValue}>
                  NGN {formatCurrency(subtotal)}
                </Text>
              </View>

              {totalDiscount > 0 && (
                <View style={styles.totalsLine}>
                  <Text style={styles.totalsLabel}>Discount:</Text>
                  <Text style={styles.totalsValueDiscount}>
                    - NGN {formatCurrency(totalDiscount)}
                  </Text>
                </View>
              )}

              {shippingFee > 0 && (
                <View style={styles.totalsLine}>
                  <Text style={styles.totalsLabel}>Shipping:</Text>
                  <Text style={styles.totalsValue}>
                    NGN {formatCurrency(shippingFee)}
                  </Text>
                </View>
              )}

              {tax > 0 && (
                <View style={styles.totalsLine}>
                  <Text style={styles.totalsLabel}>Tax:</Text>
                  <Text style={styles.totalsValue}>
                    NGN {formatCurrency(tax)}
                  </Text>
                </View>
              )}

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total:</Text>
                <Text style={styles.grandTotalValue}>
                  NGN {formatCurrency(total)}
                </Text>
              </View>
            </View>
          </View>

          {/* Amount in words */}
          <View style={styles.amountWordsBox}>
            <Text style={styles.amountWordsLabel}>Amount in words:</Text>
            <Text style={styles.amountWordsText}>
              {numberToNairaWords(total)}
            </Text>
          </View>

          {/* Note */}
          {orderData.description ? (
            <View style={styles.noteSection}>
              <Text style={styles.noteTitle}>Note</Text>
              <Text style={styles.noteText}>{orderData.description}</Text>
            </View>
          ) : null}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerBrand}>Sync360</Text>
            <Text style={styles.footerText}>
              Powered by www.sync360.africa
            </Text>
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
            className="flex items-center cursor-pointer space-x-2 px-3 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
