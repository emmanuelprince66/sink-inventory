# Inventory, POS, Sales & VAT — Mobile Implementation Spec

This is the third doc in the mobile spec series. The mobile flow should match the web in behaviour, terminology, validation, and API contracts.

Surfaces covered:
- **Add / Edit Product** (single + multi-variation, checkbox semantics, description, weight, media)
- **Combo** (list + create + edit + delete + sell in POS)
- **History pages** (Product / Restock / Production / Transfer / Damaged)
- **Inventory Report**
- **POS** — selling variations and combos
- **Sales** — surfacing variation sales and combo sales
- **Analytics — VAT** (configure, opt-in, apply at checkout, show on receipt)

Reference files in the web codebase:

| Section | Web file |
|---|---|
| Inventory list | `sink/src/app/(dashboard)/inventory/Inventory.tsx` |
| Add / Edit Product | `sink/src/app/(dashboard)/new-add-product/NewAddProduct.tsx` |
| Product hook | `sink/src/hooks/useAddNewProductHook.tsx` |
| Combo list / create | `sink/src/app/(dashboard)/inventory/combo/CreateCombo.tsx` |
| Combo edit | `sink/src/app/(dashboard)/inventory/combo/[id]/EditComboPage.tsx` |
| Product history | `sink/src/app/(dashboard)/inventory/product-history/ProductHistory.tsx` |
| Restock history | `sink/src/app/(dashboard)/inventory/restock-history/RestockHistory.tsx` |
| Production history | `sink/src/app/(dashboard)/inventory/production-history/ProductionHistory.tsx` |
| Transfer history | `sink/src/app/(dashboard)/inventory/[id]/transfer-history/TransferData.tsx` |
| POS terminal | `sink/src/app/(dashboard)/pos/Pos.tsx` |
| POS checkout | `sink/src/app/(dashboard)/pos/CheckoutPage.tsx` |
| POS receipt | `sink/src/app/(dashboard)/pos/PrintReceiptView.tsx` |
| Variation picker | `sink/src/app/(dashboard)/pos/VariationSelectorModal.tsx` |
| Sales screen | `sink/src/app/(dashboard)/sales/Sales.tsx` |
| Analytics — VAT | `sink/src/app/(dashboard)/analytics/TaxAnalytics.tsx` |
| Tax setup | `sink/src/app/(dashboard)/settings/tax/Tax.tsx` |

---

## 0. Cross-cutting notes (read first)

- All requests use the merchant's **access token** + scoped to a `business_id`.
- The **product `type` field** is the single discriminator across the app:
  - `PRODUCT` — physical / digital item (may have variations).
  - `SERVICE` — labour-priced item (no stock, attendant sets price at checkout).
  - `COMBO` — bundle of products sold as one SKU.
- Currency is NGN (`₦`).
- All paginated lists follow the shape: `{ data: { results: { data: [...] }, total, pages, limit, links } }`.

---

## 1. Add / Edit Product — single & multi-variation

The web uses **one component** (`NewAddProduct.tsx`) for both Create and Edit. The mobile app should mirror that — same form, same fields, same validation. Edit just hydrates from the API and switches `submitLabel` to "Save Changes".

### 1.1 Card stack (top to bottom)

1. **Product Information** — images + videos uploader at the top, then item name, SKU, unit, expiry date, weight, department, category.
2. **Description** — optional textarea, ships as the `description` field on the payload.
3. **Product Variations** — pill tabs: `One Type` (single product) or `Multiple`.
4. **Manage Products** — for the "Multiple" tab: variation table + bulk edit modal.
5. **Product Settings** — the 5 toggles (`allow_tax`, `sell_online`, `in_house`, `raw_material`, `watchlist`).
6. **Supplies & Payment** — supplier, payment method (CASH / CREDIT / PART), due date / amount paid, discount type, percentage discount.

### 1.2 Media upload (images + videos)

- **Combined cap of 4** across images + videos (not 4 + 2 separately).
- Image limits: ≤ 5 MB each; accepts JPG / PNG / WEBP / HEIC / HEIF.
- Video limits: ≤ 10 MB each; accepts MP4 / MOV / WEBM / M4V.
- Each uploader's `max` is computed from the *other* field's count: `imagesRemaining = 4 - videos.length` and vice versa.

**Edit hydration:** the backend returns a single `media: [{id, file, type: "IMAGE"|"VIDEO"}]` array. Split it client-side by `type` to populate the two uploaders.

**Edit submission:** newly added `File` objects go under `images` / `videos`. URL strings that survived the edit are mapped back to their media IDs and forwarded as repeated `kept_media_ids` form entries so the backend can prune anything removed.

### 1.3 The 5 toggles — what each one does

| Field | Default | Effect on backend / UX |
|---|---|---|
| `allow_tax` | `false` | Subject this SKU to VAT at checkout. If false, the cart skips this item when summing VAT even when the business has a tax rate set (see §8.4). |
| `sell_online` | `false` | Show this SKU on the merchant's out-store storefront (`/o/{slug}`). Disabling hides it from public checkout but keeps it for in-store POS. |
| `in_house` | `false` | Treat as an in-house produced item (used by the production flow — see §4.3). When true, restock is via the Production Move/Receive cycle, not supplier delivery. |
| `raw_material` | `false` | Tag the SKU as a raw material (used as input to in-house production). These can be hidden from the POS grid by checking with `include_raw_material` flag on the inventory query. |
| `watchlist` | `false` | Flags the SKU as one the merchant wants to keep an eye on — surfaces in the watchlist tab and shows an eye icon on the sales tables. |

### 1.4 Multi-variation flow

A "variation type" is a dimension like Color or Size. Each variation type has values (Red / Blue, or Small / Medium / Large). The cross-product of all selected types builds the variation table.

**Add Variation Type sheet:**
- Tap the `+` to open a side sheet.
- Pick a type (Color / Size / Material / Volume / Custom).
- Add one or more values for that type — `Add another` chip in the sheet.
- Save → mobile generates `product_variations` for every Cartesian combination.

**Each generated row** has the same editable columns as a single product: `cost_price`, `selling_price`, `quantity`, `low_stock_threshold`, `discount`, `discount_threshold`, `status`, `expiry_date`.

**Bulk Edit** (web has a modal — "Edit All Variations"): user fills any combination of fields, taps Apply, and every row in the variation table updates with the supplied values (untouched columns are left alone).

**Validation:**
- At least one variation type must exist.
- Every generated row needs a `cost_price`, `selling_price`, and `quantity` (in create mode).
- Each row's `selling_price ≥ cost_price` (warn otherwise).

### 1.5 Switching variation type during Edit

The pill (`One Type` ↔ `Multiple`) is **always editable**, including in edit mode. The form sends `variation_type` on every submit so the backend can clear or rebuild variations as the user switches modes:

- **Multiple → One Type** while editing: the single-product fields (`cost_price`, `selling_price`, etc.) are blank after hydration (they were `""` because the multi branch populated). The user must refill them before saving. The schema enforces this — `!isEditMode` gate removed.
- **One Type → Multiple** while editing: variations array starts empty. User adds at least one variation type, then saves.

The backend uses `variation_type` to decide whether to drop the existing variation rows and write the single-product fields, or vice versa.

### 1.6 Endpoints

- **Create:** `POST /product/business/{business_id}/` — multipart form. See §1.7 for the exact payload.
- **Update:** `PATCH /product/business/{business_id}/{product_id}/` — same multipart shape + the `kept_media_ids` list.
- **Fetch one (for edit):** `GET /product/business/{business_id}/{product_id}/`
- **Departments / Categories / Suppliers** — used for the three Selects:
  - `GET /department/business/{business_id}/`
  - `GET /category/business/{business_id}/?type=PRODUCT`
  - `GET /supplier/business/{business_id}/`

### 1.7 Payload (matches the OpenAPI `Product` schema)

```ts
{
  name: string,                          // required
  sku: string,                           // optional
  category_id: string (UUID),            // required
  department_id?: string (UUID),
  supplier_id?: string (UUID),
  unit?: enum,                           // Pcs / Kg / Bag / Box / Ctn / Ltd / Pair / Gram / Feet / Roll / Meter / Mil / Bottle / Bundle / Ml / Ton / Dozen / Mg / Gr
  weight?: decimal,                      // string
  expiry_date?: YYYY-MM-DD,
  description?: string,

  allow_tax: boolean,                    // required
  in_house: boolean,                     // required
  raw_material: boolean,                 // required
  sell_online: boolean,                  // required
  watchlist: boolean,                    // required
  hide_from_pos?: boolean,

  // Single-product fields (when variation_type === "single")
  cost_price?: decimal,
  selling_price?: decimal,
  quantity?: decimal,
  low_stock_threshold?: decimal,
  status?: "IN-STOCK" | "LOW-STOCK" | "OUT-OF-STOCK",
  discount?: decimal,
  discount_threshold?: decimal,

  // Variation fields (when variation_type === "multiple")
  variation_inputs?: Array<{
    name: string,
    cost_price: decimal,
    selling_price: decimal,
    quantity: decimal,
    low_stock_threshold?: decimal,
    expiry_date?: YYYY-MM-DD,
    status?: string,
    discount?: decimal,
    discount_threshold?: decimal,
  }>,

  // Variation intent — always sent so backend can clear/rebuild
  variation_type: "single" | "multiple",

  // Payment terms
  payment_method?: "CASH" | "CREDIT" | "PART",
  amount_paid?: decimal,                  // when payment_method !== "CASH"
  due_date?: YYYY-MM-DD,                  // when CREDIT / PART

  // Media (multipart)
  images: File[],                         // newly added files only
  videos: File[],                         // newly added files only
  kept_media_ids?: string[],              // edit only — IDs of media to keep
}
```

---

## 2. Combo

A Combo bundles 2+ products (and/or variation rows) at a single price. Selling one Combo deducts stock from every constituent product.

### 2.1 Combo list

- Combos live on the **inventory** screen. They surface in the same table when the user picks the "Combos" filter; under the hood the inventory query is called with `?type=COMBO`.
- Columns: image, name, # items, original total, combo price, savings %, status (active / inactive), actions (Edit, Delete).
- Empty state + standard pagination + search by name.

### 2.2 Create Combo

Route: `/inventory/combo/` → `CreateCombo.tsx`. Layout (top → bottom):

1. **Combo Details** card — image uploader, name, description textarea, `sell_online` checkbox.
2. **Combo Items** card — tap *Add Products* → opens a right-side product picker sheet.
3. **Pricing Summary** card — auto-computed: Original Total, Cost Basis, Combo Selling Total, Savings %.
4. **Inventory Impact** card — for each constituent, shows current stock and how many combos can ship before the constituent runs out.
5. **Submit** button (`Create Combo`).

**Product picker sheet:**
- Lists all `type=PRODUCT` items from the inventory endpoint.
- Filters out items already in the combo.
- Tapping a product with `variations.length > 0` opens a **nested variation picker** — pick one or more variation rows, each becomes its own combo item.
- Each combo item has its own Qty (− / +) and Price input.

**Combo item internal shape:**
```ts
{
  id: variation_id || product_id,        // unique cart key
  productId: parent_product_id,
  name: "Product Name" | "Product Name - Variation Name",
  hasVariation: boolean,
  variationName?: string,
  comboQty: number,
  comboPrice: number,
}
```

**Validation before submit:**
- At least 2 items.
- All items have a positive `comboPrice` and `comboQty`.
- Combo `name` not empty.
- Combo total `> 0`.

**Endpoint:** `POST /combo/business/{business_id}/create/` — multipart form. Items are serialised as a JSON string under an `items` field; image goes under `image`.

### 2.3 Edit Combo

Route: `/inventory/combo/{combo_id}/` → `EditComboPage.tsx`.

- Reuses `CreateCombo` with `isEditMode={true}` + `initialData`.
- Hydrates from `GET /combo/{combo_id}/` — maps response items back into the local `ComboItem[]` shape.
- Submit goes to `PUT /combo/{combo_id}/edit/`.
- After success, invalidate the inventory query (so the combos tab updates) and pop back to `/inventory`.

### 2.4 Delete Combo

- From the inventory list row dropdown → opens a confirm sheet.
- `DELETE /combo/{combo_id}/` then invalidate the inventory query.

---

## 3. History pages

All five surfaces follow the same pattern: filters at the top, summary cards, paginated table. Mobile lists should swap each table for a card list.

### 3.1 Product History (Waste / Return / Damage)

**Path:** `inventory/product-history/`

One screen with **3 tabs** — WASTE, RETURN, DAMAGE. There is **no separate "Damaged History" screen** — damage is the third tab.

| Aspect | Value |
|---|---|
| Purpose | Track waste, returns and damaged stock for problem-spotting |
| Filters | Date range, department |
| Columns | Product (name + unit) · Category badge · Quantity · Qty After · Value (₦) · Recorded By · Note · Date/Time |
| Summary cards | Total Records · Total Value |
| Tab tones | WASTE = slate, RETURN = sky, DAMAGE = amber |
| Endpoint | `GET /product/business/{business_id}/product-history/?type={WASTE|RETURN|DAMAGE}&page&limit&start_date&end_date&department` |

### 3.2 Restock History

**Path:** `inventory/restock-history/`

Global view of every restock event across the business.

| Aspect | Value |
|---|---|
| Filters | Search (product name or SKU) · Date range · User · Department |
| Columns | Product · SKU · Quantity · Date · User · Remark · Actions (View Details) |
| Summary cards | Total Records · Total Value |
| Endpoint | `GET /restock/business/{business_id}/?search&start_date&end_date&user&department&page&limit` |
| Notes | "User" filter dropdown is populated from the unique users in the response — load lazily on screen open. |

### 3.3 Production History (in-house only)

**Path:** `inventory/production-history/`

Tracks the MOVED → RECEIVED workflow for in-house produced items. Role-gated: only OWNER, ADMIN-ATTENDANT and PRODUCTION-MANAGER see the **Receive** action.

| Aspect | Value |
|---|---|
| Filters | Search · Date range · Status (MOVED / RECEIVED) |
| Columns | Product · Units Moved · Date · Moved By · Received By · Note · Status (badge) |
| Summary cards | Total Production Cost · Moved count |
| Endpoints | Fetch: `GET /product/business/{business_id}/production-history/?search&status&start_date&end_date` <br/> Receive: `POST /inventory/accept-product/` with `{ move_id }` |
| UI quirk | When row status = MOVED and user has permission, the status badge becomes a **Receive** button. Tapping it fires the accept mutation and optimistically flips the row to RECEIVED. |

### 3.4 Transfer History (per product)

**Path:** `inventory/{product_id}/transfer-history/`

| Aspect | Value |
|---|---|
| Purpose | Per-product inter-business movement log |
| Filters | None — no filter UI |
| Columns | Created At · Transferred By · Destination Business · Destination Product · Direction · Quantity · Source Business |
| Pagination | Not paginated on web — full list dump per product |
| Empty state | "No transfer history yet" |
| Endpoint | `GET /product/transfer-history/{product_id}/` |

### 3.5 Damaged History

As noted in §3.1 — this is the `DAMAGE` tab on the Product History screen, not a separate page. Same endpoint with `type=DAMAGE`. Tab badge / summary cards use amber tones.

---

## 4. Inventory Report

The Inventory screen (`Inventory.tsx`) has a **"Generate Report"** button driven by the shared `GenerateReportButton` component. It hits the report-generate endpoint with `report_type="inventory"` and triggers a download.

| Element | Value |
|---|---|
| Component | `components/app/GenerateReportButton.tsx` |
| Endpoint (web proxy) | `GET /api/report/generate?business_id&report_type=inventory&timeframe&start_date&end_date&export_format` |
| Backend | `GET /report/generate/` |
| Timeframes | `today` / `last_7_days` / `last_1_month` / `last_3_months` / `custom` |
| Export formats | `xlsx` (default — styled), `csv`, `json` |
| Filename pattern | `inventory-report_{timeframe}_{YYYY-MM-DD}.{ext}` |

On mobile, render the same report dialog (Timeframe select + conditional Start/End date inputs + Export format select) and stream the blob to the device's download / share sheet.

---

## 5. POS — Selling Products

### 5.1 The product grid distinguishes 3 kinds

The POS grid fetches `GET /product/business/{business_id}/` and renders each item as a tile. The tile's tap behaviour is decided by the **type discriminator** + presence of variations:

| Item kind | How identified | Tap behaviour |
|---|---|---|
| Service | `type === "SERVICE"` | Adds to cart immediately; cart cell exposes an editable price input |
| Product (no variations) | `type === "PRODUCT"` && `variations.length === 0` | Adds to cart with default `selling_price` |
| Product with variations | `type === "PRODUCT"` && `variations.length > 0` | Opens **VariationSelectorModal** — user picks one or more variation rows and a qty per row |
| Combo | `type === "COMBO"` | Adds to cart as a single line; deducts stock from every constituent on checkout |

### 5.2 Selling a variation product

1. Tap the variation product tile.
2. `VariationSelectorModal` opens with a row per variation: name, stock, price, qty stepper.
3. User can pick **multiple variation rows** in one go (each becomes its own cart line).
4. Each cart item stores the parent product reference (`parentProductId`, `parentProductVariations`) so the user can swap or modify the chosen variation later from the cart.

### 5.3 Selling a combo

1. Tap the combo tile.
2. Combo is added directly — no picker (the combo composition is fixed at create-time).
3. Cart line shows the combo name, the combo selling price, and a qty stepper. Tapping the line can expand to show constituent items + stock impact (web shows it in the checkout summary; mobile can do the same on tap-to-expand).
4. Backend deducts the constituents' stock by `combo.items[i].quantity * cart_quantity` when the sale is recorded.

### 5.4 Multi-cart tabs

The cart store supports **multiple parallel carts** (CartTabs). Each tab keeps its own items + per-sale state (customer, attendant, payment method). Mobile should mirror this with a tab bar at the top of the cart drawer, or fall back to a single cart with a "Save sale" mechanic if you'd rather not do tabs on phones.

### 5.5 Cart item shape

```ts
interface CartItem extends Product {
  cartQuantity: number,
  // For variation items only:
  parentProductId?: string,
  parentProductVariations?: Variation[],
  // For service items only — attendant overrides price at checkout:
  overridePrice?: number,
}
```

---

## 6. Sales — surfacing what was sold

The Sales screen (`Sales.tsx`) has three views:

### 6.1 Products Sold

Each row is a product (or variation), with the columns:

| Column | Notes |
|---|---|
| Watchlist eye | Only shown when `watchlist === true` |
| Name | Includes variation name when applicable, e.g. *"T-Shirt — Blue, Large"* |
| SKU | Monospace |
| Unit Sold | Aggregate units across the date range |
| Revenue | Always shown |
| VAT | Sum of `itemVat` across sales (see §7.4) |
| Profit | Owner-only |
| Discount | Per-line discount aggregate |

**Variation sales** appear here as separate rows — there's no parent-product aggregation row. Each variation row carries the parent product name as a prefix so the merchant can scan.

### 6.2 Order History

Order-level table — every entry is a single sale. Combos appear here in the order's line items but the row itself just shows the order metadata:

| Column | Notes |
|---|---|
| Order ID | First 8 chars upper-cased |
| Attendant | Who rang it up |
| Presale by | Set only when the sale came from a presale code |
| Date | Formatted |
| Amount | Owner-only |
| Payment status | Green (PAID) / Yellow (PARTIAL) / Red (UNPAID) |

Tapping a row opens the order details (see the Orders doc, §4).

### 6.3 Combo Sales

A dedicated tab (`ComboSalesTable.tsx`). On web it's currently using placeholder data and is marked as draft until the backend exposes a combo-sales endpoint. For mobile:

- Render a sub-grid that surfaces each combo sold with its image, name, total quantity sold, total revenue.
- Tapping a row opens a sheet that lists the constituent items with per-unit qty inside the combo and the bundled price.
- When the backend ships the endpoint, the suggested shape is:
  ```ts
  GET /sales/combo/business/{business_id}/?start_date&end_date
    → { results: { data: Array<{ combo_id, name, image, quantity_sold, revenue, items: Array<{name, qty, unit_price}> }> } }
  ```

---

## 7. Analytics — VAT

### 7.1 Where the rate is set

**Path:** `settings/tax/` → `Tax.tsx`

- Displays the current `business.tax_rate` (e.g. `7.5`) in a card.
- "Edit" opens a small modal with a single number input (step `0.01`, min `0`, max `100`).
- Save fires the mutation in §7.6.

### 7.2 How a product opts in

The product form's **`Allow Tax`** checkbox sets `allow_tax: boolean` on the SKU. The cart later inspects this flag to decide whether the item contributes to VAT (see §7.4).

### 7.3 How VAT is computed at checkout

In `CheckoutPage.tsx`:

```
IF business.tax_rate > 0 AND business.tax_rate_last_updated is set:
  FOR each cart item where product.allow_tax === true:
    itemTotal = (selling_price || amount) * cartQuantity
    itemVat   = itemTotal * tax_rate / 100
  totalVat   = sum of itemVat
  totalWithVat = totalBeforeTax + totalVat
ELSE:
  No VAT applied
```

The computed `vatCalculation` object is passed everywhere downstream:

```ts
{
  enabled: boolean,
  rate: number,
  amount: number,
  totalWithVat: number,
  itemsBreakdown: Array<{ id, name, itemTotal, itemVat }>,
}
```

### 7.4 How VAT shows on the receipt

`PrintReceiptView.tsx` receives `vatInfo` and renders:

- An `+VAT` badge beside each line item when `product.allow_tax === true` (only if the business has VAT enabled).
- A `VAT ({rate}%):  +₦{amount}` row in the totals block.
- The final total line switches to `vatInfo.totalWithVat` when enabled.

**Caveat:** The PDF invoice (`DownloadOrderReceipt.tsx`) currently hard-codes `tax = 0` and does **not** print VAT. If you need VAT on the PDF on mobile, plumb the same `vatInfo` through the receipt builder.

### 7.5 How VAT shows in Analytics

`TaxAnalytics.tsx` fetches `GET /analytic/tax/{business_id}/?year={YYYY}` and renders:

| Card / Chart | Data |
|---|---|
| KPI: Total Sales | `total_sales` |
| KPI: Total Tax | `total_tax` |
| KPI: Net VAT Position | `total_tax - tax_paid_input` (status: Payable if > 0, else Nil) |
| KPI: Development Levy | (placeholder card, fixed in UI today) |
| Monthly VAT line chart | `monthly_tax: { 1: n, ..., 12: n }` |
| VAT Breakdown card | Tax Collected / Tax Paid (Input) / Net VAT Position |
| Export Package tracker | Monthly Summary, VAT Breakdown, Payment Instructions |

### 7.6 Endpoints

- **Fetch business (includes `tax_rate` + `tax_rate_last_updated`):** `GET /business/{business_id}/`
- **Update tax rate:** `POST /business/set_tax/{business_id}/` with body `{ rate: "7.5" }`.
  - On success, refetch business; `tax_rate_last_updated` is set by the backend.
- **Analytics — VAT:** `GET /analytic/tax/{business_id}/?year={YYYY}`

---

## 8. Suggested implementation order

1. **Inventory list + Add/Edit product (single)** — the base. Includes the 5 toggles and the media uploader.
2. **Variation flow on top of the same form** — the "Multiple" pill, variation type sheet, bulk-edit modal.
3. **POS variation selling** — once products with variations exist, the POS picker becomes meaningful.
4. **Combo create / edit / list** — needs §2's product picker and the variation picker reused.
5. **POS combo selling** — pulls combos into the same grid.
6. **History pages** — all 5 (Product / Restock / Production / Transfer / Damaged) can be built in parallel; they share the same filters + table + summary patterns.
7. **VAT** — Tax setup screen first, then the checkout calculation, then the receipt rendering, then Analytics last.
8. **Inventory Report** — last; reuses the `GenerateReportButton` flow already documented in the orders / setup spec.

---

Let me know if you want a companion doc for any of:
- **Customers + Suppliers** (CRM screens, statement of account, balances)
- **Expenses + Departments** (cost tracking)
- **Campaign** (SMS + WhatsApp, sender ID setup, unit usage table)
- **Referrals** (the new "Refer & Earn" screen)
