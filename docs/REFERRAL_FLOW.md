# Referral Commission & Bonus — Web Implementation Documentation

> **Audience.** Devs touching the Referral feature (dashboard, per-business detail, signup code field, withdrawal flow). This is the *web* implementation doc. The flow has no mobile doc yet — mirror this when the mobile flow ships.

The referral program lets a merchant generate a personal referral code, share it as part of a signup link, and earn commission as the referred businesses subscribe to Sync360 plans. The dashboard exposes two views (overview list + per-business detail) and one outbound action (withdraw earnings).

---

## 1. Surfaces & routes

| Route | Page wrapper | Component | What it does |
|---|---|---|---|
| `/referral` | `app/(dashboard)/referral/page.tsx` | `Referral.tsx` | Dashboard — hero, code + share link, 3 summary cards, available/pending wallet cards, tracking table |
| `/referral/[id]` | `app/(dashboard)/referral/[id]/page.tsx` | `ReferralDetail.tsx` | Per-business detail — reward allocation, progress bar, recent subscription activity |
| `/signup` (referral field) | `app/(auth)/signup/page.tsx` | `SignUp.tsx` | Optional **Referral Code** input — submitted alongside name/email/password |

Two modals:

| Component | Purpose |
|---|---|
| `WithdrawModal` (in `referral/`) | Withdraw available balance — amount + bank account; UI-only today (no backend endpoint) |

---

## 2. File map

### `src/app/(dashboard)/referral/`

| File | Responsibility |
|---|---|
| `Referral.tsx` | Dashboard. Calls `useReferralDashboardQuery`, derives all derived totals, copy/share helpers, opens `WithdrawModal`. |
| `[id]/ReferralDetail.tsx` | Detail view. Calls `useReferralBusinessQuery(id)`. Owns its own skeleton (`ReferralDetailSkeleton`) that mirrors the loaded layout. |
| `[id]/page.tsx` | Awaits `params`, renders `<ReferralDetail id={id} />`. |
| `WithdrawModal.tsx` | Amount + bank-account form. Validates against `availableBalance`. Currently `setTimeout(700)` — wire to backend when endpoint ships. |
| `data.ts` | **Not** mock data anymore. Houses: `ReferralStatus` enum, `STATUS_META` (pill styles), `normaliseReferralStatus()` mapper, `buildReferralLink()` helper. |
| `page.tsx` | Bare wrapper that mounts `<Referral />`. |

### `src/app/(auth)/signup/`

| File | Responsibility |
|---|---|
| `SignUp.tsx` | Form UI — adds the optional "Referral Code" field below Confirm Password. |
| `../../hooks/auth/useSignUpForm.ts` | Schema + submit. The zod schema includes `referal: z.string().trim().max(50).optional()`; submit only includes `referal` in the payload when non-empty (backend has `minLength:1` if present). |

### API client

| File | Responsibility |
|---|---|
| `src/api/referral/referral.ts` | `useReferralDashboardQuery` (GET dashboard) + `useReferralBusinessQuery(id)` (GET single). Both `staleTime: 1 min`. |

### Next.js proxy routes

All add `Authorization: Bearer <accessToken>` from cookies.

| Web URL | Backend URL | Method |
|---|---|---|
| `/api/referral/dashboard` | `referral/dashboard/` | GET |
| `/api/referral/business/[business_id]` | `referral/business/{business_id}/` | GET |

---

## 3. Data flow

```
/referral                              /referral/[id]
    │                                       │
    ▼                                       ▼
Referral.tsx                          ReferralDetail.tsx
    │                                       │
useReferralDashboardQuery             useReferralBusinessQuery(id)
    │                                       │
    ▼                                       ▼
/api/referral/dashboard               /api/referral/business/{id}
    │                                       │
    ▼                                       ▼
GET referral/dashboard/               GET referral/business/{id}/
    │                                       │
    ▼                                       ▼
{ code, summary, tracking_table[] }   { business_name, status,
                                         days_remaining,
                                         reward_allocation,
                                         recent_activity[] }


/signup                          (one-shot, no query — passed in signup body)
    │
    ▼
SignUp.tsx (form) → useSignUpForm.onSubmit
    │
    ▼
{ firstname, lastname, phone, email, password, referal? } → POST /auth/signup/
```

The dashboard and detail are independent queries — opening detail doesn't refetch the dashboard, and vice versa. The withdraw mutation (when it lands) should invalidate both keys.

---

## 4. Backend contract

### GET `referral/dashboard/`

```json
{
  "code": "OLUWT4S",
  "summary": {
    "total_referrals": 1,
    "pending_rewards": 20000,
    "total_paid_commission": 0,
    "available_balance": 0
  },
  "tracking_table": [
    {
      "business_id": "89da63be-1912-49b0-83a9-96136882b161",
      "business_name": "Tayo Foods",
      "status": "Not Subscribed",
      "pending": 20000,
      "unlocked": 0,
      "expires_days": 168
    }
  ]
}
```

### GET `referral/business/{business_id}/`

```json
{
  "business_name": "Tayo Foods",
  "status": "Not Subscribed",
  "days_remaining": 168,
  "reward_allocation": {
    "total_reward": 20000,
    "unlocked": 0,
    "pending": 20000,
    "percentage_earned": 0
  },
  "recent_activity": []
}
```

### POST `auth/signup/` (referral field)

```json
{
  "firstname": "…",
  "lastname": "…",
  "email": "…",
  "phone": "+234…",
  "password": "…",
  "referal": "OLUWT4S"   // optional, minLength 1 when present
}
```

> **Sic.** The backend field is `referal` (single L). Match it exactly. The schema has a code comment to flag it; the IDE will spell-check it as "Misspelled word" — that warning is intentional.

---

## 5. Reward & commission model

Mental model from the API:

- Each referred business earns the referrer a **fixed total reward** (`reward_allocation.total_reward`, currently ₦20,000 per business based on observed data).
- The reward is split into two buckets:
  - **`pending`** — locked until the referred business hits some condition (presumed: pays for / renews a subscription).
  - **`unlocked`** — already credited to the referrer; counts toward `available_balance` on the dashboard.
- `percentage_earned = unlocked / total_reward * 100` (server returns; frontend has a local fallback).
- `days_remaining` is the days left on the referral window. After 0, the remaining `pending` is presumably forfeited (not yet confirmed with backend).

Dashboard summary fields, mapped to UI:

| API field | Card | Notes |
|---|---|---|
| `summary.total_referrals` | Total Referrals | Count of unique businesses you've referred |
| `summary.pending_rewards` | Pending Rewards | Sum of `pending` across all referred businesses |
| `summary.total_paid_commission` | Total Paid Commission | Lifetime payout |
| `summary.available_balance` | Available Balance (wallet) | What the merchant can withdraw right now |

> **Note: `pending_balance` is not returned separately.** The dashboard derives it from `summary.pending_rewards` — they're the same number in the current contract. If the backend later distinguishes them (e.g. money still locked vs. money pending bank transfer), update the derivation in `Referral.tsx`.

---

## 6. The dashboard — `Referral.tsx`

### Hero + summary cards

Static brand banner + 3 summary cards in a 1→3 col grid. Each card has a loading skeleton state (`isLoading` from the query).

### Referral link

- `referralCode` = `dashboard.code` (e.g. `"OLUWT4S"`).
- `referralLink` is built client-side via `buildReferralLink(code)`:
  ```ts
  buildReferralLink("OLUWT4S")
  // → "https://<current-origin>/signup?referal=OLUWT4S"
  ```
  Uses `window.location.origin` so the link points to whatever environment the dashboard is loaded from (dev → staging → prod all just work). The `?referal=` query param matches the field name the signup form binds.

- **Copy** uses `navigator.clipboard.writeText`, toasts on failure, and flashes the button to "Copied" for 1.8s.
- **Share** uses the Web Share API where available, falls back to copy.

### Wallet cards

Two side-by-side cards (lg+):

- **Available Balance** (`summary.available_balance`) — emerald, with a **Withdraw Funds** button. Disabled when balance ≤ 0 or loading.
- **Pending Balance** (`pending_balance = summary.pending_rewards`) — amber, no action.

### Tracking table

- Renders `dashboard.tracking_table[]`.
- Each row links to `/referral/{business_id}`.
- **Status pill** uses `STATUS_META[normaliseReferralStatus(row.status)]`. The normaliser maps free-text backend values ("Not Subscribed" / "Active Subscriber" / "Lapsed") to the local `ReferralStatus` enum.
- **Expires** column shows `${expires_days} days` or `"Expired"` when 0.
- Renders as a real table on `sm:` and up, mobile card list below.
- Empty state when `tracking_table.length === 0` ("No referred businesses yet. Share your link to start earning.").

### Error banner

If the dashboard query errors, a rose-tinted banner appears above the summary with a **Retry** button (calls `refetch()`).

---

## 7. The detail screen — `ReferralDetail.tsx`

### Layout (after data loads)

1. **Header** — back arrow + business name + status pill + days-remaining hint.
2. **Reward Allocation card** — three tiles (Total Reward / Unlocked / Pending) + progress bar driven by `reward_allocation.percentage_earned`.
3. **Recent Subscription Activity card** — table on `sm:`, mobile list otherwise. Shows `date` / `subscription` / `reward` per entry. Empty state when `recent_activity.length === 0`.

### Progress bar logic

```ts
progressPct =
  typeof allocation.percentage_earned === "number"
    ? clamp(0, 100, Math.round(allocation.percentage_earned))
    : allocation.total_reward
      ? Math.round((allocation.unlocked / allocation.total_reward) * 100)
      : 0;
```

Prefer the backend-computed `percentage_earned`; fall back to a derived ratio so the bar never reads 0% just because the field was missing on a partial payload.

### Loading skeleton

`ReferralDetailSkeleton` is defined in the same file and mirrors the real layout: header bars, allocation card with 3 tile placeholders + progress bar, activity card with 4 row placeholders. Same pattern used in [`orders/[id]/ViewOrder.tsx`](../src/app/(dashboard)/orders/[id]/ViewOrder.tsx). Layout doesn't jump when data lands.

### Error state

If `isError` or `!business`:

- Rose alert icon + "Couldn't load this referral" + helpful copy.
- Buttons: **Retry** (only when `isError`) + **Back to referrals**.

---

## 8. Status normalisation

The backend returns human-readable status strings. Local UI uses an enum so pill colours don't break when the wording changes.

```ts
type ReferralStatus = "active" | "not-subscribed" | "lapsed";

normaliseReferralStatus(raw)
// "Active Subscriber"  → "active"
// "Not Subscribed"     → "not-subscribed"  (default fallback too)
// "Lapsed"             → "lapsed"
```

`STATUS_META` provides the label + pillClass + dotClass for each enum value. To add a new status, extend both the enum and the map; if backend rolls out a new string, extend the normaliser's branches.

---

## 9. Signup integration

The **Referral Code** field on the signup form (`SignUp.tsx`) is optional, free-text, length-capped at 50, and trimmed before submission.

In `useSignUpForm.ts`:

```ts
// Schema:
referal: z.string().trim().max(50, "Referral code looks too long.").optional(),

// Defaults:
referal: "",

// Payload — only include when non-empty (backend requires minLength:1 if present):
const referal = values.referal?.trim();
const payload = {
  firstname, lastname, phone, email, password,
  ...(referal ? { referal } : {}),
};
```

Two ways it gets pre-filled:

1. Manual paste — the merchant types a friend's code.
2. Referral link — `buildReferralLink` produces `…/signup?referal=CODE`. *The signup page does not yet auto-fill from the query string* — if/when product wants that, add:
   ```ts
   const params = useSearchParams();
   form.setValue("referal", params.get("referal") || "");
   ```
   in the `SignUp` component (inside a `useEffect` so it runs once on mount).

---

## 10. WithdrawModal

- Inputs: **Amount** (numeric) + **Bank Account** (free text today).
- Validation: amount > 0, amount ≤ availableBalance, bankAccount not blank.
- On submit: `setTimeout(700)` simulates the round-trip, toasts success, resets, closes.

Wire to real endpoint when ready: probably `POST referral/withdraw/` with `{ amount, bank_account }`. On success the new mutation must invalidate `[referral.getDashboard]` so `available_balance` updates immediately.

---

## 11. React Query keys

From `src/constants/query-key.ts`:

```ts
referral: {
  getDashboard: "get-referral-dashboard",
  getBusiness:  "get-referral-business",
}
```

- Dashboard key is just `[getDashboard]`.
- Detail key is `[getBusiness, businessId]`.
- `staleTime: 1 min` on both — the data isn't volatile but we don't want it stuck.

Future mutations:

| Mutation | Invalidate |
|---|---|
| Withdraw | `[getDashboard]` (summary fields change) |
| Anything that changes a referred business's status | `[getDashboard]` + `[getBusiness, businessId]` |

---

## 12. Conventions & gotchas

1. **The field name is `referal` (sic).** Single L. Match the backend swagger exactly. IDE spell-check will flag it — there's a code comment to explain why; don't "fix" the spelling.

2. **`buildReferralLink` returns `""` on the server.** Guarded with `typeof window === "undefined"`. Safe to call during SSR — just shows "Sign in to generate your referral link" briefly until client hydration runs.

3. **Status string is free-text from the backend.** Always pipe through `normaliseReferralStatus()` before keying into `STATUS_META`. New status strings default to `"not-subscribed"` — safer than guessing "active".

4. **`pending_balance` is derived, not direct.** The dashboard's "Pending Balance" wallet card reuses `summary.pending_rewards`. If the backend later returns a separate field (e.g. `pending_payout`), wire it in `Referral.tsx` and stop deriving.

5. **Progress prefers server, falls back to ratio.** `percentage_earned` may be missing on partial responses; the fallback formula ensures the bar isn't visually wrong. Don't remove the fallback — it's load-bearing.

6. **Skeleton mirrors layout.** `ReferralDetailSkeleton` exists specifically so the page doesn't reflow on data load. Same on the dashboard — every metric card has an explicit loading state via the `loading` prop on `SummaryCard`. Copy this pattern when adding new metrics.

7. **WithdrawModal is mocked.** The 700ms timeout is the placeholder. When wiring, also disable the button while the real mutation is pending and surface backend error messages from `error.message`.

8. **No real-time updates.** A successful action (e.g. withdraw, status change) requires query invalidation to refresh the UI. The `Retry` button on errors calls `refetch()` — copy that pattern if you add another action.

9. **Signup page doesn't auto-fill `referal` from URL.** The `buildReferralLink` produces `?referal=CODE` but the form doesn't read it on mount. Easy to add (see section 9) — left out today because product hasn't confirmed the auto-fill UX.

10. **Detail page expects `recent_activity` array.** The shape per entry is `{ date?, subscription?, reward? }` (all optional + a passthrough index signature). Date is formatted with `moment(act.date).format("MMM D, YYYY")` and falls back to `"—"`. If backend ships richer fields (e.g. plan name, subscription period), extend the row rendering — the type already allows extra keys.

---

## 13. Quick "where do I…" cheat sheet

| Task | File / change |
|---|---|
| Change reward amount labels | `Referral.tsx` hero copy ("Earn up to ₦20,000…") |
| Add a new status label | `data.ts` — extend `ReferralStatus`, `STATUS_META`, `normaliseReferralStatus` branches |
| Auto-fill referral code from `?referal=` on signup | `SignUp.tsx` — see section 9 snippet |
| Wire the Withdraw API | `WithdrawModal.tsx` `handleSubmit` — replace `setTimeout`; invalidate `[referral.getDashboard]` |
| Add a new dashboard metric | Backend returns it in `summary` → add a `<SummaryCard>` in `Referral.tsx` |
| Add a new column to tracking table | `Referral.tsx` table + mobile card list (both grids) |
| Change the referral link format | `data.ts` `buildReferralLink` (and consider redirecting the old format on the signup page) |
| Add filters to the tracking table | `Referral.tsx` — local React state + client-side filter on `trackingTable` (it's already in memory) |

---

## 14. Manual verification scenarios

1. **First-time user, no referrals.** Dashboard loads with `total_referrals: 0`, code populated, empty tracking table → "No referred businesses yet" copy renders. Withdraw button is disabled (balance = 0).

2. **Copy + share link.** Click **Copy Link** → button flashes "Copied" for ~2s. Paste the link → goes to `/signup?referal=<your_code>`.

3. **Signup with referral.** Sign up a new account using the link. Network panel for `POST /auth/signup/`: body should contain `referal: "<code>"`. Sign up without typing one → body should omit `referal` entirely (not send empty string).

4. **Status normalisation.** Mock a backend response with `status: "Some Unknown Status"`. Status pill should render as **"Not Subscribed"** (safe fallback).

5. **Detail page navigation.** Click a row in the tracking table → `/referral/<id>` loads; skeleton appears briefly; allocation card + progress bar render; activity card shows empty state when `recent_activity: []`.

6. **Detail error.** Visit `/referral/<bad-id>` → "Couldn't load this referral" error state with **Retry** + **Back to referrals**. Retry calls `refetch()`.

7. **Withdraw flow.** With a non-zero `available_balance`, open Withdraw modal → try to withdraw more than the balance → toast "Amount exceeds your available balance." Withdraw within range → success toast.

8. **Detail page layout stability.** Hard-reload `/referral/<id>` and watch for layout jump. The skeleton's box sizes should match the real cards so nothing shifts when data resolves.
