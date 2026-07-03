# Expenses Flow — Mobile Integration Spec (Flutter)

> **Audience.** Flutter dev rebuilding the Expenses feature with no access to the web codebase. This document is the contract: what the screens do, what the API contracts are, what the mobile app must match for behavioural parity with the web.

> **Important — two layers, different maturity.** The web implementation has two distinct layers:
>
> 1. **Legacy expense CRUD** (Add Expense, Edit, Delete, View list) — **fully wired to live API endpoints**. The mobile app must match this contract.
> 2. **Expense Account Management** (single account dashboard, categories, budgets, transfers, transactions log, approvals) — **currently UI-only with mock data on the web**. The endpoints listed in this section are **proposed** based on what the UI requires; coordinate with backend before mobile implementation.
>
> Sections marked **🔵 LIVE** are wired today. Sections marked **🟡 PROPOSED** are not yet on the backend — they reflect what the mobile app will need once the backend ships.

---

## 0. Cross-cutting concerns (read first)

- **Authentication.** Every request is authenticated with the merchant's bearer token (`Authorization: Bearer <accessToken>`).
- **Business scoping.** Every request is scoped to `business_id` (the merchant's active business). This is the same value used everywhere else in the app. **Always required** — no endpoint operates without it.
- **Base URL.** `https://www.staging-api.sync360.africa/api/v1/` for staging. (Production URL handed separately.)
- **Currency.** All amounts are NGN (`₦`). Send as decimal numbers (e.g. `75000`, not `"75000.00"` or `"₦75,000"`).
- **Dates.** Submit as `YYYY-MM-DD` (no time component) using local timezone — *not* `toISOString()` which shifts to UTC and silently changes the calendar day for users east of GMT.
- **Pagination.** Page + limit. Default `limit: 30` for the legacy list endpoint. Response is the standard Sync360 envelope (see §1 schema).
- **Subscription gate.** For users whose role is `OWNER`, creating expenses requires an active subscription (`is_subscribed: true`). If `is_subscribed: false`, the mobile app should surface the same "Not Subscribed" upsell prompt the web does, and *not* attempt the POST. Non-owner roles bypass this gate.
- **Search debounce.** When using the search filter, debounce 500 ms and only send the param when length is `0` (cleared) or `≥ 3`. Anything between 1–2 chars should not hit the network.

---

# 🔵 PART A — LIVE: Legacy Expense CRUD

This is the layer the web ships today and the mobile must match. Five endpoints. CRUD on an "expense" line item that has a category, amount, due date, and optional note.

---

## A1. Endpoints

### A1.1 List expenses

```
GET /expenses/business/{business_id}/
```

**Path params**

| Name | Type | Description |
|---|---|---|
| `business_id` | UUID | The merchant's business |

**Query params** (all optional)

| Name | Type | Notes |
|---|---|---|
| `search` | string | Free-text search over the expense `name` / `note`. **Debounce 500 ms; only send when length is 0 or ≥ 3** |
| `category` | UUID | Filter by expense category id (the category's `id`, not the name) |
| `start_date` | string `YYYY-MM-DD` | Inclusive |
| `end_date` | string `YYYY-MM-DD` | Inclusive |
| `page` | int | 1-based, defaults to 1 |
| `limit` | int | defaults to 30 |

**Success response (`200`)**

```json
{
  "success": true,
  "message": "Expenses data fetched successfully",
  "data": {
    "limit": 30,
    "total": 42,
    "pages": 2,
    "links": { "next": "…", "previous": null },
    "results": {
      "total_expenses": 1842000,
      "data": [
        {
          "id": "uuid",
          "name": "Diesel — Ikeja branch",
          "amount": 75000,
          "date": "2026-06-17",
          "note": "Generator top-up",
          "category": {
            "id": "uuid",
            "name": "Fuel",
            "type": "EXPENSES"
          },
          "created_at": "2026-06-17T10:48:00Z",
          "updated_at": "2026-06-17T10:48:00Z"
        }
      ]
    }
  }
}
```

> **Note on the pagination envelope.** `data.limit / total / pages / links` describe the page; `data.results.data[]` is the actual list. `results.total_expenses` is the **sum of `amount` for the filtered range**, exposed so the UI can render the "Total Expenses" overview card without summing client-side.

**Error response shape (any 4xx/5xx)**

```json
{
  "success": false,
  "error": "Failed to fetch expenses data",
  "message": "<human-readable>",
  "details": { /* optional */ }
}
```

### A1.2 Get one expense

```
GET /expenses/{expense_id}/
```

Returns a single record in the same shape as one entry of `results.data` above, wrapped in `{ success, data, message }`.

### A1.3 Create expense

```
POST /expenses/business/{business_id}/
```

**Body** (JSON)

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✓ | Min length 1. The proxy rejects with 422 if missing. |
| `category_id` | UUID | ✓ | Id of an `EXPENSES`-type category (see §A2) |
| `amount` | number | ✓ | Decimal, NGN |
| `date` | string `YYYY-MM-DD` | ✓ | Due date |
| `note` | string | ✗ | Free text — only include when non-empty |

```json
{
  "name": "Diesel — Ikeja branch",
  "category_id": "uuid",
  "amount": 75000,
  "date": "2026-06-17",
  "note": "Generator top-up"
}
```

**Success response (`201`)** — the created expense object wrapped in `{ success, data, message }`.

### A1.4 Edit expense

```
PATCH /expenses/{expense_id}/
```

**Body**: same shape as create. Send the full object — the web sends `name + category_id + amount + date + note`. Send all fields you want to keep; do not assume the backend supports partial updates (the web hook sends the full set).

> ⚠️ **Known proxy quirk on the web** — the Next.js proxy at `/api/expenses/{id}/edit-expense` currently strips everything except `name` before forwarding. This is **a web-side bug**, not a backend constraint. The mobile app should send the full payload directly to the backend.

### A1.5 Delete expense

```
DELETE /expenses/{expense_id}/
```

No body. Success returns `{ success: true, message: "Expense deleted successfully" }`.

---

## A2. Categories (sourced from a separate endpoint)

Expense categories are **not** owned by the expenses module. They come from the global categories endpoint, scoped by type.

```
GET /categories/business/{business_id}/?type=EXPENSES
```

Returns:

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Fuel", "type": "EXPENSES" },
    { "id": "uuid", "name": "Salaries", "type": "EXPENSES" }
    /* … */
  ]
}
```

**Mobile usage**: populate the **Category** dropdown on the Add/Edit form from this endpoint. Cache for 5 min (the web uses `staleTime: 1000 * 60 * 5`). The dropdown shows `name`; the submit payload sends `id` as `category_id`.

The categories endpoint also supports POST/PATCH/DELETE — that's the **Manage Expense Categories** screen (separate feature, not in this doc).

---

## A3. Data models — TypeScript shapes from the web (mirror in Dart)

```ts
// Single expense
interface Expense {
  id: string;             // UUID
  name: string;           // e.g. "Diesel — Ikeja branch"
  amount: number;         // NGN, decimal
  date: string;           // "YYYY-MM-DD"
  note: string | null;
  category: ExpenseCategory;
  created_at: string;     // ISO-8601
  updated_at: string;     // ISO-8601
}

interface ExpenseCategory {
  id: string;
  name: string;
  type: "EXPENSES";       // discriminator — the categories endpoint hosts other types too
}

// List pagination wrapper
interface ExpenseListEnvelope {
  limit: number;
  total: number;          // total rows matching the filter (not just on the page)
  pages: number;          // total page count
  links: { next: string | null; previous: string | null };
  results: {
    total_expenses: number;   // sum of `amount` across the filter
    data: Expense[];
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

---

## A4. Screens & user flows (legacy)

### A4.1 Expenses list screen

**Purpose.** Overview of all expense line items for the business with filter + search + pagination.

**Loads on open**

1. `GET /expenses/business/{business_id}/?page=1&limit=30` + the active `start_date` / `end_date` (default: today / today).
2. `GET /categories/business/{business_id}/?type=EXPENSES` (for the filter dropdown).

**UI elements**

- Header: title "Expenses" + Generate Report button + **+ Add Expenses** button + Date range picker.
- **Overview cards row**:
  - **Total Expenses** — `data.results.total_expenses` formatted as NGN.
  - **Expense Account Balance** — 🟡 see Part B (uses mock data on web today; mobile should hide this card until Part B endpoints ship).
- **Tabs**: `Expense Accounts` | `Transactions`. (The Transactions tab uses 🟡 Part B endpoints; treat as future-only on mobile.)

**User actions**

| Action | What happens |
|---|---|
| Tap **+ Add Expenses** | Open Add Expense form (modal on web, full screen recommended on mobile). On subscription failure (`is_subscribed: false` + `role: OWNER`), open the "Subscription Required" prompt instead. |
| Change date range | Re-fetch list with new `start_date`/`end_date`, reset to page 1. |
| Tap **Generate Report** | Hits the existing `/report/generate` endpoint with `reportType: "expenses"` (shared component, separate doc). |
| Tap a row | Navigate to expense detail screen (web doesn't have a detail screen yet — mobile can build one or open Edit directly). |

### A4.2 Add Expense form

**Endpoint.** `POST /expenses/business/{business_id}/`

**Fields** (in order)

| Field | Type | Required | Validation |
|---|---|---|---|
| Name | text input | ✓ | min length 1 — message: "Supply name is required" |
| Amount | numeric input | ✓ | must be a number — submit converts to `Number` |
| Category | dropdown (from §A2) | ✓ | message: "Category is required" |
| Due Date | date picker | ✓ | **Past dates are disabled** on web (`date < today` is unselectable). Mobile must enforce the same. Format on submit: `YYYY-MM-DD`. |
| Note | textarea | ✗ | Only included in payload when non-empty after `.trim()` |

**Submission**

1. Subscription check (block if `OWNER` + not subscribed).
2. Coerce `amount` to number; reject if `NaN`.
3. Format `date` with `YYYY-MM-DD` (local tz — see §0).
4. Build payload omitting `note` when blank.
5. POST. On success: toast "Expenses created successfully", invalidate the list query (mobile: refresh the list), close form.
6. On error: surface `error.message` from the response.

### A4.3 Edit Expense screen

**Endpoint.** `PATCH /expenses/{expense_id}/` — send the full payload (see §A1.4 quirk).

**Loads on open**

1. `GET /expenses/{expense_id}/` — populate the form.
2. `GET /categories/business/{business_id}/?type=EXPENSES` — populate the dropdown.

Same fields and validation as Add. Past dates are disabled (note: this prevents editing an expense to "yesterday" — coordinate with product if the mobile should allow back-dating).

### A4.4 Delete Expense

**Endpoint.** `DELETE /expenses/{expense_id}/`

Should be guarded by a confirmation dialog on mobile (web has a `DeleteExpense` component that opens a confirm modal). On success: toast, remove from local list / refetch.

### A4.5 Filters & search (legacy)

| Filter | Param | Notes |
|---|---|---|
| Search | `search` | Debounced 500 ms; only send when length 0 or ≥ 3 |
| Category | `category` | UUID, not name |
| Date range | `start_date` + `end_date` | `YYYY-MM-DD` |
| Page | `page` | 1-based; reset to 1 on any filter change |
| Limit | `limit` | Default 30 |

All filters are server-side. Don't filter client-side after the response lands — re-fire the query.

### A4.6 Permissions (legacy)

- `business_id` is always required (read or write).
- **Subscription gate**: `OWNER` users must have `is_subscribed: true` to create/edit. Other roles (Manager, Staff) bypass.
- No additional role gating on the legacy CRUD layer. Backend may enforce additional rules per role — the mobile should surface backend errors as toasts and respect 401/403 responses.

---

# 🟡 PART B — PROPOSED: Expense Account Management

This layer drives the new dashboard the merchant sees inside the Expenses page: a single operational expense account with a balance, per-category budgets, money transfers with PIN approval, an approvals queue, and a transactions log.

**Status on web today.** The screens are built and shipping, but every read and write is **mock data** in `expense-accounts/mock-data.ts`. Nothing in this section is wired to a live endpoint. The mobile should:

- Treat the endpoints below as **proposed** — coordinate with backend before implementing.
- Use the data shapes verbatim (the mocks were built from product specs and are likely close to what backend will ship).
- Defer wiring on mobile until backend is ready, OR mirror with mock data for UX parity.

---

## B1. Data model

```ts
type AccountRole = "Owner" | "Manager" | "Staff";

interface AccountUser {
  id: string;
  name: string;
  role: AccountRole;
  initials: string;       // 2-char, derived ("Tobi Olosunde" → "TO")
}

interface ExpenseAccount {
  id: string;
  name: string;                  // "Main Expense Account"
  account_number: string;        // "0114-2308-77"
  bank_name: string;             // "VFD MFB"
  balance: number;               // current available NGN
  monthly_spend: number;         // total amount moved this month
  assigned_user_ids: string[];   // users authorised on this account
  approval_threshold: number;    // transfers above this need a manager approval
  created_at: string;            // ISO-8601
}

type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

interface TransactionAttachment {
  id: string;
  name: string;                  // "fuel-receipt.pdf"
  size: string;                  // pre-formatted human size ("212 KB")
  type: "receipt" | "invoice" | "other";
  url?: string;                  // download URL (mobile may add this)
}

interface ExpenseTransaction {
  id: string;
  reference: string;             // human ref, e.g. "EXP-2026-00432"
  amount: number;                // NGN
  category: string;              // category name string (not id)
  narration: string;
  initiated_by_id: string;       // FK → AccountUser
  approved_by_id?: string;
  approved_at?: string;          // ISO-8601
  status: TransactionStatus;
  created_at: string;            // ISO-8601
  attachments: TransactionAttachment[];
}

interface CategoryBudget {
  budget: number;                // total allocated for the window
  duration_months: number;       // window length
  // Derived (computed client-side from CategoryBudget + transactions):
  //   monthly_budget = budget / duration_months
  //   remaining      = max(0, budget - total_spent)
  //   spent_pct      = round(total_spent / budget * 100)
}

interface CategoryStats {
  category: string;
  total: number;                 // sum of amount where status IN (COMPLETED, APPROVED)
  count: number;
  budget?: CategoryBudget;       // present only when a budget is set
  monthly_budget?: number;
  remaining?: number;
  spent_pct?: number;
}
```

### Fixed category seed (web)

The web ships with 8 preset categories. Backend will likely return these from a categories endpoint (the legacy `EXPENSES` categories from §A2 may be reused, or a new set). The 8 are:

`Fuel`, `Transport`, `Salaries`, `Marketing`, `Logistics`, `Operations`, `Utilities`, `Maintenance`.

The web also supports **custom categories** — if a transaction is logged against a category not in the preset list, the dashboard automatically renders a tile for it.

---

## B2. Proposed endpoints

All proposed — confirm names + shapes with backend before implementing.

### B2.1 Get account + dashboard

```
GET /expense-accounts/business/{business_id}/
```

Returns the single account + computed dashboard stats.

```json
{
  "success": true,
  "data": {
    "account": { /* ExpenseAccount */ },
    "stats": {
      "spent_this_month": 1140000,
      "pending_approvals_count": 3,
      "pending_approvals_amount": 472000,
      "category_stats": [ /* CategoryStats[] */ ]
    },
    "users": [ /* AccountUser[] */ ]
  }
}
```

### B2.2 List transactions

```
GET /expense-transactions/business/{business_id}/
```

Same envelope shape as §A1.1.

**Query params**

| Name | Type | Notes |
|---|---|---|
| `search` | string | Search reference / category / narration (debounced same as legacy) |
| `user` | UUID | `initiated_by_id` |
| `category` | string | category name (not id — categories here are string-typed) |
| `status` | enum | `PENDING` / `APPROVED` / `REJECTED` / `COMPLETED` |
| `start_date` / `end_date` | `YYYY-MM-DD` | |
| `page` / `limit` | int | Default `limit: 10` on this screen (web uses `PAGE_SIZE = 10`) |

### B2.3 Single transaction

```
GET /expense-transactions/{transaction_id}/
```

Returns one `ExpenseTransaction`. Used by the Transaction Details modal.

### B2.4 Create transfer

```
POST /expense-transactions/business/{business_id}/transfer/
```

Used by the **Transfer Money** modal. The web flow is: form → 4-digit PIN → success.

**Body** (multipart — has file attachments)

| Field | Type | Required | Notes |
|---|---|---|---|
| `amount` | number | ✓ | > 0, must be ≤ account balance |
| `category` | string | ✓ | category name (web supports a `__custom__` choice where the merchant types a new one) |
| `narration` | string | ✓ | Min length 1 |
| `pin` | string (4 digits) | ✓ | Account PIN — server verifies |
| `attachments[]` | files | ✗ | **Max 5 files, each ≤ 10 MB** (web limits enforced; backend should mirror) |

**Behaviour**

- If `amount > approval_threshold` (currently ₦100,000), the new transaction goes in with `status: PENDING` and waits for manager approval.
- Otherwise `status: COMPLETED` immediately.
- On PIN failure, return 422 with `{ "error": "INVALID_PIN" }` so the mobile can show the inline error without resetting the form.

**Success response**

```json
{
  "success": true,
  "data": { /* the created ExpenseTransaction */ },
  "message": "Transfer recorded."
}
```

### B2.5 Approve / reject transaction

```
PATCH /expense-transactions/{transaction_id}/approve/
PATCH /expense-transactions/{transaction_id}/reject/
```

No body required. Used by the Transaction Details modal when `status === "PENDING"`. Approver derived server-side from the bearer token.

### B2.6 Set / update category budget

```
PUT /expense-budgets/business/{business_id}/{category}/
```

Body:

```json
{ "budget": 600000, "duration_months": 6 }
```

`category` in the path is the category **name** (URL-encoded). Use PUT semantics — replaces the budget for that category entirely.

### B2.7 Delete category budget

```
DELETE /expense-budgets/business/{business_id}/{category}/
```

Returns 204.

### B2.8 Transactions for a single category

The web's CategoryDetail page filters the global transactions list by category client-side. Two options for mobile:

- Reuse §B2.2 with `category=Fuel` and the date range from the page's preset chips.
- (If backend prefers) dedicated `GET /expense-categories/business/{business_id}/{category}/` returning `{ stats, transactions }` together.

---

## B3. Screens & flows (proposed wiring)

### B3.1 Expenses page (root)

**Loads**

- Legacy list (§A1.1) — for the **Total Expenses** card.
- Account + stats (§B2.1) — for the **Account Balance** card + tab content.

**Layout**

- Header (title + Generate Report + Add Expenses + Date range picker).
- **Overview row** (2 cards): Total Expenses (legacy) + Account Balance (new).
- **2 Tabs**: `Expense Accounts` (dashboard) | `Transactions` (log).
- **Add Expenses** opens the legacy Add form (§A4.2) — *not* the new Transfer flow. The two are separate concepts.

### B3.2 Tab 1 — Expense Accounts (dashboard)

3 KPI widgets + Spend-by-Category grid + Recent Activity + Spend-by-User.

**KPI widgets**

1. **Account Balance** — `account.balance` + subtitle `"{bank_name} · {account_number}"`.
2. **Pending Approvals** — count + sum of amounts (where `status: PENDING`).
3. **Spent This Month** — sum of `category_stats[].total`.

**Spend-by-Category grid** (1 → 2 → 3 → 4 → 5 cols responsive)

Each tile shows: category icon (preset → known Lucide icon; custom → fallback `ShieldCheck`), name, total spent, progress bar (vs. budget), **Transfer** (opens Transfer modal pre-selected to this category), **View More** (navigates to `/expenses/categories/{name}`).

**Recent Activity** (top 6 most-recent transactions across all categories)

Each row → opens Transaction Details modal. Has a **View all** link that switches to the Transactions tab.

**Spend-by-User** — top 5 users by total amount initiated.

### B3.3 Tab 2 — Transactions (log)

Filter bar (search + user + category + status) + count + Clear filters.

Table columns (desktop) / card list (mobile):

| Column | Source |
|---|---|
| Reference | `reference` |
| Category | `category` (with icon from `CATEGORY_META`) |
| Initiated By | `getUserById(initiated_by_id).name` |
| Approved By | `getUserById(approved_by_id).name` or "—" |
| Amount | `formatToNaira(amount)` |
| Status | pill from `STATUS_META[status]` |
| Date | `moment(created_at).format("MMM D, h:mm A")` |

PAGE_SIZE = 10. Tap a row → Transaction Details modal.

### B3.4 Transaction Details modal

Hero with category icon + amount + status pill.

**Accountability section** — Initiator row + Approver row (each shows name, role badge, timestamp).

**Supporting documents** — list of `attachments[]` with icon by type (receipt 📄, invoice 🧾, other 📎). Each is downloadable.

**Narration** — free text.

**Actions** (only when `status: PENDING`):

- **Reject** → `PATCH …/reject/` → close modal, refetch list.
- **Approve** → `PATCH …/approve/` → close modal, refetch list.

Otherwise the footer is just a **Close** button.

### B3.5 Transfer Money modal (3 steps)

**Step 1 — Form**

| Field | Type | Required | Validation |
|---|---|---|---|
| Amount | numeric | ✓ | > 0, ≤ `account.balance` |
| Category | dropdown (preset list) + "Other" option (free-text) | ✓ | Must resolve to a non-empty string |
| Narration | textarea | ✓ | Min length 1 ("Add a short narration so this expense is auditable.") |
| Attachments | files (max 5, ≤10 MB each) | ✗ | |

Shows an inline info banner when `amount > approval_threshold` → "Above ₦100,000 — this will need manager approval".

**Step 2 — PIN**

4-digit numeric PIN entry, one input per cell. Auto-advance on entry, backspace moves back, paste fills all 4. Validates client-side that all 4 cells filled; backend verifies the value.

**Step 3 — Success**

Confirmation with the new transaction reference + a "View transaction" CTA.

### B3.6 Category detail page (`/expenses/categories/{category}`)

Full page (not modal).

**Header** — back arrow + breadcrumb + category icon + name.

**4 stat tiles** — Budget / Spent / Remaining / Monthly Target.

**Progress bar** — green/amber/red tone based on `spent_pct` (≤80 green, 80–100 amber, >100 red).

**Month preset chips** — `This month` / `Last month` / `Last 3 months` / `Last 6 months` / `YTD` / `Custom` (opens a date-range picker).

**Filter row** — search + user + status + the selected month range.

**Transactions table + mobile cards + pagination** (PAGE_SIZE = 10).

**Modals available** — `SetCategoryBudgetModal` (the "Set / Edit Budget" CTA in the header), `TransferMoneyModal` (the "Transfer to this category" CTA), `TransactionDetailsModal`.

### B3.7 Set Category Budget modal

| Field | Type | Required | Notes |
|---|---|---|---|
| Total Budget | numeric | ✓ | > 0 |
| Duration (months) | numeric or chip (1 / 3 / 6 / 12) | ✓ | ≥ 1 |
| Monthly target | **derived display only** | — | `budget / duration` |

Submit → PUT (§B2.6) → toast → close.

---

## B4. Status & enum reference

```ts
type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

const STATUS_META = {
  PENDING:   { label: "Pending",   pill: amber-50, dot: amber-500 },
  APPROVED:  { label: "Approved",  pill: sky-50,   dot: sky-500   },
  REJECTED:  { label: "Rejected",  pill: rose-50,  dot: rose-500  },
  COMPLETED: { label: "Completed", pill: emerald-50, dot: emerald-500 },
};
```

Category → icon mapping (from `CATEGORY_META`):

| Category | Icon | Tone |
|---|---|---|
| Fuel | Flame | amber |
| Transport | Truck | sky |
| Salaries | Wallet | emerald |
| Marketing | Megaphone | violet |
| Logistics | Briefcase | indigo |
| Operations | Cog | rose |
| Utilities | Zap | yellow |
| Maintenance | Wrench | teal |
| *(custom / unknown)* | ShieldCheck | slate |

---

## B5. Permissions (proposed)

- **All endpoints** require an authenticated bearer token + `business_id` from the URL.
- **Approval endpoints** (§B2.5) should reject unless the bearer's role is `Owner` or `Manager`. Surface as 403.
- **PIN verification** on the transfer endpoint (§B2.4) is the primary gate for creating transactions — anyone with the PIN can initiate.
- **Budget management** (§B2.6, §B2.7) — `Owner` only. Mobile should hide the "Set Budget" CTA for non-owners.

(Coordinate with backend; these reflect the web's UX intent.)

---

# Cross-cutting reference

## Pagination contract (both layers)

```json
{
  "data": {
    "limit": 30,
    "total": 42,
    "pages": 2,
    "links": { "next": "…", "previous": null },
    "results": {
      "data": [ /* items */ ],
      /* + any aggregate stats specific to the endpoint */
    }
  },
  "success": true,
  "message": "…"
}
```

- `total` is the count across all pages, not just the current page.
- `pages` = `ceil(total / limit)`.
- Reset to `page=1` on **any** filter change.

## File attachments

The legacy CRUD doesn't have attachments. The new Transfer flow does (§B2.4):

- Multipart upload with the form payload.
- Client-side limits: max 5 files, each ≤ 10 MB.
- Allowed types per the web: any (web doesn't restrict MIME, but typed UI hints suggest receipts → PDF/image, invoices → PDF, other → any).
- Submission: `attachments[]` field in the multipart body.

## Error envelope (all endpoints)

```json
{
  "success": false,
  "error": "<machine-friendly key>",
  "message": "<human-readable>",
  "details": {
    "missing_fields": ["name"],
    "received": { /* the bad payload */ }
  }
}
```

Surface `message` as the toast on mobile; log `details` for diagnostics.

## Manual verification scenarios

After mobile implementation, walk through these to confirm parity with web:

**Legacy CRUD (🔵)**

1. Cold open `/expenses` with no expenses → empty state, Total Expenses = ₦0.
2. Add an expense with `note: ""` → outgoing payload should **not** contain a `note` key.
3. Add an expense as a non-subscribed Owner → the create attempt is blocked, "Subscription Required" modal appears, no network call.
4. Add an expense as a Manager / Staff → bypasses the subscription gate.
5. Set search to "fu" (2 chars) → no network request. Set to "fue" → one request fires.
6. Change date range → request fires with new `start_date` + `end_date` and `page=1`.
7. Edit an expense → loaded form pre-fills from `GET /expenses/{id}/`. Save updates all fields.
8. Delete with confirmation → confirms before DELETE, list refreshes on success.
9. Category dropdown options come from `categories?type=EXPENSES` — verify no hard-coded list.

**New Account Management (🟡 — once backend ships)**

1. Account Balance card shows `bank_name · account_number`.
2. Pending Approvals widget count matches `status: PENDING` transactions.
3. Transfer ₦50,000 (below threshold) → status: `COMPLETED` immediately. Transfer ₦150,000 (above threshold) → status: `PENDING`, appears in approvals queue.
4. Wrong PIN → server returns 422, mobile shows inline error and does **not** reset the form.
5. Attachment over 10 MB → rejected client-side before submit.
6. Reject pending transaction as Manager → status flips to `REJECTED`, refunds nothing (the money was never moved).
7. Set a category budget of ₦600,000 / 6 months → monthly target reads ₦100,000.
8. Category Detail page → preset chip "Last month" applies the correct date range; transactions filter accordingly.

---

## Appendix — file references (web)

For backend or QA folks who want to verify a behaviour against the web source:

| Concern | Web file |
|---|---|
| Top-level page | [`sink/src/app/(dashboard)/expenses/Expenses.tsx`](../src/app/(dashboard)/expenses/Expenses.tsx) |
| Add Expense form (legacy) | [`sink/src/app/(dashboard)/expenses/AddExpenses.tsx`](../src/app/(dashboard)/expenses/AddExpenses.tsx) |
| Edit Expense form (legacy) | [`sink/src/app/(dashboard)/expenses/[id]/EditExpense.tsx`](../src/app/(dashboard)/expenses/[id]/EditExpense.tsx) |
| Delete confirmation | [`sink/src/app/(dashboard)/expenses/DeleteExpense.tsx`](../src/app/(dashboard)/expenses/DeleteExpense.tsx) |
| Legacy expense hook | [`sink/src/hooks/useExpensesHook.tsx`](../src/hooks/useExpensesHook.tsx) |
| Legacy API (CRUD) | [`sink/src/api/expenses/*.ts`](../src/api/expenses/) |
| Legacy proxy routes | [`sink/src/app/api/expenses/[id]/**/route.ts`](../src/app/api/expenses/[id]/) |
| Account dashboard view | [`sink/src/app/(dashboard)/expenses/expense-accounts/ExpenseAccountsView.tsx`](../src/app/(dashboard)/expenses/expense-accounts/ExpenseAccountsView.tsx) |
| Transactions log view | [`sink/src/app/(dashboard)/expenses/expense-accounts/ExpenseTransactionsView.tsx`](../src/app/(dashboard)/expenses/expense-accounts/ExpenseTransactionsView.tsx) |
| Account Balance card | [`sink/src/app/(dashboard)/expenses/expense-accounts/AccountBalanceCard.tsx`](../src/app/(dashboard)/expenses/expense-accounts/AccountBalanceCard.tsx) |
| Transfer Money modal (3-step) | [`sink/src/app/(dashboard)/expenses/expense-accounts/TransferMoneyModal.tsx`](../src/app/(dashboard)/expenses/expense-accounts/TransferMoneyModal.tsx) |
| Transaction Details modal | [`sink/src/app/(dashboard)/expenses/expense-accounts/TransactionDetailsModal.tsx`](../src/app/(dashboard)/expenses/expense-accounts/TransactionDetailsModal.tsx) |
| Set Category Budget modal | [`sink/src/app/(dashboard)/expenses/expense-accounts/SetCategoryBudgetModal.tsx`](../src/app/(dashboard)/expenses/expense-accounts/SetCategoryBudgetModal.tsx) |
| Category Detail page | [`sink/src/app/(dashboard)/expenses/categories/[category]/CategoryDetail.tsx`](../src/app/(dashboard)/expenses/categories/[category]/CategoryDetail.tsx) |
| Mock data + shape helpers | [`sink/src/app/(dashboard)/expenses/expense-accounts/mock-data.ts`](../src/app/(dashboard)/expenses/expense-accounts/mock-data.ts) |
