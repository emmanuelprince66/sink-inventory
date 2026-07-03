# Shipbubble Integration — Web Implementation Documentation

> **Audience.** Devs wiring or maintaining the Shipbubble logistics integration in **General Settings** (and any downstream order/delivery surfaces that read its config). This document covers the *web* implementation. See [`ORDERS_FLOW.md`](./ORDERS_FLOW.md) for how orders consume the saved Shipbubble setup.

Shipbubble is a Nigerian multi-carrier shipping aggregator. The integration lets a merchant:

1. Accept Shipbubble's terms (T&C agreement).
2. Configure their pickup address, default shipping category, and default package size.
3. Have Shipbubble appear as a delivery partner in the order flow.

The setup is persisted on the merchant's **business** record (`business.shipbubble`) so every order can read it without re-asking.

---

## 1. Surfaces & entry points

| Where | Component | What happens |
|---|---|---|
| Operations → General Settings → **Automated Shipping** → Logistics Integrations card | `AutomatedShipping.tsx` → `PartnerCard` (Shipbubble row) | Toggle to enable/disable + **Configure** button to open the settings form |
| Operations → Connected Apps → **Shipbubble** card | `ConnectedApps.tsx` | "Connect" CTA — opens the same settings modal directly |
| Order flow → Assign Delivery | `AssignDeliveryModal.tsx` (in `(dashboard)/orders/`) | Shipbubble listed as a partner option (currently `MOCK_PARTNERS`; the integrated path will read from `business.shipping_companies`) |

There is **no dedicated route** — Shipbubble lives entirely inside General Settings + Connected Apps. The detail view is always a modal.

---

## 2. File map

### `src/app/(dashboard)/operations/general-settings/`

| File | Responsibility |
|---|---|
| `AutomatedShipping.tsx` | The "Automated Shipping" tab. Hosts the Shipbubble + Chowdeck partner cards. Owns the toggle / configure state. |
| `ShipbubbleAgreementModal.tsx` | T&C / "Connect" modal. Shows the four terms blocks + agreement checkbox. Currently UI-only (no API on accept) — see gotcha #1. |
| `ShipbubbleSettingsModal.tsx` | The real Configure form. 3 step tiles: Pickup Address (street/city/state/phone/landmark) → Shipping Category → Default Package Size. Saves via the hook. |
| `BoxSizePickerModal.tsx` | Picker rendered from inside the settings modal — grid of box-size tiles with real cloudinary images + Lucide fallback. |

### `src/app/(dashboard)/operations/connected-apps/`

| File | Responsibility |
|---|---|
| `ConnectedApps.tsx` | Alt entry — "Connect" button on the Shipbubble card opens `ShipbubbleSettingsModal` directly. |

### Hook

| File | Responsibility |
|---|---|
| `src/hooks/useShipbubbleHook.tsx` | The brain. Fetches the business + reference lists (box sizes, categories), holds local form state, hydrates from the business, builds the JSON PATCH body, runs validation, calls the mutation. Three callers: `AutomatedShipping`, `ShipbubbleSettingsModal`, `ConnectedApps` (via the modal). |

### API client

| File | Responsibility |
|---|---|
| `src/api/shipping/shipbubble.ts` | `useFetchBoxSizesQuery` (GET box-size catalogue) + `useFetchShippingCategoriesQuery` (GET shipping categories). Both cache for 1h via `staleTime`. |
| `src/api/business/create-business.ts` | `useUpdateBusinessShipbubbleMutation` — JSON PATCH; lives in the business file because it updates the business record, not a Shipbubble-owned object. |

### Next.js proxy routes

All add `Authorization: Bearer <accessToken>` from cookies and forward to `${BaseUrl}…`.

| Web URL | Backend URL | Method | Body |
|---|---|---|---|
| `/api/order/shipping_dimention` | `order/shipping_dimention/` | GET | — |
| `/api/order/shipping_category` | `order/shipping_category/` | GET | — |
| `/api/businesses/update-shipbubble` | `business/{business_id}/` | PATCH (JSON) | `{ shipbubble_settings, shipping_companies }` |

> **Why a dedicated update route.** The general `update-business` proxy is **multipart/FormData** (it also handles logo/banner uploads). DRF can't deserialize a JSON-stringified nested object inside a multipart field — `shipbubble_settings` would silently come back as `null`. The dedicated route sends a real `application/json` body. See gotcha #2.

---

## 3. Data flow

```
AutomatedShipping (toggle UI-only)        ConnectedApps ("Connect" CTA)
        │                                          │
        ├── opens ShipbubbleAgreementModal         ├── opens ShipbubbleSettingsModal
        └── opens ShipbubbleSettingsModal          │
                       │                            │
                       ▼                            ▼
              ┌──────────────────────────────────────────┐
              │           useShipbubbleHook              │
              │                                          │
              │ reads business via useFetchBusinessById  │
              │ reads box sizes via useFetchBoxSizesQuery│
              │ reads categories via useFetchShippingCategoriesQuery │
              │ writes via useUpdateBusinessShipbubbleMutation        │
              └──────────────────────────────────────────┘
                       │
                       ▼ JSON PATCH
        /api/businesses/update-shipbubble  →  PATCH business/{id}/
                       │
                       ▼
              { shipbubble: {...}, shipping_companies: ["SHIPBUBBLE", ...] }
                       │
                       ▼ invalidates getBusinessById; hook auto-hydrates
                  next render reflects the saved state
```

Note the **asymmetry** between read and write field names:

- **Write field** (sent in the PATCH body): `shipbubble_settings`
- **Read field** (returned by the GET): `shipbubble`

The hook handles both — `buildPatchPayload` writes `shipbubble_settings`, `hydrateFromBusiness` reads `business?.shipbubble || business?.shipbubble_settings`. **Do not "fix" this asymmetry** without coordinating with the backend; it's the documented contract per the Swagger spec.

---

## 4. Backend contract

### GET `business/{id}/` (read side)

Relevant slice of the response:

```json
{
  "data": {
    "id": "…",
    "name": "…",
    "shipbubble": {
      "street": "House 5, plot 6, Goshen estate, Ajibode",
      "city": "Ibadan",
      "state": "Oyo",
      "phone": "+2348012345678",
      "landmark": "Behind University of Ibadan",
      "category": { "category_id": 77179563, "category": "Electronics and gadgets" },
      "package_size": {
        "name": "Big Box",
        "description_image_url": "https://res.cloudinary.com/…",
        "height": 34, "length": 32, "width": 34, "max_weight": 12
      }
    },
    "shipping_companies": ["SHIPBUBBLE"]
  }
}
```

When the merchant hasn't configured Shipbubble yet, `shipbubble` is `null` and `shipping_companies` is `[]`.

### PATCH `business/{id}/` (write side)

JSON body. Only the fields we care about — the rest of the business record is untouched.

```json
{
  "shipbubble_settings": {
    "street": "…",
    "city": "…",
    "state": "…",
    "phone": "+234…",
    "landmark": "…",
    "category": { "category_id": 2178251, "category": "Groceries" },
    "package_size": {
      "name": "Big Box",
      "description_image_url": "https://…",
      "height": 34, "width": 34, "length": 32, "max_weight": 12
    }
  },
  "shipping_companies": ["SHIPBUBBLE"]
}
```

`shipping_companies` is enum-restricted to `["SHIPBUBBLE", "CHOWDECK"]` per swagger.

### GET `order/shipping_dimention/` — box-size catalogue

Returns an array. The library's images are real cloudinary URLs the merchant has seen on Shipbubble's own UI.

```json
[
  { "name": "Envelope", "description_image_url": "…", "height": 2, "width": 35, "length": 25, "max_weight": 0.5 },
  { "name": "Big Box",  "description_image_url": "…", "height": 34, "width": 34, "length": 32, "max_weight": 12 },
  …
]
```

### GET `order/shipping_category/` — shipping categories

```json
[
  { "category_id": 98190590, "category": "Hot food" },
  { "category_id": 77179563, "category": "Electronics and gadgets" },
  …
]
```

---

## 5. The hook — `useShipbubbleHook`

Single export. Three optional inputs (only `autoHydrate` exists today; the rest are positional react-query overrides). What it returns:

| Group | Field | Notes |
|---|---|---|
| **Reference data** | `boxSizes`, `boxSizesLoading`, `categories`, `categoriesLoading` | From the two GET endpoints, 1h `staleTime` |
| **Business** | `business`, `businessLoading`, `business_id` | `business_id` from `useBusinessStore` |
| **Form state** | `settings`, `companies`, `updateSetting`, `setSettings`, `toggleCompany`, `resetFromBusiness` | Local React state — `updateSetting(key, value)` is type-safe |
| **Mutation** | `save(overrides?, callbacks?)`, `validateAddress`, `validateSettings`, `isSaving` | See "Save flow" below |
| **Derived** | `isShipbubbleEnabled`, `isChowdeckEnabled`, `hasPickup`, `isConfigured` | Computed from `companies` and `business` |

### Settings shape

```ts
interface ShipbubbleSettings {
  street: string;
  city: string;
  state: string;       // canonical NG state name from country-state-city
  phone: string;       // E.164 from PhoneInput, e.g. "+2348012345678"
  landmark: string;
  category: ShippingCategoryOption | null;
  packageSize: BoxSizeOption | null;
}
```

### Hydration

`hydrateFromBusiness` runs once when the business query resolves (controlled by `didHydrate`). It populates `settings` and `companies` from `business.shipbubble || business.shipbubble_settings`. After the first hydrate it doesn't re-run automatically — that's why both modals call `resetFromBusiness()` in a `useEffect(open)`: every time a modal re-opens, the form gets freshly populated from the latest server state.

### Validators

Two — different callers need different strictness:

```ts
validateAddress(candidate?) → null | "Please fill in street." | …
  // checks street / city / state / phone

validateSettings(candidate?) → null | …
  // = validateAddress() + checks category + packageSize
```

The settings modal uses `validateSettings` (full check); validators are exposed so future flows can validate subsets without going through `save`.

### Save flow

```ts
save(
  { shippingCompanies?: ShippingCompany[]; settingsPatch?: Partial<ShipbubbleSettings> },
  { onSuccess?: () => void; onError?: () => void },
)
```

1. Resolves the effective settings + companies (overrides win over local state).
2. **No inline validation** — callers must call a validator first. This lets the toggle path send a companies-only patch without forcing an address to exist.
3. Builds the JSON body via `buildPatchPayload`. Important: `shipbubble_settings` is **only** included when both `category` and `packageSize` are non-null. A toggle-only save (no settings) sends just `business_id` + `shipping_companies`.
4. Fires `useUpdateBusinessShipbubbleMutation`. On success the mutation invalidates `[getBusinessById]`, so the next render reads fresh data.

### Important: always include `SHIPBUBBLE` on Configure-modal save

In `ShipbubbleSettingsModal.handleSave`, before calling `save`, we merge `SHIPBUBBLE` into the companies list:

```ts
const nextCompanies = Array.from(
  new Set([...companies, "SHIPBUBBLE" as const])
);
```

Reason: the **purpose** of submitting the Configure form is to enable Shipbubble. Earlier iterations had an `enableOnSave` prop — it's gone; saving the form is always opt-in to Shipbubble.

---

## 6. Modal UX — split responsibilities

| Modal | What it does | Calls API? |
|---|---|---|
| `ShipbubbleAgreementModal` | Shows T&C + agreement checkbox + Connect button | **No** (UI-only — see gotcha #1) |
| `ShipbubbleSettingsModal` | Pickup address + category + box-size form | **Yes** — JSON PATCH on save |
| `BoxSizePickerModal` | Picker rendered from inside settings | **No** — pure picker, returns selection via `onChange` |

### AutomatedShipping wiring

- **Toggle ON** → opens `ShipbubbleAgreementModal`. On accept (UI-only) flips local `shipbubbleOn` state.
- **Toggle OFF** → flips local state. No API call.
- **Configure button** → opens `ShipbubbleSettingsModal`. This is the *only* path that actually persists anything.
- **"Connected" pill** on the card → driven by `isConfigured` (which checks `business.shipbubble.street && .category` on the server side, so it only goes green after a successful save).

The toggle is intentionally local-only **until the backend ships a dedicated boolean field** (e.g. `shipbubble_enabled`). When that field lands:

1. Swap `useState<boolean>(false)` for a derived flag from the hook.
2. Route the agreement-accept callback through `save({ shippingCompanies: [...companies, "SHIPBUBBLE"] })`.
3. Route toggle-off through `save({ shippingCompanies: companies.filter(c => c !== "SHIPBUBBLE") })`.

---

## 7. ShipbubbleSettingsModal — step-by-step

### Step 1 — Pickup Address (5 fields)

- **Street** — plain `<Input>`.
- **State** — strict `<Select>` populated from `country-state-city`:
  ```ts
  const NG_STATES = useMemo(() => State.getStatesOfCountry("NG"), []);
  ```
  Values are isoCodes (e.g. "LA"), saved value is the canonical name ("Lagos"). Picking a new state clears the city.
- **City** — `<Select>` populated from `City.getCitiesOfState("NG", isoCode)`. Plus an **"Other (type your own)"** option at the bottom which switches the field to a free-text `<Input>`. Reason: the library's NG city coverage isn't exhaustive (Lagos lists 8 cities, Rivers 13, FCT 4). A saved value not in the dropdown also auto-falls-back to free-text.
- **Phone** — `<PhoneInput defaultCountry="NG">` (the wrapper at `components/app/PhoneInput.tsx`). Emits E.164 (`+234…`).
- **Landmark** — plain `<Input>`.

### Step 2 — Shipping Category

`<Select>` over `categories` (from the GET). Stores the full `{category_id, category}` object.

### Step 3 — Default Package Size

Tile button that opens `BoxSizePickerModal`. The picker is a 2-col grid of cards; each card shows the real cloudinary image with a `<Package>` Lucide fallback if it fails to load.

### Footer

- **Cancel** — close.
- **Save Changes** — runs `validateSettings()`, toasts the first error if any, otherwise calls `save({ shippingCompanies: [...companies, "SHIPBUBBLE"] })` and closes on success.

---

## 8. Address strictness (why country-state-city)

Shipbubble's geocoder validates the address server-side. Before strict dropdowns, merchants typed "test" / "asdf" and got a 400 with:

> Sorry, we couldn't validate the provided address. Please provide a clear and accurate address including the city, state and country of your address.

The fix was to force **State** to be a canonical Nigerian state from the `country-state-city` library, and default **City** to a real entry in that state. The free-text fallback exists because the library's catalogue is incomplete — merchants outside the catalogue can still type their own, but they're warned by the UI flow (they explicitly pick "Other").

Country is locked to Nigeria — Shipbubble is NG-only.

---

## 9. PhoneInput

The Shipbubble phone field uses the project's shared phone input:

```tsx
import { PhoneInput } from "@/components/app/PhoneInput";

<PhoneInput
  value={settings.phone || undefined}
  onChange={(value) => updateSetting("phone", value || "")}
  defaultCountry="NG"
  placeholder="Phone number"
/>
```

The component is a wrapper around `react-phone-number-input`. Stored value is E.164 (`+2348012345678`) — that's the format Shipbubble expects on submit.

---

## 10. Order management touch points

Today, Shipbubble appears in two places in the order flow — both **currently mocked**:

| File | Mock | When real wiring lands |
|---|---|---|
| `orders/AssignDeliveryModal.tsx` | `MOCK_PARTNERS` constant (includes a `shipbubble` entry) | Replace with derived `business.shipping_companies` → partner list. Each enabled company becomes a partner card. |
| `orders/OrderCard.tsx` + `orders/[id]/ViewOrder.tsx` | `MOCK_RIDERS` constant + hash-seeded partner pick | When the order endpoint returns assigned partner + rider, drop the mock. |

There are also two future endpoints likely needed once Shipbubble is fully integrated with orders:

- `POST order/{order_id}/assign-delivery/` — push an order to Shipbubble for dispatch.
- `GET order/{order_id}/shipping-rate/` — live rate quote at checkout (the `setTimeout(800)` in `CreateOrders.tsx` is the placeholder).

When wiring, read `business.shipbubble.{street, city, state, phone, landmark}` for the pickup origin — that's already saved by the Configure modal, so the order flow doesn't need to ask again.

---

## 11. React Query keys

From `src/constants/query-key.ts`:

```ts
shipping: {
  getBoxSizes:           "get-shipping-box-sizes",
  getShippingCategories: "get-shipping-categories",
  // (createShipping etc. predate the Shipbubble feature)
},
business: {
  updateBusiness: "update-business",
  // useUpdateBusinessShipbubbleMutation uses [updateBusiness, "shipbubble"]
}
```

- Box sizes + categories cache for 1h (`staleTime: 1000 * 60 * 60`) — they almost never change.
- The Shipbubble mutation invalidates `[business.getBusinessById]`, which the hook subscribes to → fresh state on next render.

---

## 12. Conventions & gotchas

1. **Toggle is local-only until backend ships the boolean.** The merchant accepting the T&C doesn't currently persist anything; `shipbubbleOn` is `useState(false)` in `AutomatedShipping.tsx`. When the backend exposes (e.g.) `shipbubble_enabled: bool`, route both toggle directions through `save({ shippingCompanies })`. The save plumbing is already wired and ready.

2. **JSON, not FormData.** This is non-obvious because the existing `update-business` proxy is multipart. The dedicated `update-shipbubble` proxy was added specifically because DRF's nested-writable serializer for `shipbubble_settings` can't accept a JSON-stringified blob inside a multipart field — it silently nulls the field. If you ever need to add another nested-writable field to the business record, do the same: dedicated JSON proxy.

3. **Write field ≠ read field.** Outgoing PATCH uses `shipbubble_settings`. Incoming GET returns `shipbubble`. The hook bridges both. Don't try to normalise; the swagger spec defines them as separate.

4. **Always include `SHIPBUBBLE` in `shipping_companies` on Configure save.** The form's purpose is enabling Shipbubble. The hook's `save` lets callers override the companies list — the Configure modal *always* merges `SHIPBUBBLE` in. Don't remove this merge unless the toggle is also wired to the backend.

5. **City coverage is incomplete.** `country-state-city` v3 returns 8 cities for Lagos (missing Lekki, V.I., Surulere, etc.). The settings modal handles this via the "Other" → free-text fallback. Don't make the city field strict — you'll lock real merchants out.

6. **Phone is E.164.** `PhoneInput` emits `+2348012345678`. Don't reformat before saving — Shipbubble expects the international format.

7. **Hydration is one-shot per hook lifecycle.** `didHydrate` ensures the form doesn't keep overwriting user edits. Modals call `resetFromBusiness()` on every open to re-sync from the server — copy this pattern if you build another consumer.

8. **`buildPatchPayload` only emits `shipbubble_settings` when both category + packageSize are set.** A toggle-only save (companies-only) is a valid call shape — backend accepts a partial PATCH. Don't add the address fields to a toggle-only save; keep the two paths cleanly separated.

9. **No optimistic update.** After save we rely on query invalidation + refetch. If you add an optimistic update, also update the `isConfigured` derivation so the "Connected" pill doesn't flicker.

10. **Connected Apps uses the same modal.** `ConnectedApps.tsx` mounts `ShipbubbleSettingsModal` directly (no T&C step). This is intentional — "Connect" from Connected Apps is assumed to be a power-user path that doesn't need the agreement gate every time. If product wants the gate there too, wrap with `ShipbubbleAgreementModal` like AutomatedShipping does.

---

## 13. Quick "where do I…" cheat sheet

| Task | File / change |
|---|---|
| Add a new field to the Shipbubble payload | `ShipbubbleSettings` in the hook + `buildPatchPayload` + the appropriate `SettingsTile` in `ShipbubbleSettingsModal` |
| Add a new shipping company (e.g. Chowdeck setup form) | New companion modal mirroring `ShipbubbleSettingsModal`; reuse `useShipbubbleHook` but extend `ShippingCompany` and `companies` handling |
| Change T&C copy | `TERMS` array at the top of `ShipbubbleAgreementModal.tsx` |
| Add another box-size or category | They come from the API — coordinate with backend; UI auto-renders new entries |
| Wire the toggle to the backend | Replace the `useState`s in `AutomatedShipping.tsx` with derived flags from the hook; route both directions through `save({ shippingCompanies })`. The hook is already ready. |
| Use the saved Shipbubble pickup in the order flow | `business.shipbubble.{street, city, state, phone, landmark}` — read from `useFetchBusinessById` |
| Add a country other than NG | Wider library lookup; add a Country `<Select>` above State in the settings modal; Shipbubble itself currently doesn't operate outside NG, so this needs backend confirmation first |

---

## 14. Manual verification scenarios

After any change to the address / save path, walk through these:

1. **Cold start** — first-time merchant, no `shipbubble` on the business. Open Configure → all fields empty. Save without filling → toast says "Please fill in street." Fill everything → success → reopen Configure → fields pre-populated.
2. **Custom city** — pick Lagos. Verify the city dropdown lists 8 cities + "Other". Pick "Other" → free-text input appears with "Back to city list" link. Type "Lekki", save → reload page → reopen Configure → state still "Lagos", city stays "Lekki" (custom-mode auto-detected).
3. **Phone format** — type a NG number in the phone field. After save check the network panel: outgoing body should have `phone: "+234…"`.
4. **Toggle isolation** — flip Shipbubble toggle on, accept T&C — pill should *not* go green (toggle is UI-only). Now hit Configure, save → pill goes green ("Connected"). This proves the pill is driven by `isConfigured` (server-side), not the toggle.
5. **Network sanity** — POST `/api/businesses/update-shipbubble` request body should be JSON (not multipart) and contain `shipbubble_settings` (not `shipbubble`). Response should echo `shipbubble: {...}` populated.
