# Orders Flow — Web Implementation Documentation

> **Audience.** Devs onboarding to the Orders feature on the **web** (Next.js) app. This is an *implementation* doc — it describes how the code is wired together (files, hooks, API contracts, state ownership, gotchas). For the **mobile** behavioural spec, see [`MOBILE_ORDERS_FLOW.md`](./MOBILE_ORDERS_FLOW.md).

The Orders feature owns three end-user surfaces (**list**, **create**, **detail**) plus a number of cross-cutting concerns (delivery assignment, payment recording, receipt PDF). It talks to five backend endpoints, wrapped by five Next.js proxy routes, fronted by a single fat hook (`useOrdersHook`).

---

## 1. Surfaces & routes

| Route | Page wrapper | Component | What it does |
|---|---|---|---|
| `/orders` | `app/(dashboard)/orders/page.tsx` | `Orders.tsx` | Master list with stats, tabs, filters, search, pagination |
| `/orders/create` | `app/(dashboard)/orders/create/page.tsx` | `CreateOrders.tsx` | New-order wizard (customer + products + shipping + payment) |
| `/orders/[id]` | `app/(dashboard)/orders/[id]/page.tsx` | `ViewOrder.tsx` | Detail view (info, line items, delivery timeline, actions) |

All three pages are inside the `(dashboard)` route group, so they inherit the dashboard chrome (sidebar, top-bar, auth gate).

---

## 2. File map

### `src/app/(dashboard)/orders/`

| File | Responsibility |
|---|---|
| `Orders.tsx` | List screen. Owns: status tabs, filters, search debounce, pagination, stats cards, "copy store URL". Renders `OrderCard`s in a 1/2/3-col grid. |
| `OrderCard.tsx` | Single card in the list grid. Shows id/status/customer/amount + (for OUTSTORE) mocked partner + rider. Has **Assign** and **View More** actions. |
| `AllOrdersTable.tsx` | Legacy table layout — kept for reference, **not** currently rendered (`Orders.tsx` switched to cards). |
| `OrdersColumn.tsx` | Column defs for the legacy table. Same status. |
| `NoOrders.tsx` | Empty state illustration shown when `results.data.length === 0`. |
| `AssignDeliveryModal.tsx` | Picker for delivery partner. Exports `MOCK_PARTNERS` and `DeliveryPartner` type. Currently UI-only (simulated). |
| `PaymentModal.tsx` | "Create an online payment" modal. Triggered from the legacy upsell button. |
| `DownloadOrderReceipt.tsx` | `@react-pdf/renderer` document — the real downloaded invoice/receipt. |
| `type.ts` | Type definitions: `OrderInfo`, `OrderResults`, `OrderData`, `OrderApiResponse`. |
| `page.tsx` | Bare wrapper that mounts `<Orders />`. |
| `[id]/ViewOrder.tsx` | Detail screen. Header + action bar + info card + line items + delivery panel + flow timeline. |
| `[id]/OrderFlowTimeline.tsx` | Vertical 5-step delivery timeline (Order Placed → Rider Assigned → Picked Up → Out for Delivery → Delivered). Exports `stepIndexFromShipping()`. |
| `[id]/UpdateStatus.tsx` | Payment-status update sheet (mark PAID / PARTIAL with method + bank). |
| `[id]/page.tsx` | Awaits `params`, renders `<ViewOrder id={id} />`. |
| `create/CreateOrders.tsx` | Create-order screen. Customer drawer + product drawer + shipping drawer + summary + payment selection. |
| `create/ProductDrawer.tsx` | Right-side drawer to search inventory and add products (with variation support). |
| `create/ShippingDrawer.tsx` | Right-side drawer to pick a saved shipping method. |
| `create/page.tsx` | Bare wrapper that mounts `<CreateOrders />`. |

### Hook

| File | Responsibility |
|---|---|
| `src/hooks/useOrdersHook.tsx` | **The brain.** Owns all create-order form state, calls every relevant query/mutation, exposes derived data + handlers. Used by `Orders.tsx`, `CreateOrders.tsx`, `ViewOrder.tsx`, and `UpdateStatus.tsx`. |

### API client

| File | Responsibility |
|---|---|
| `src/api/orders/orders.ts` | Query/mutation hooks: `useFetchAllOrdersQuery`, `useFetchOrderByIdQuery`, `UseCreateOrderMutation`, `useUpdateOrderShippingStatusMutation`. |
| `src/api/orders/edit-status.ts` | `useUpdateOrderPaymentStatusMutation` (separate file because it predates the `orders.ts` consolidation). |

### Next.js proxy routes

All forward to `${BaseUrl}` with `Authorization: Bearer <accessToken>` read from cookies.

| Web URL | Backend URL | Method |
|---|---|---|
| `/api/orders/[id]/all` | `order/orders/{business_id}/all` | GET |
| `/api/orders/[id]/view` | `order/single/{order_id}/` | GET |
| `/api/orders/[id]/create` | `order/outstore/{business_id}/` | POST |
| `/api/orders/[id]/update-status` | `order/change_shipping/{order_id}/?status={status}` | PATCH |
| `/api/orders/[id]/update-payment` | (payment-status endpoint) | PATCH |

> **Note on the `[id]` slot.** The first three reuse `[id]` for two different ids (business vs order). This is historical — `all` and `create` use `business_id`, `view` uses `order_id`. The proxy file names match the URL; the hook passes the right id at the call site.

---

## 3. Data flow

```
UI component
    │
    ▼
useOrdersHook                  ← single source of truth for orders feature
    │
    ├── useFetchAllOrdersQuery → /api/orders/[id]/all          → order/orders/{id}/all
    ├── useFetchOrderByIdQuery → /api/orders/[id]/view         → order/single/{id}/
    ├── UseCreateOrderMutation → /api/orders/[id]/create       → order/outstore/{id}/
    ├── useUpdateOrderShippingStatusMutation → /api/orders/[id]/update-status
    ├── useUpdateOrderPaymentStatusMutation  → /api/orders/[id]/update-payment
    │
    ├── useFetchBusinessById (shared)        → for `findBusiness` + store_url
    ├── useGetInventoryQuery (shared)        → product picker source
    ├── useGetCustomerQuery (shared)         → customer drawer source
    ├── useFetchBankQuery (shared)           → bank list when paying via BANK
    └── useFetchAllShippingQuery (shared)    → saved shipping methods
```

Auth, cookies, and the bearer header are *all* injected at the proxy boundary — the React layer only ever calls relative `/api/orders/...` URLs.

---

## 4. The hook — `useOrdersHook`

`useOrdersHook` is intentionally fat. It bundles everything an Orders page needs so individual screens stay thin. Three callers, three slightly different shapes of params:

| Caller | Params passed | What it uses out of the hook |
|---|---|---|
| `Orders.tsx` | `page, searchInput, order_type, shipping_status, payment_status, dateRange` | `OrderData`, `OrderDataLoading`, `findBusiness` |
| `CreateOrders.tsx` | `handleOpenNotSubscribeModal` | Pretty much everything — form state, validators, `onSubmit`, `CreateOrderLoading`, ancillary lists |
| `ViewOrder.tsx` + `UpdateStatus.tsx` | `id` (the order id) | `OrderIdData`, `OrderIdDataLoading`, `handleUpdateOrderStatus`, `updateOrderPaymentStatus`, `BusinessData` |

### State owned by the hook (create-order form)

| Field | Purpose |
|---|---|
| `customer` | Selected customer object (from `useGetCustomerQuery`) |
| `selectedProducts` | Picked products with `quantity` + (optional) `variation_id` |
| `productErrors` | Per-product validation errors, e.g. "Only 5 units available" |
| `shippingFee`, `tax` | Numeric inputs that feed `calculateTotal()` |
| `selectedSalesChannel` | `ONLINE` / `RETAIL` / `WHOLESALE` / `PHONE` / `WHATSAPP` |
| `shippingDate` | Local-tz `YYYY-MM-DD` (intentionally **not** `toISOString()` — see gotcha #2) |
| `paymentStatus` | `UNPAID` / `PARTIAL` / `PAID` |
| `selectedPaymentMethod` | Used when `paymentStatus !== "UNPAID"` |
| `amountPaid` | Used when `paymentStatus === "PARTIAL"` |
| `shippingStatus` | Defaults to `PENDING` |
| `notes` | Free-text |
| `selectedVariations` | `{ [productId]: variationId }` |

### Derived helpers exported

| Helper | Returns |
|---|---|
| `hasVariations(product)` | bool |
| `getSelectedVariation(product)` | the chosen variation or `null` |
| `getProductPrice(product)` | unit price — variation price if picked, else `selling_price`/`amount` |
| `getProductDiscount(product)` | per-unit discount **only if** `quantity ≥ discount_threshold` |
| `isDiscountApplied(product)` | bool |
| `getAvailableQuantity(productId)` | stock for the chosen variation if any, else product stock |
| `calculateSubtotal()` | Σ price × qty |
| `calculateTotalDiscount()` | Σ discount × qty |
| `calculateTotal()` | subtotal − discount + shippingFee + tax |
| `hasQuantityErrors()` | bool, from `productErrors` |
| `validateForm(selectedBank?)` | runs all UI checks before submit, returns bool |
| `handleRowClick(row)` | routes to `/orders/{id}` |
| `handleUpdateOrderStatus(status)` | shorthand for the shipping-status PATCH |

### Submission flow (`onSubmit`)

1. Run `validateForm(selectedBank)` — fails toast + return.
2. Build `products[]` with `id, unit_price, discount, quantity, type` + `variation_id` if applicable.
3. Build `payload`:
   ```ts
   {
     channel: selectedSalesChannel,
     customer: customer.id,
     payment_status,
     shipping_date,
     products: [...],
     shipping_fee,
     tax,
     // conditional:
     payment_method?,     // when PAID or PARTIAL
     amount_paid?,        // = total for PAID, = amountPaid for PARTIAL
     bank?,               // when payment_method === "BANK"
     shipping_status?,
     note?,               // omitted if blank
   }
   ```
4. `CreateOrder({ payload, businessId })`. On success: invalidate the list query, toast, `router.push("/orders")`.

### Subscription gate

If the user role is `OWNER` and `is_subscribed` is falsy, `validateForm` calls `handleOpenNotSubscribeModal?.()` and aborts. Pass the modal opener from the parent.

---

## 5. List screen — `Orders.tsx`

### State machine

```
activeTab:        "INSTORE" | "OUTSTORE"           // top tabs
activeStatusTab:  "ALL" | "PENDING" | "PROCESSING" | "OUT_FOR_DELIVERY"
                   | "COMPLETED" | "DELIVERED" | "CANCELLED"   // sub-tabs (UI-only for now)
filters:          { shipping_status, payment_status, sales_staff, delivery_company }
tempFilters:      same shape, used in the filter modal until "Apply"
searchInput:      debounced server-side (3+ chars)
dateRange:        DateRange | undefined
page:             1-based
```

- **Top tabs** (`INSTORE` / `OUTSTORE`) reset the status sub-tab to `ALL` and the search to empty. They drive `order_type` in the query.
- **Status sub-tabs** are *currently UI-only* (`PROCESSING`, `OUT_FOR_DELIVERY`, etc. aren't yet supported server-side). Switching them does nothing to the request — wire `activeStatusTab` into `filters.shipping_status` when backend supports the full enum.
- **Stats cards** consume `ordersData.results.{total_orders, completed_orders, total_revenue, paid_orders}`. Anything not yet on the backend is computed client-side and labelled (e.g. `totalLinkVisits = totalOrders * 2.6`, `totalDeliveryCost = Σ shipping_fee` over the page).
- **Store URL copy** — `getStoreUrl()` builds `store.sync360.africa/{i|o}/<slug>` from `findBusiness.store_url` and the active tab.
- **Filter chips** — each applied filter renders an X-able chip; the "Clear all" link wipes them and resets `activeStatusTab`.

### Pagination

`CustomPagination` reads `pages`, `total`, `limit` from `ordersData` and writes back to local `page` state. The query key includes `params`, so React Query refetches automatically when `page` changes.

---

## 6. Create screen — `CreateOrders.tsx`

A single screen split into sections; `useOrdersHook` provides all the data + handlers. Local component state covers UI-only concerns: drawer open flags, the selected shipping method, the delivery-assignment side bits, and `selectedBank` (passed to `onSubmit`).

Flow:

1. **Customer** — opens `<CustomerDrawer>`. Selecting writes to `customer` in the hook.
2. **Products** — opens `<ProductDrawer>`. Each pick appends to `selectedProducts`; quantity edits go through `updateProductQuantity()` which validates against stock and may push into `productErrors`.
3. **Variations** — if a product has variations, the UI shows `<VariationSelector>`; selection writes to `selectedVariations`. `getProductPrice()` and `getAvailableQuantity()` re-derive from the variation.
4. **Shipping** — opens `<ShippingDrawer>` to pick a saved method, or fall back to `<AssignDeliveryModal>` for the partner UI. The partner / address / calculated-price block is UI-only for now (TODO: wire the "calculate price" round-trip).
5. **Payment** — radio: `UNPAID` / `PARTIAL` / `PAID`. Conditional on the choice we show the method picker, the bank picker (when method = `BANK`), and the `amountPaid` field (PARTIAL only).
6. **Submit** — `onSubmit(selectedBank)`. The hook validates, builds the payload, and on success routes back to `/orders`.

### Calculation summary (sidebar)

```
Subtotal     = Σ price × qty
Discount     = Σ discount × qty   (only when qty ≥ discount_threshold)
Shipping     = shippingFee (input)
Tax          = tax (input)
Total        = Subtotal − Discount + Shipping + Tax
```

---

## 7. Detail screen — `ViewOrder.tsx`

### Layout

- **Header** — back button + "Order Details" title + Share button (UI-only).
- **Action bar** — Mark as Processing (UI-only) / Assign Delivery (opens `AssignDeliveryModal`) / Download Receipt (`DownloadOrderReceipt`) / Print / Contact Customer / Cancel Order (UI-only).
- **Order Info card** — id + created_at + payment & shipping badges + channel + type + customer details + created-by / last-edited-by + notes.
- **Line items card** — products with thumbnail, qty, unit price, discount, line total.
- **Delivery panel** — partner card + rider card. **Both are mock until backend ships partner/rider fields.** Stable per order id via `hashSeed(order.id) % MOCK_PARTNERS.length`.
- **Sidebar (lg only)** — totals breakdown + `OrderFlowTimeline`.

### Status updates

- **Shipping**: `handleUpdateOrderStatus(status)` from the hook → PATCH `/api/orders/[id]/update-status?status=...` → on success the detail query invalidates and refetches.
- **Payment**: `<UpdateStatusComp>` opens a sheet that calls `updateOrderPaymentStatus` (from `api/orders/edit-status`). The sheet lives next to `ViewOrder` and renders inside `CustomModal`.

### `OrderFlowTimeline`

Pure presentational. Takes `currentStepIndex` (number) and renders the 5 fixed steps. `stepIndexFromShipping(shipping_status)` is the helper that maps backend enum → index. Until backend ships per-step timestamps, the timestamp on each step is left blank.

---

## 8. PDF receipt — `DownloadOrderReceipt.tsx`

- Built with `@react-pdf/renderer`. Self-contained `<Document>` definition with `Page`, `View`, `Text`, `Image`.
- Triggered from the action bar in `ViewOrder.tsx`. Renders client-side; the user gets a Save dialog.
- Takes `orderData` (the API order) and `business` (the API business) so the PDF can show merchant logo, address, tax id, etc.
- **Font caveat**: only `normal` and `bold` Roboto variants are registered. Don't add `fontStyle: "italic"` anywhere unless you also register the italic variant — `react-pdf` throws otherwise.

---

## 9. Mocked data (what needs backend)

| Where | What's mocked | Backend dependency |
|---|---|---|
| Filter modal | `MOCK_SALES_STAFF`, `MOCK_DELIVERY_COMPANIES` | Endpoints for sales staff + delivery companies |
| `OrderCard` / `ViewOrder` | `MOCK_RIDERS`, `MOCK_PARTNERS` | Real partner/rider fields on the order object |
| Sub-tabs | `PROCESSING`, `OUT_FOR_DELIVERY`, `COMPLETED`, `DELIVERED`, `CANCELLED` filters | Full `shipping_status` enum supported on the list endpoint |
| Stats card | `totalLinkVisits = totalOrders * 2.6` | Real link-visits metric in `results` |
| `Orders.tsx` | `totalDeliveryCost` summed over visible page | Real total in `results` |
| `CreateOrders.tsx` | "Calculate delivery price" `setTimeout(800)` | Real pricing endpoint |
| `ViewOrder.tsx` | Cancel Order + Mark as Processing buttons | New status endpoints |

When wiring any of these to a real endpoint, **also delete the mock constant** — leaving it behind is the most common source of "why does the test show fake data" tickets.

---

## 10. Enums + display maps

```ts
type PaymentStatus  = "PAID" | "PARTIAL" | "UNPAID";
type ShippingStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED";
type SalesChannel   = "ONLINE" | "RETAIL" | "WHOLESALE" | "PHONE" | "WHATSAPP";
type OrderType      = "INSTORE" | "OUTSTORE";
```

Pill colours live in `OrderCard.tsx`:

```ts
paymentStyles  = { PAID: green, PARTIAL: yellow, UNPAID: red, DEFAULT: gray }
shippingStyles = { PENDING: yellow, SHIPPED: blue, DELIVERED: green, RETURNED: red, DEFAULT: gray }
```

`ViewOrder.tsx` has its own `getPaymentStatusBadge` / `getShippingStatusBadge` that wrap the same colours — keep these in sync if you add a new status.

---

## 11. React Query keys

From `src/constants/query-key.ts`:

```ts
orders: {
  getAllOrders:      "get-all-orders",
  getOrderById:      "get-order-by-id",
  createOrder:       "create-order",
  updateOrderStatus: "update-order-status",
  // payment-status update reuses updateOrderStatus
}
```

The list query key is `[getAllOrders, params]` — params include page, search, filters, dates — so changing any input is a cache miss. The detail key is `[getOrderById, orderId]`.

After a successful create the list is invalidated. After a successful shipping-status PATCH the *single* order is invalidated (so the detail screen refreshes); the list is **not** invalidated — switch that on if "newest at top with fresh status" matters.

---

## 12. Conventions & gotchas

1. **Auth at the proxy edge, not in the React tree.** Components only ever call `/api/orders/...`. The bearer header is added in the route file from `cookies().get("accessToken")`. If you ever feel like you need the token in a component, that's a smell — push the call into a proxy.

2. **`shippingDate` is local-tz `YYYY-MM-DD`.** Do **not** swap for `new Date().toISOString().slice(0,10)` — for users east of GMT around midnight, ISO subtracts a day. The hook builds the string manually:
   ```ts
   const d = new Date();
   `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
   ```

3. **Search is debounced by length, not time.** `Orders.tsx` only forwards `searchInput` when `length >= 3` — under that it sends an empty string. Mirror this if you build alternate search UI.

4. **Out-of-stock filter is client-side.** `useOrdersHook.filteredInventoryData` strips `status === "OUT-OF-STOCK"`. The picker never sees those. If you need them visible (e.g. to flag re-orders), pull from the raw `InventoryData` instead.

5. **Variation-aware everything.** `getProductPrice`, `getAvailableQuantity`, `getProductDiscount` all check `selectedVariations[productId]` first. When adding a new derived field for products, use the same pattern or you'll silently use the parent's value for variant lines.

6. **Discount threshold gates discount.** `getProductDiscount` only returns a non-zero value when `quantity >= discount_threshold`. Both fields come from the variation if one's selected, else from the product.

7. **Subscription gate**. `validateForm` aborts and triggers `handleOpenNotSubscribeModal` for `OWNER` users whose `is_subscribed` is false. Roles other than `OWNER` skip this entirely.

8. **The `[id]` slot is overloaded.** `all`/`create` mean `business_id`; `view`/`update-status`/`update-payment` mean `order_id`. The hook passes the right one — don't try to "fix" the proxy folder structure without also renaming and migrating callers.

9. **`AssignDeliveryModal` is a stub.** It `setTimeout`s for 800ms and calls `onAssigned(partner)`. There's no persistence yet; the chosen partner lives only in component state. Wire to a real `POST /order/{id}/assign-delivery/` (or similar) when backend ships it.

10. **`DownloadOrderReceipt` is the PDF; `ViewOrder` is the UI.** A previous round of edits styled the UI assuming it would become the receipt — it won't. Keep visual changes for the on-screen receipt limited to `ViewOrder.tsx`; touch `DownloadOrderReceipt.tsx` to change what the merchant actually downloads.

11. **Cards replaced the table on `/orders`.** `AllOrdersTable.tsx` and `OrdersColumn.tsx` are preserved for reference but no longer rendered. If you need a sortable table again, prefer extending `OrderCard.tsx` (e.g. add a list-style variant) rather than reviving the old shadcn-table path — it's easier to make one component responsive than to keep two layouts in sync.

12. **Status sub-tabs aren't wired to the backend yet.** `activeStatusTab` only re-styles the strip. Once the backend supports the full `shipping_status` set, do:
    ```ts
    setFilters((p) => ({ ...p, shipping_status: tabKeyToBackendEnum(activeStatusTab) }));
    ```
    inside `handleStatusTabChange` and refetch follows automatically.

---

## 13. Quick "where do I…" cheat sheet

| Task | File / function |
|---|---|
| Add a new filter to the list | `Orders.tsx` — `FilterState` + filter modal + `handleApplyFilters`; pass through `useOrdersHook` → `useFetchAllOrdersQuery` → proxy route query string |
| Add a new payload field on create | `useOrdersHook.onSubmit` (build payload) + `CreateOrderPayload` in `api/orders/orders.ts` |
| Add a new shipping status | Backend enum + `OrderFlowTimeline.STEPS` + `paymentStyles`/`shippingStyles` in `OrderCard.tsx` + `getShippingStatusBadge` in `ViewOrder.tsx` |
| Add a new payment method | `validateForm` (the `BANK` branch) + the radio/select in `CreateOrders.tsx` + `<UpdateStatusComp>` |
| Add a new action button on the detail screen | `ViewOrder.tsx` action bar; if the action hits the backend, add a mutation in `api/orders/orders.ts` and a thin handler in the hook |
| Change the receipt PDF | `DownloadOrderReceipt.tsx` (NOT `ViewOrder.tsx`) |
| Wire a real delivery partner API | Replace `MOCK_PARTNERS` in `AssignDeliveryModal.tsx` + the `setTimeout` in `handleAssign` + the `useState` in `CreateOrders.tsx`/`ViewOrder.tsx` |

---

## 14. Tests + verification

There are no unit tests for the Orders feature today (consistent with the rest of the app). When changing any of the calculation helpers (`calculateSubtotal`, `calculateTotalDiscount`, `getProductDiscount`), verify manually with:

- A product with no variations + qty below `discount_threshold` → discount = 0.
- A product with no variations + qty at threshold → discount applies.
- A product with variations where the variation has its own `discount_threshold` → uses the variation's, not the parent's.
- A `PARTIAL` payment where `amountPaid === total` → validator should reject.
- A `PAID` order created with `BANK` but no bank selected → validator should reject.

After any change run `npx tsc --noEmit` from `sink/` and `npm run lint`.
