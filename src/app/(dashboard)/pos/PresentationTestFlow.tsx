import { useState } from "react";
import { dummyInventoryData } from "../inventory/dummyInventory";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  status: string;
  type: string;
  selling_price: number;
  image: string;
  department: string;
  category: string;
  variations: any[];
}

interface CartItem extends Product {
  cartQty: number;
}

const pharmacyProducts = dummyInventoryData.filter(
  (p) => p.department === "Pharmacy",
);

const formatToNaira = (amount: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

const generatePreSaleCode = (cartItems: CartItem[]): string => {
  const ids = cartItems.map((item) => `${item.id}:${item.cartQty}`).join("|");
  const encoded = btoa(ids);
  const prefix = "PSL";
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${timestamp}-${encoded}`;
};

const decodePreSaleCode = (code: string): CartItem[] | null => {
  try {
    const parts = code.split("-");
    if (parts.length < 3 || parts[0] !== "PSL") return null;
    const encoded = parts.slice(2).join("-");
    const decoded = atob(encoded);
    const entries = decoded.split("|");
    const items: CartItem[] = [];
    for (const entry of entries) {
      const [id, qty] = entry.split(":");
      const product = pharmacyProducts.find((p) => p.id === id);
      if (product) items.push({ ...product, cartQty: parseInt(qty) });
    }
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
};

const statusStyle: Record<string, { bg: string; color: string; dot: string }> =
  {
    "IN-STOCK": { bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
    LOW: { bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
    "OUT-OF-STOCK": { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  };

// ─── Tab: Pre-load (Pharmacist creates pre-sale) ──────────────────────────────
function PreloadTab() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.id === product.id ? { ...i, cartQty: i.cartQty + 1 } : i,
        );
      return [...prev, { ...product, cartQty: 1 }];
    });
    setGeneratedCode(null);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
    setGeneratedCode(null);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, cartQty: Math.max(1, i.cartQty + delta) } : i,
      ),
    );
    setGeneratedCode(null);
  };

  const totalPrice = cart.reduce(
    (sum, i) => sum + i.selling_price * i.cartQty,
    0,
  );

  const handleCreatePreSale = () => {
    const code = generatePreSaleCode(cart);
    setGeneratedCode(code);
  };

  const handleCopy = async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement("textarea");
      textArea.value = generatedCode;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        height: "100%",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Products Grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#6b7280",
              textTransform: "uppercase",
            }}
          >
            Pharmacy · {pharmacyProducts.length} Products
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          {pharmacyProducts.map((product) => {
            const oos = product.status === "OUT-OF-STOCK";
            const s = statusStyle[product.status] || statusStyle["IN-STOCK"];
            const inCart = cart.find((i) => i.id === product.id);
            return (
              <div
                key={product.id}
                onClick={() => !oos && addToCart(product)}
                style={{
                  border: inCart ? "2px solid #16a34a" : "1.5px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  cursor: oos ? "not-allowed" : "pointer",
                  opacity: oos ? 0.45 : 1,
                  background: inCart ? "#f0fdf4" : "#fff",
                  transition: "all 0.18s ease",
                  position: "relative",
                }}
              >
                {inCart && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "#16a34a",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {inCart.cartQty}
                  </div>
                )}
                <div
                  style={{
                    height: 72,
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 10,
                    background: "#f3f4f6",
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 4,
                    lineHeight: 1.3,
                  }}
                >
                  {product.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#16a34a",
                    marginBottom: 6,
                  }}
                >
                  {formatToNaira(product.selling_price)}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: s.bg,
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: s.dot,
                    }}
                  />
                  <span
                    style={{ fontSize: 10, fontWeight: 600, color: s.color }}
                  >
                    {product.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Panel */}
      <div
        style={{
          width: 300,
          display: "flex",
          flexDirection: "column",
          background: "#f9fafb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 16px 12px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            Cart ({cart.length} items)
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {cart.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 13,
                marginTop: 40,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
              Click products to add them
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#111827",
                        flex: 1,
                        marginRight: 8,
                      }}
                    >
                      {item.name}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#ef4444",
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        border: "1px solid #d1fae5",
                        borderRadius: 8,
                        padding: "2px 6px",
                        background: "#f0fdf4",
                      }}
                    >
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          color: "#16a34a",
                          fontSize: 16,
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#111827",
                          minWidth: 20,
                          textAlign: "center",
                        }}
                      >
                        {item.cartQty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          color: "#16a34a",
                          fontSize: 16,
                        }}
                      >
                        +
                      </button>
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      {formatToNaira(item.selling_price * item.cartQty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div
            style={{
              padding: "12px 16px 20px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 13, color: "#6b7280" }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
                {formatToNaira(totalPrice)}
              </span>
            </div>
            <button
              onClick={handleCreatePreSale}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(22,163,74,0.35)",
                transition: "opacity 0.15s",
              }}
            >
              🔖 Create Pre-Sale
            </button>

            {/* Generated Code Card */}
            {generatedCode && (
              <div
                style={{
                  marginTop: 14,
                  background: "#fff",
                  border: "1.5px solid #bbf7d0",
                  borderRadius: 12,
                  padding: 16,
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#22c55e",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#16a34a",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Pre-Sale Code Generated
                  </span>
                </div>
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px dashed #86efac",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#14532d",
                    wordBreak: "break-all",
                    lineHeight: 1.5,
                    marginBottom: 10,
                  }}
                >
                  {generatedCode}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  <span>
                    {cart.length} product{cart.length > 1 ? "s" : ""}
                  </span>
                  <span>{formatToNaira(totalPrice)}</span>
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    width: "100%",
                    padding: "8px 0",
                    borderRadius: 8,
                    border: "1.5px solid #86efac",
                    background: copied ? "#dcfce7" : "#fff",
                    color: copied ? "#16a34a" : "#374151",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? "✓ Copied!" : "📋 Copy Code"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Load Code (Cashier loads pre-sale) ──────────────────────────────────
function LoadCodeTab() {
  const [inputCode, setInputCode] = useState("");
  const [loadedItems, setLoadedItems] = useState<CartItem[] | null>(null);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  const handleLoad = () => {
    setChecked(true);
    setCheckedOut(false);
    const items = decodePreSaleCode(inputCode.trim());
    if (items) {
      setLoadedItems(items);
      setError("");
    } else {
      setLoadedItems(null);
      setError(
        "Invalid or unrecognized pre-sale code. Please check and try again.",
      );
    }
  };

  const totalPrice = loadedItems
    ? loadedItems.reduce((s, i) => s + i.selling_price * i.cartQty, 0)
    : 0;

  return (
    <div style={{ padding: 28, maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 8,
          }}
        >
          Enter Pre-Sale Code
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              setChecked(false);
              setLoadedItems(null);
              setError("");
              setCheckedOut(false);
            }}
            placeholder="PSL-XXXXXXXX-..."
            style={{
              flex: 1,
              padding: "11px 14px",
              border: "1.5px solid #d1d5db",
              borderRadius: 10,
              fontSize: 13,
              fontFamily: "monospace",
              outline: "none",
              color: "#111827",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#16a34a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
          />
          <button
            onClick={handleLoad}
            disabled={!inputCode.trim()}
            style={{
              padding: "11px 20px",
              borderRadius: 10,
              border: "none",
              background: inputCode.trim()
                ? "linear-gradient(135deg, #16a34a, #15803d)"
                : "#e5e7eb",
              color: inputCode.trim() ? "#fff" : "#9ca3af",
              fontSize: 13,
              fontWeight: 700,
              cursor: inputCode.trim() ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            Load Products →
          </button>
        </div>
        {error && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#dc2626",
              fontSize: 12,
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </div>

      {loadedItems && !checkedOut && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#16a34a",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {loadedItems.length} Product{loadedItems.length > 1 ? "s" : ""}{" "}
              Loaded
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {loadedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "#fff",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "12px 16px",
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    {item.category} · SKU: {item.sku}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}
                  >
                    {formatToNaira(item.selling_price * item.cartQty)}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    Qty: {item.cartQty} × {formatToNaira(item.selling_price)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
              Order Total
            </span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#16a34a" }}>
              {formatToNaira(totalPrice)}
            </span>
          </div>

          <button
            onClick={() => setCheckedOut(true)}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(22,163,74,0.4)",
              letterSpacing: "0.02em",
            }}
          >
            Proceed to Checkout →
          </button>
        </div>
      )}

      {checkedOut && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Checkout Successful!
          </div>
          <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
            {loadedItems!.length} item{loadedItems!.length > 1 ? "s" : ""} ·{" "}
            {formatToNaira(totalPrice)}
          </div>
          <button
            onClick={() => {
              setInputCode("");
              setLoadedItems(null);
              setChecked(false);
              setCheckedOut(false);
            }}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "1.5px solid #16a34a",
              background: "#fff",
              color: "#16a34a",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            New Transaction
          </button>
        </div>
      )}

      {!checked && !loadedItems && (
        <div style={{ textAlign: "center", color: "#d1d5db", marginTop: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 13 }}>
            Enter a pre-sale code above to load products
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const PresentationTestFlow = () => {
  const [activeTab, setActiveTab] = useState<"preload" | "loadcode">("preload");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', sans-serif",
          background: "#f8fafc",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 56,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 16 }}>💊</span>
            </div>
            <div>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
                PharmPOS
              </span>
              <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8 }}>
                Pharmacy Department
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 20,
              padding: "4px 12px",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#22c55e",
                animation: "pulse 2s infinite",
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>
              System Online
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            padding: "0 24px",
            display: "flex",
            gap: 0,
          }}
        >
          {[
            {
              key: "preload" as const,
              label: "📦 Pre-load Items",
              desc: "Build pre-sale order",
            },
            {
              key: "loadcode" as const,
              label: "🔑 Load Code",
              desc: "Cashier checkout",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "14px 20px",
                border: "none",
                background: "none",
                cursor: "pointer",
                borderBottom:
                  activeTab === tab.key
                    ? "2.5px solid #16a34a"
                    : "2.5px solid transparent",
                color: activeTab === tab.key ? "#16a34a" : "#6b7280",
                fontSize: 13,
                fontWeight: activeTab === tab.key ? 700 : 500,
                transition: "all 0.15s",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 400,
                  color: activeTab === tab.key ? "#86efac" : "#d1d5db",
                }}
              >
                {tab.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {activeTab === "preload" ? (
            <PreloadTab />
          ) : (
            <div style={{ overflowY: "auto", flex: 1 }}>
              <LoadCodeTab />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PresentationTestFlow;
