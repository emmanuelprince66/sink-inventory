"use client";

import { useState } from "react";

const wasteItems = [
  {
    id: 1,
    item: "Expired Milk",
    category: "Dairy",
    quantity: 3,
    unit: "L",
    wasteValue: 4500,
    date: "2024-03-01",
    reason: "Expired",
  },
  {
    id: 2,
    item: "Stale Bread",
    category: "Bakery",
    quantity: 2,
    unit: "loaves",
    wasteValue: 1800,
    date: "2024-03-03",
    reason: "Spoiled",
  },
  {
    id: 3,
    item: "Rotten Tomatoes",
    category: "Produce",
    quantity: 5,
    unit: "kg",
    wasteValue: 6250,
    date: "2024-03-05",
    reason: "Overripe",
  },
  {
    id: 4,
    item: "Leftover Rice",
    category: "Grains",
    quantity: 1.5,
    unit: "kg",
    wasteValue: 1125,
    date: "2024-03-07",
    reason: "Overcooked",
  },
  {
    id: 5,
    item: "Wilted Spinach",
    category: "Produce",
    quantity: 2,
    unit: "kg",
    wasteValue: 2400,
    date: "2024-03-09",
    reason: "Wilted",
  },
  {
    id: 6,
    item: "Soured Yogurt",
    category: "Dairy",
    quantity: 4,
    unit: "cups",
    wasteValue: 3200,
    date: "2024-03-11",
    reason: "Expired",
  },
  {
    id: 7,
    item: "Burnt Chicken",
    category: "Protein",
    quantity: 1.2,
    unit: "kg",
    wasteValue: 4800,
    date: "2024-03-13",
    reason: "Prep Error",
  },
  {
    id: 8,
    item: "Moldy Cheese",
    category: "Dairy",
    quantity: 0.5,
    unit: "kg",
    wasteValue: 3500,
    date: "2024-03-15",
    reason: "Mold",
  },
  {
    id: 9,
    item: "Overripe Bananas",
    category: "Produce",
    quantity: 1,
    unit: "bunch",
    wasteValue: 900,
    date: "2024-03-17",
    reason: "Overripe",
  },
  {
    id: 10,
    item: "Stale Crackers",
    category: "Snacks",
    quantity: 2,
    unit: "packs",
    wasteValue: 1400,
    date: "2024-03-19",
    reason: "Moisture",
  },
];

const fmt = (n: any) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });
const CATEGORIES = [
  "All",
  ...Array.from(new Set(wasteItems.map((i) => i.category))),
];

const WasteHistory = () => {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<keyof (typeof wasteItems)[0]>("date");
  const [sortDir, setSortDir] = useState("desc");
  const [filterCat, setFilterCat] = useState("All");

  const totalValue = wasteItems.reduce((s, i) => s + i.wasteValue, 0);

  const filtered = wasteItems
    .filter(
      (i) =>
        (filterCat === "All" || i.category === filterCat) &&
        [i.item, i.category, i.reason].some((v) =>
          v.toLowerCase().includes(search.toLowerCase()),
        ),
    )
    .sort((a, b) => {
      let av = a[sortCol] as any,
        bv = b[sortCol] as any;
      if (typeof av === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });

  const filteredTotal = filtered.reduce((s, i) => s + i.wasteValue, 0);

  const handleSort = (col: any) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const cols = [
    { label: "#", col: null },
    { label: "Item", col: "item" },
    { label: "Category", col: "category" },
    { label: "Quantity", col: "quantity" },
    { label: "Waste Value", col: "wasteValue" },
    { label: "Date", col: "date" },
    { label: "Reason", col: "reason" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        color: "#111827",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Waste History</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            Track and review all recorded waste entries
          </p>
        </div>
        <span
          style={{
            fontSize: 12,
            color: "#9ca3af",
            background: "#f3f4f6",
            padding: "5px 12px",
            borderRadius: 20,
          }}
        >
          March 2024
        </span>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1080, margin: "0 auto" }}>
        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "18px 20px",
              borderLeft: "4px solid #16a34a",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Total Value
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
              {fmt(totalValue)}
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
              All {wasteItems.length} items combined
            </p>
          </div>

          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 10,
              padding: "18px 20px",
              borderLeft: "4px solid #15803d",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#15803d",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Value of Waste
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#14532d" }}>
              {fmt(totalValue)}
            </p>
            <p style={{ fontSize: 12, color: "#16a34a", marginTop: 3 }}>
              Entire stock recorded as waste
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "18px 20px",
              borderLeft: "4px solid #4ade80",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Items Wasted
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
              {wasteItems.length}
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
              {CATEGORIES.length - 1} categories affected
            </p>
          </div>
        </div>

        {/* Table Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {/* Controls */}
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid #f3f4f6",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <input
              className="search"
              placeholder="Search items, category, reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`pill${filterCat === c ? " active" : ""}`}
                  onClick={() => setFilterCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <span
              style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}
            >
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  {cols.map(({ label, col }) => (
                    <th
                      key={label}
                      style={{ padding: "11px 16px", textAlign: "left" }}
                    >
                      {col ? (
                        <button
                          className={`sort-btn${sortCol === col ? " active" : ""}`}
                          onClick={() => handleSort(col)}
                        >
                          {label}{" "}
                          <span style={{ fontSize: 10 }}>
                            {sortCol === col
                              ? sortDir === "asc"
                                ? "▲"
                                : "▼"
                              : "⇅"}
                          </span>
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {label}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      No items found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid #f9fafb" }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#9ca3af",
                          fontSize: 13,
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontWeight: 500,
                          fontSize: 14,
                        }}
                      >
                        {item.item}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            background: "#f0fdf4",
                            color: "#15803d",
                            fontSize: 12,
                            fontWeight: 500,
                            padding: "3px 10px",
                            borderRadius: 20,
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 14,
                          color: "#374151",
                        }}
                      >
                        {item.quantity}{" "}
                        <span style={{ color: "#9ca3af", fontSize: 12 }}>
                          {item.unit}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontWeight: 600,
                          color: "#15803d",
                          fontSize: 14,
                        }}
                      >
                        {fmt(item.wasteValue)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: "#6b7280",
                        }}
                      >
                        {new Date(item.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            background: "#f3f4f6",
                            color: "#374151",
                            fontSize: 12,
                            padding: "3px 10px",
                            borderRadius: 6,
                          }}
                        >
                          {item.reason}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid #f3f4f6",
              background: "#f9fafb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Showing {filtered.length} of {wasteItems.length} entries
            </span>
            <span style={{ fontSize: 13, color: "#374151" }}>
              Total:{" "}
              <strong style={{ color: "#15803d" }}>{fmt(filteredTotal)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteHistory;
