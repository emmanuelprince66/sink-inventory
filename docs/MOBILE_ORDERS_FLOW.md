# Orders Flow — Mobile Implementation Spec

This document covers the **orders** surfaces the mobile app needs to mirror. The web app implements all of these — the mobile flow should match the screens in behaviour, terminology, validation rules, and API contract.

The surfaces are: **Orders list**, **Create Order**, **Order details**, **Delivery / Logistics integration**, and **Invoice / Receipt download**.

Reference files in the web codebase:

| Section | Web file |
|---|---|
| Orders list | `sink/src/app/(dashboard)/orders/Orders.tsx` |
| Order card (list item) | `sink/src/app/(dashboard)/orders/OrderCard.tsx` |
| Assign Delivery modal | `sink/src/app/(dashboard)/orders/AssignDeliveryModal.tsx` |
| Order details | `sink/src/app/(dashboard)/orders/[id]/ViewOrder.tsx` |
| Delivery flow timeline | `sink/src/app/(dashboard)/orders/[id]/OrderFlowTimeline.tsx` |
| Update payment status | `sink/src/app/(dashboard)/orders/[id]/UpdateStatus.tsx` |
| Create order | `sink/src/app/(dashboard)/orders/create/CreateOrders.tsx` |
| Product picker drawer | `sink/src/app/(dashboard)/orders/create/ProductDrawer.tsx` |
| Shipping method drawer | `sink/src/app/(dashboard)/orders/create/ShippingDrawer.tsx` |
| Invoice / receipt PDF | `sink/src/app/(dashboard)/orders/DownloadOrderReceipt.tsx` |
| Hook (data + handlers) | `sink/src/hooks/useOrdersHook.tsx` |
| Order type definitions | `sink/src/app/(dashboard)/orders/type.ts` |

---

## 0. Cross-cutting notes (read first)

- All requests use the merchant's **access token** (bearer header on mobile).
- All requests are scoped to a `business_id` (same value used everywhere else in the app).
- The merchant store is reachable to customers via two URL flavours:
  - **In-store** (`/i/{slug}`) — staff-facing checkout (orders raised over the counter).
  - **Out-store** (`/o/{slug}`) — customer-facing online checkout.
- Two enums drive the UI:
  - **`payment_status`** — `PAID` | `PARTIAL` | `UNPAID`.
  - **`shipping_status`** — `PENDING` | `SHIPPED` | `DELIVERED` | `RETURNED`.
- Currency is NGN (`₦`). Always format with the existing money formatter.
- Pagination shape on the list endpoint (matches `data.ts` patterns elsewhere):
  ```json
  {
    "data": {
      "limit": 20,
      "total": 15,
      "pages": 1,
      "links": { "next": null, "previous": null },
      "results": {
        "total_orders": 15,
        "completed_orders": 3,
        "total_revenue": 42936,
        "paid_orders": 5,
        "data": [ /* OrderInfo[] */ ]
      }
    },
    "success": true,
    "message": "Orders data fetched successfully"
  }
  ```

### Order object shape (canonical — used by list + detail)

```ts
interface OrderInfo {
  id: string;
  type: "INSTORE" | "OUTSTORE";       // order channel kind
  channel: string;                     // free-text channel label (e.g. "STORE", "WHATSAPP")
  created_at: string;                  // ISO datetime
  created_by: string;
  last_updated_by?: string;
  note: string | null;

  customer_info: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };

  products: Array<{
    id: string;
    name: string;
    unit_price: string;                // decimal as string
    quantity: string;                  // decimal as string
    discount: string;                  // per-unit discount
    price: string;                     // resolved unit price (with variation/discount)
    image?: string;
    variations?: any[];                // present when product has variations
  }>;

  amount: string;                      // total
  amount_paid: string;
  tax: string;
  shipping_fee: string;
  total_price: string;
  payment_method: string;              // "CASH" | "BANK" | etc.
  payment_status: "PAID" | "PARTIAL" | "UNPAID";
  payment_history: Array<{
    amount: string;
    method: string;
    bank: string | null;
    account_name?: string | null;
    account_number?: string | null;
    created_at: string;
  }>;

  shipping_status: "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED";
  shipping_date: string;

  delivery?: {
    shipping_status: "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED";
    shipping_fee: number;
    delivery_address?: {
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
    };
  };
}
```

---

## 1. Orders list screen

**Purpose:** primary screen for browsing every order the merchant has received.

### Layout (top → bottom)

1. **Page title**: "Invoices and Orders"
2. **Header actions row** (right side):
   - **Date range picker** (Today / This Week / This Month + custom range).
   - **Create Order** button → opens the Create Order screen (Section 5).
   - **Create Shipping** button → routes to the same Create Order screen (the form serves both flows).
3. **Stats cards row** — 1 → 2 → 4/5 cols. The set switches based on the active top tab.
4. **Top tab strip** — `Instore order` and `Out-store Orders` (count pill on each).
5. **Status sub-tab strip** (under the top tabs, scrollable on phone). UI-only filter — see Section 1.4 for backend wiring intent.
6. **Quick date preset chips** (Today / This Week / This Month).
7. **Search bar** (customer name / order id). Disabled until ≥ 3 characters.
8. **Filter button** (opens Filter modal).
9. **Active filter chips** (when any filter is set).
10. **Order card grid** — responsive `1 → 2 → 3` cols.
11. **Custom pagination** (the same numbered `[1] 2 3 … 12` style used elsewhere).

### 1.1 Top tabs (Order Type)

| Tab label | Sends as `order_type` | Stats card set |
|---|---|---|
| `Instore order` | `INSTORE` | Total Orders / Paid / Unpaid / Total Revenue / Completed Orders |
| `Out-store Orders` | `OUTSTORE` | Total Orders / Completed / Total Revenue / Delivery Cost / Total Link Visits |

When the user switches tabs, **reset** the status sub-tab back to "All", the search input, and the page number to 1.

### 1.2 Status sub-tabs (per spec)

The status sub-tabs are dynamic per top tab:

| In-Store sub-tabs | Out-Store sub-tabs |
|---|---|
| All / Pending / Processing / Out for Delivery / Completed / Cancelled | All / Pending / Processing / Out for Delivery / Delivered / Cancelled |

> Currently the web treats the sub-tabs as a **client-side visual filter** until the backend exposes a richer `order_status` field. When the backend ships the sub-status enum, send the selected key (e.g. `PROCESSING`, `OUT_FOR_DELIVERY`, `CANCELLED`) as a query param and stop the client-side gating. Until then, only the parent `shipping_status` is honored by the API.

### 1.3 Filters

Filter modal collects:

| Field | Type | Sent as | Wired today |
|---|---|---|---|
| Shipping Status | `PENDING` / `SHIPPED` / `DELIVERED` / `RETURNED` | `shipping_status` | ✅ |
| Payment Status | `PAID` / `PARTIAL` / `UNPAID` | `payment_status` | ✅ |
| Sales Staff | string (mock list today) | `sales_staff` | ❌ UI only |
| Delivery Company | string (mock list today) | `delivery_company` | ❌ UI only |
| Date range | `{ from, to }` | `start_date` + `end_date` | ✅ via picker |

The Apply / Reset pattern is the same as the rest of the app:
- "Apply" closes the modal, copies the temp filters into the live filters, and refetches with page reset to 1.
- "Reset" clears temp + live filters but keeps the current order type tab.

### 1.4 Order card (mobile-friendly)

Replaces the old desktop table — the same component is used in the grid. Each card shows:

- Order number (`#XXXXXXXX` — first 8 chars of `order.id` upper-cased)
- Payment status pill + (out-store) shipping status pill
- Customer name + phone (with `Phone` icon)
- Amount (right-aligned) + created-at date
- **Out-store only**: partner block (logo + name + rating) and rider block (name + phone) — see Section 6.
- Action row:
  - `Assign` button (out-store only) — opens the AssignDeliveryModal (Section 6.2).
  - `View More` button — navigates to the Order details screen.

### 1.5 Endpoints

- **Fetch list:** `GET /orders/business/{business_id}/?page={page}&search={q}&order_type={INSTORE|OUTSTORE}&shipping_status={...}&payment_status={...}&start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}`
  - Empty filter values should be omitted (don't send `shipping_status=`).

---

## 2. Stats cards

The card set switches per top tab (Section 1.1). Use the existing API response fields:

| Card | Field | Notes |
|---|---|---|
| Total Orders / Total Invoice | `results.total_orders` | Both tabs |
| Completed Orders | `results.completed_orders` | Both tabs |
| Total Revenue | `results.total_revenue` | Both tabs, formatted as `₦` |
| Paid | `results.paid_orders` | In-Store only |
| Unpaid | `total_orders - paid_orders` | In-Store only |
| Total Link Visits | `Math.floor(total_orders * 2.6)` | Placeholder — replace with real metric |
| Delivery Cost | sum of `shipping_fee` across visible orders | Out-Store only, placeholder |

Each card has a small `+X% vs last 7 days` comparison line — placeholder for now until the backend exposes period-over-period deltas.

---

## 3. Create Order screen

**Purpose:** raise a new order (in-store sale or out-store shipment) on behalf of a customer.

### Layout (top → bottom)

1. **Back arrow + title** — "Order Details".
2. **Customer + Shipping Date** (2-col on tablet, stacked on phone).
3. **Sales Channel** select (full width).
4. **Products** section:
   - Tappable card opens the Product Drawer.
   - Each selected product gets a card with image, name, "Has Variations" pill (if applicable), variation dropdown, quantity input, discount banner, and a red trash button.
   - **Variation selection is required** before quantity is enabled.
5. **Bill Summary** (inside the products container — only shown when at least one product is selected):
   - Subtotal
   - Total Discount (green text when > 0)
   - Tax (inline tax input + remove button)
   - Shipping (inline `+` to open Shipping Drawer; `-` to clear)
   - **Delivery Partner row** — see Section 6.3 (UI-only, partner picker is the AssignDeliveryModal)
   - **Total**
   - **Logistics sub-card** (visible once a partner is assigned) — partner logo, name, service type, contact, ETA, rating, est. cost. Sits below the Total.
6. **Payment Status tabs** — `Paid` / `Unpaid` / `Partially Paid`.
   - **Paid**: Payment Method select (`CASH` / `BANK`) + Bank select (when method = BANK) + Notes.
   - **Partial**: Total amount banner + Amount Paid input + Payment Method + Bank + Notes. Validation: `amount_paid < total`.
   - **Unpaid**: Notes only.
7. **Quantity error banner** when any product exceeds available stock.
8. **Submit button** — "Create Order".

### Drawers

- **Customer Drawer** — picks a customer (re-used from the POS flow).
- **Product Drawer** — paginated product list with search; multi-select. Each selected product is initialised with `quantity: 1`.
- **Shipping Drawer** — lists existing shipping methods from `GET /shipping/?business_id=…`. Tap one to set `shipping_fee` and store the chosen method.

### Payload (POST)

The web hook builds this on submit (via `useOrdersHook.onSubmit`):

```ts
{
  business_id,
  customer_id: customer.id,
  channel: selectedSalesChannel,        // string
  shipping_date: ISO datetime,
  products: selectedProducts.map(...),   // each item incl. id, quantity, selected variation_id, applied discount
  shipping_fee,
  tax,
  payment_status: "PAID" | "PARTIAL" | "UNPAID",
  payment_method?: "CASH" | "BANK",
  bank_id?: string,                      // when payment_method === "BANK"
  amount_paid?: number,                  // when payment_status === "PARTIAL"
  note: string
}
```

> The **delivery partner** the merchant selects via the AssignDeliveryModal is currently UI-only — it is not appended to this POST. Wire it up under `delivery_partner_id` once the backend endpoint accepts it.

### Endpoints

- **Create:** `POST /orders/business/{business_id}/` (multipart or JSON — match the existing payload shape).
- **Inventory for picker:** `GET /product/business/{business_id}/?page={page}&search={q}` (re-used from POS).
- **Customers for picker:** `GET /customer/business/{business_id}/?page={page}&search={q}` (re-used from POS).
- **Shipping methods:** `GET /shipping/?business_id={business_id}`.
- **Banks list:** `GET /bank/business/{business_id}/` (for the Paid / Partial flows).

---

## 4. Order details screen

**Purpose:** drill into a single order — see line items, payments, delivery flow, and operate on it.

### Layout (two columns on tablet, stacked on phone)

**Top action bar** (above the columns):
- Mark as Processing — UI-only today (backend status TBD)
- Assign Delivery (Section 6.2)
- Generate Invoice (Section 7) — actually the same as Download Invoice
- Print Receipt — `window.print()` on web; on mobile show a native share-to-print
- Contact Customer — opens `tel:` link
- Cancel Order — opens a confirmation sheet; UI-only

**Left column (main)**
- **Order Info card** — order number + created date + payment/shipping pills, channel, order type, customer info, contact details, Created by / Last edited by, optional Notes.
- **Products card** — line items table with #, name, unit price, quantity, discount, total.
- **Delivery Flow Timeline** — see Section 6.4. Steps: `Order Placed → Rider Assigned → Picked Up → Out for Delivery → Delivered`. Current step is derived from `shipping_status`.
- **Payment Information card** — list of `payment_history` entries (method, bank, amount, created_at).

**Right column (sidebar on tablet, stacked below on phone)**
- **Payment Summary card** — amount / discount / shipping / tax / total. Includes the Download Invoice button.
- **Payment Status card** — pill + `Update Status` link (opens the UpdateStatus sheet — Section 4.2).
- **Shipping card** — shipping status pill, shipping date, customer name + phone, delivery address, location (city/state/country), and a **status update row** with 4 toggle buttons (Pending / Shipped / Delivered / Returned — `Shipped` only shown for out-store).
- **Delivery Company card** (out-store only when a partner is assigned) — logo, name, service type, contact, support email, rating, estimated cost.
- **Rider Information card** (out-store only) — name, plate number, phone (tap to call), ETA.

### 4.1 Endpoints

- **Fetch one:** `GET /orders/business/{business_id}/{order_id}/`
- **Update shipping status:** `PATCH /orders/business/{business_id}/{order_id}/` with body `{ shipping_status: "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED" }`
- **Update payment status:** `PATCH /orders/business/{business_id}/{order_id}/` with body `{ payment_status, amount_paid?, payment_method? }`
- **Cancel:** Currently UI-only. When the backend ships the cancel route, expect `PATCH …/` with `{ shipping_status: "CANCELLED" }` or a dedicated `POST …/cancel/`.

### 4.2 Update Status sheet

A small form for moving payment status forward:
- Current status badge at the top.
- For `PAID → ✓` (already settled) — no inputs.
- For `UNPAID → PAID` — full amount auto-filled, choose method + bank.
- For `UNPAID → PARTIAL` — `amount_paid` input (< total), choose method + bank.
- For `PARTIAL → PAID` — remaining balance auto-filled, choose method + bank.

---

## 5. Order status flows

### 5.1 Payment status

```
UNPAID ──(record partial)──► PARTIAL ──(top up to total)──► PAID
   │                            │
   └────(record full payment)───┴────► PAID
```

### 5.2 Shipping status (Out-Store)

```
PENDING ──► SHIPPED ──► DELIVERED
   │
   └──► RETURNED
```

In-Store orders skip `SHIPPED` and go straight to `DELIVERED` (effectively "Completed").

### 5.3 Order-to-Logistics mapping (UX label vs backend value)

| UX label (sub-tab) | Backend `shipping_status` | Notes |
|---|---|---|
| Pending | `PENDING` | Awaiting prep |
| Processing | *(not yet a backend value)* | UI-only client filter |
| Out for Delivery | `SHIPPED` | Closest existing value |
| Completed (In-Store) | `DELIVERED` | Order picked up in store |
| Delivered (Out-Store) | `DELIVERED` | Customer received |
| Cancelled | *(not yet a backend value)* | UI-only client filter |

---

## 6. Delivery / Logistics integration

### 6.1 Mock partners (UI catalog used today)

These five entries live in `AssignDeliveryModal.tsx` and are also reused by the Logistics dashboard, the Order details Delivery Company card, and the Order list rider chip. When the backend ships a partner endpoint, swap this constant for an API call. Each partner has:

```ts
{
  id: string;
  name: string;
  logo: string;        // short text mark (e.g. "DHL")
  serviceType: string; // e.g. "Multi-carrier aggregator"
  contact: string;     // phone
  support: string;     // support email
  rating: number;      // 0–5
  estimatedCost: number;
  eta: string;         // human label, e.g. "Same day"
}
```

### 6.2 Assign Delivery modal flow

1. User taps **Assign Delivery** (from the Order list card or Order details action bar).
2. Modal opens — scrollable list of partner cards (radio behaviour, one selectable at a time).
3. Tapping a partner highlights it (blue border + bg).
4. **Confirm Assignment** runs a simulated 600 ms round-trip, then:
   - Stores the partner locally on the order (UI-only today).
   - Closes the modal.
5. When wired to a real endpoint: `POST /orders/business/{business_id}/{order_id}/assign-delivery/` with `{ partner_id: string }`. Spec also says the order's `shipping_status` should auto-flip to `SHIPPED` on success.

### 6.3 Assign Delivery from Create Order

The Create Order screen also exposes a Delivery Partner row inside the Bill Summary:

- "Assign Delivery" button opens the same modal.
- Selecting a partner shows their name with Change / Remove controls.
- Below the Total, a **Logistics sub-card** renders the picked partner (logo, name, service type, contact, ETA, rating, est. cost).
- The partner's `estimatedCost` is **not added to the order total today** — there is a small italic note explaining this. Wire it up once the backend's `delivery_calculate_price` endpoint ships.

### 6.4 Delivery flow timeline

A 5-step vertical timeline rendered on the Order details screen:

| # | Step | Backend trigger | Displayed timestamp |
|---|---|---|---|
| 0 | Order Placed | order created | `order.created_at` |
| 1 | Rider Assigned | partner assigned via Assign Delivery | partner-assign event |
| 2 | Picked Up | rider scans / marks pickup | pickup event |
| 3 | Out for Delivery | rider en-route | `shipping_status === "SHIPPED"` |
| 4 | Delivered | customer receives | `shipping_status === "DELIVERED"` |

The current step is derived from `shipping_status` using this map (see `OrderFlowTimeline.tsx:stepIndexFromShipping`):

| `shipping_status` | Current step index |
|---|---|
| `PENDING` | 1 (Rider Assigned) |
| `SHIPPED` | 3 (Out for Delivery) |
| `DELIVERED` | 5 (timeline complete) |
| anything else | 1 |

When the backend ships an event log, swap the synthetic timestamps for the real ones.

---

## 7. Invoice / Receipt PDF

The web generates a styled PDF invoice via `@react-pdf/renderer`. The mobile equivalent should produce a similar layout (use any native PDF library — `react-native-html-to-pdf`, `expo-print`, etc.). The current design is **black-and-white only** (no green or purple accents):

### Layout (top → bottom)

1. **Black header bar** with rounded corners — "INVOICE" + `#XXXXXXXX` on the left, "Issue Date" + formatted date on the right.
2. **Business identity** — business name (large bold), comma-joined address line, contact phone.
3. **Bill To** + **Pay To** cards (light gray rounded boxes, side by side).
   - **Bill To**: `customer_info.name` + phone + email.
   - **Pay To**: bank info from `payment_history[0]` (bank, account name, account number), falling back to a "Payment Method: {method}" line when no bank is captured.
4. **Items table** — `Description | Quantity | Unit Price | Total`. Thin black header underline; subtle row separators; no row backgrounds.
5. **Right-aligned totals** — Subtotal, Discount (gray strikethrough), Shipping, Tax, **Total** (bold, black, bordered top line).
6. **Amount in words** — gray callout box with a 4 px black left border. The web uses an inline `numberToNairaWords` helper (handles up to billions, returns e.g. `Four Hundred And Thirty Thousand Naira Only`). Mirror that on mobile.
7. **Note** section (when `order.description` is present) — thin gray divider above.
8. **Footer** — centered "Sync360" wordmark + `Powered by www.sync360.africa`.

Filename convention: `Invoice-{first 8 chars of order id, upper-cased}.pdf`.

> **Font caveat**: the web registers Roboto with `normal` + `bold` only — italic causes `Could not resolve font for Roboto, fontWeight 400, fontStyle italic`. If you reuse Roboto on mobile, either register an italic variant or avoid italic styles on the PDF text.

---

## 8. Shared UX behaviours

- **Skeletons** for every list / details fetch (use the same shimmer pattern as the rest of the app).
- **Empty states**: a small illustration + helper copy + primary CTA (e.g. "Create your first order").
- **Toasts**: success on create / status update, destructive on PATCH failure.
- **Search input**: disabled until ≥ 3 chars; show a small "Type at least 3 characters to search" hint.
- **Pagination**: server-driven via `data.pages` + `data.total` + `data.limit`. The list page resets to 1 when filters or tabs change.
- **Date formatting** uses the existing app helpers (moment is acceptable; mobile-side use `dayjs` or `date-fns`).
- **Currency**: NGN-only Naira (`₦`); always format with `formatToNaira` equivalent.

---

## 9. Suggested implementation order

1. **List + filters + pagination** — the headline screen.
2. **Order details (read-only)** — render every section, no mutations.
3. **Update shipping status** + **Update payment status** — first mutations.
4. **Create Order** — full form, drawers, payment branches.
5. **Assign Delivery** (modal + Logistics sub-card).
6. **Delivery flow timeline** — once event-log endpoint is available.
7. **Download Invoice (PDF)** — last, since it can ride on top of read-only data.

---

Let me know if you'd like a companion doc covering:
- **POS + receipts** (cash sales / wallet, receipt PDF, presale codes), or
- **Logistics dashboard** (KPIs, active deliveries, rider info — currently behind a feature flag).
