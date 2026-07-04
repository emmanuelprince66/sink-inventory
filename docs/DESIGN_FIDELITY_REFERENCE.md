# Design Fidelity Reference

Source of truth for matching the live app to the Figma design, established while calibrating
the Orders screen against the boss's feedback (screenshots don't have exact values — use the
actual coded reference instead).

## Where the ground truth lives

- **Real coded reference (most reliable)**: `Convert Mobile Screens to Desktop/src/app/App.tsx`
  — this is a literal React/Tailwind implementation exported from Figma, with exact classes,
  hex colors, and px values per screen (`OrdersScreen`, `TransactionsScreen`, `InventoryScreen`,
  etc. are all real functions in this file). Always check here first before eyeballing a
  screenshot — screenshots can't give exact dimensions/weights, this file can.
- **Theme/tokens**: `Convert Mobile Screens to Desktop/src/styles/theme.css` — canonical hex
  values and the `--background: #f4f7f4` page background.
- **Typography spec**: `Convert Mobile Screens to Desktop/src/imports/design_system.PNG` —
  Nunito, Heading 1 (Bold/24px), Heading 2 (Semibold/20px), Subtitle (Medium/16px),
  Body (Regular/14px), Label (Regular/12px). **Note: the spec tops out at Bold — there is no
  "extrabold" tier documented**, even though `font-extrabold` is used in a few places in the
  actual App.tsx source (e.g. KPI values, order IDs) — so extrabold isn't universally wrong,
  but it's not a blanket default either. Check the specific element against App.tsx.
- **Flat screenshots** (`order.PNG`, `sales.PNG`, `transactions.PNG`, etc. in
  `src/imports/`): useful for overall layout/composition, but do NOT treat as pixel-accurate —
  they're scaled screenshots, not 1:1 exports. If App.tsx has the real screen, prefer that.

## Confirmed-correct patterns (don't second-guess these)

- KPI/stat cards: label on the left, **bare icon (no circle/box)** on the right, via
  `flex items-center justify-between`. Value on its own line below, full width.
- KPI label: `text-xs font-bold` (12px bold).
- KPI value: `text-2xl font-extrabold`, always colored `grey-1` (never tinted to match the card).
- "Copy URL"-style accent buttons keep a solid green border/text — not every outline button
  should go neutral grey.
- Page background is `#f4f7f4` (already applied via the dashboard layout `<main>`).

## Known systemic discrepancy: card border color

Nearly every bordered card/tab-bar/divider in the reference uses a **translucent dark-green
tint** border, not a solid grey:

```
rgba(27, 50, 40, 0.08)   /* most common */
rgba(27, 50, 40, 0.12)   /* theme.css --border */
```

This reads noticeably softer than our previous `border-grey-5` (`#d1d5db`, solid). Added as a
token in `src/app/globals.css`:

```css
--color-border-tint: rgba(27, 50, 40, 0.08);
```

Use `border-border-tint` for card/container-level borders (Orders tab bar, order cards, etc).
**Do NOT blanket-replace every `border-grey-5`** — some elements in the actual spec intentionally
use solid `DS.grey5` (Filter/Export buttons, date preset pills, search input, form selects) —
check App.tsx per element before swapping.

## Root cause found & fixed: KPI cards were ~40% taller than spec (2026-07-04)

`CustomCard.tsx` double-pads by design: callers pass padding via `className`, which lands on
the outer `Card` element — but `CardContent` (the actual child wrapper) unconditionally adds
its own `p-3` (12px) on top, since it's a separate nested div. Two independent padding layers
stack instead of one overriding the other.

Measured impact on Orders' KPI cards: spec is **94px** tall (`p-4` = 16px padding, single
layer). Ours rendered at **~132px** (20px outer `Card` padding + 12px inner `CardContent`
padding = 32px per side, plus a looser gap and larger label text) — object­ively ~40% taller,
not a perception issue.

**Fix**: pass `contentClassName="p-4 ..."` (the real padding) and put `p-0` in `className` (so
the outer `Card` contributes nothing), for every KPI-card-style `CustomCard` usage. Applied to:
- `orders/Orders.tsx` — `CustomOrderCard` → confirmed 94px (matches spec exactly).
- `sales/Sales.tsx` — `CustomSalesCard`. Also fixed while in there, per the purple finding below:
  Items Sold / Total Discount now use `#f5f3ff` bg / `#7c3aed` icon+text (was wrongly mapped to
  green/error tokens); Revenue card bg fixed to `#eff6ff`; icons now bare (no white/60 box,
  spec never boxes KPI icons); "View More" on Total Discount moved to `absolute top-right` per
  spec instead of inline.
- `inventory/Inventory.tsx` — `CustomInventoryCard`. Inventory Value bg fixed to `#e0e7ff`
  (was `bg-info-2`); icon un-boxed.
- `customers/Customers.tsx` — `CustomCustomerCard`. This one was structurally different in
  spec, not just padding: **plain white bordered card, no icon, `text-sm font-semibold` label,
  border uses `border-border-tint`**. Rebuilt fully rather than patched.

**Not yet fixed** (do next time we touch these screens): Transactions KPI cards (icon-in-solid-
box-on-left style, still needs the same padding fix + purple Outflow card), Home, Expenses.

## Orders screen — specific corrections applied (2026-07-04)

- KPI "Total Orders" card bg: `bg-info-2` (#bee3f8) → `bg-[#eff6ff]` (paler blue, matches spec's
  raw hex — not a token in the spec either, it's a one-off).
- KPI icons: `16px` (`w-4 h-4`) → `18px` (`w-[18px] h-[18px]`) per `size={18}` in spec.
- Tabs bar + status sub-tabs border: `border-grey-5` → `border-border-tint`.
- Order card border (`OrderCard.tsx`): `border-grey-5` → `border-border-tint`.
- Date presets (Today/This Week/This Month): `text-xs` → `text-sm` (spec is 14px, we had 12px).
- Filter/Export buttons: added `rounded-xl` (spec uses rounded-xl, our shared `Button` defaults
  to `rounded-md`).

## Per-screen findings from the full App.tsx read (2026-07-04)

These are places where our live implementation currently deviates from the coded reference.
Not yet fixed — listed so we can decide screen by screen.

### Sales (`SalesScreen`, App.tsx ~826-989)
- **KPI cards use icon-LEFT layout** (`flex items-center gap-2 mb-3`: small icon, then label),
  unlike Orders' icon-right/justify-between. The two screens genuinely differ in the design —
  don't force one pattern onto both.
- **The design DOES use purple**: "Items Sold" and "Total Discount" cards are `#f5f3ff` bg with
  `#7c3aed` text/icon. Earlier we swapped these to green/error tokens on the assumption purple
  wasn't in the system — the reference contradicts that. Same purple appears in Home quick
  actions and Transactions' Total Outflow (`#7c3aed` box). Worth restoring.
- Revenue card bg is `#eff6ff` (same pale blue as Orders' Total Orders card).
- KPI icons: `size={15}` here (Orders uses 18).
- 6 cards in 2 rows of 3 (`grid-cols-3`), `rounded-2xl p-5`.
- "View More" on Total Discount: absolute top-right corner of the card, `text-xs font-bold`
  green — not inline next to the label.
- Sales table values (Name, Unit Sold, Revenue, Profit) are **green bold** (`DS.secondary1`,
  `text-sm font-bold`); S/N, VAT, SKU, Discount are `grey3 font-medium`. Numeric columns
  right-aligned from "Unit Sold" onward.
- Whole analytics block (header + toggle + search, tabs, filter pills, category pills, table)
  is one bordered white `rounded-2xl` container with tint borders between each band.

### Customers (`CustomersScreen`, App.tsx ~1093-1159)
- **KPI cards are plain white cards with tint borders** (`bg-white border rgba(27,50,40,0.08)`),
  label `text-sm font-semibold grey-3`, value `text-2xl font-extrabold` colored per-card
  (dark green for wallet, error red for debt, grey-1 for count). **No icons, no tinted bg** —
  our current tinted icon-card version deviates.
- **Customers/Campaigns switch is a segmented pill control** (grey-6 container, `p-1 rounded-xl`,
  active = solid green bg + white text) — NOT underline tabs like we built.
- Layout row: filter pills (All/Most Active/Least Active/Debts) + search (flex-1) +
  "Add Customer" button all in ONE row above the table; table is a separate bordered card.
- Customer table header text is `grey-3` here (unlike every other table where it's green) —
  possibly a design inconsistency; confirm with boss before propagating either way.
- Wallet Balance + Status columns right-aligned; avatar is a solid green circle with initial.
- Engage banner: `secondary-6` bg with **`secondary-4` border** (we used
  `primary-green-300/20`), Megaphone icon + title + chevron on one line.
- Campaigns tab embeds campaign management inline (credit card, sub-tabs Campaigns/Groups/
  Usage/Marketing Automation, table). We deliberately redirect to /campaign instead — user
  decision, keep.

### Transactions (`TransactionsScreen`, App.tsx ~1190-1225)
- KPI cards: tinted bg + border pairs — wallet `secondary-6`/`secondary-4` border, inflow
  `#eff6ff`/`#bfdbfe`, outflow `#f5f3ff`/`#ddd6fe` (purple again). Icon sits in a **solid
  colored square** (`w-10 h-10 rounded-xl`, white icon) left of the label — different from
  both Orders and Sales card styles. We used warning/amber for outflow — design says purple.
- Main Account: dark `DS.primary` card; Transfer = outline button, Create Sub Account =
  white-border ghost on dark.
- BNPL: pink accents (`#fdf2f8`/`#db2777`), 3 stats in a `divide-x` row (not separate boxes).
- Table: Transaction ID green bold; Amount right-aligned extrabold; Amount/Account/Date/Status/
  Action all right-aligned.

### Home (`HomeScreen`, ~992-1036) — not yet rebuilt by us
- 2 KPI cards via shared `KPICard`: `rounded-2xl p-6`, icon in `w-11 h-11 rounded-xl`
  white/60 box on the right, label `text-sm font-semibold grey-3`, value `text-3xl font-extrabold`.
  One `secondary-6` bg, one dark `DS.primary` bg.
- Quick actions: grey-6 tiles, colored icon circles (info, warning, purple `#ede9fe`/`#7c3aed`,
  secondary-6).

### Expenses (`ExpensesScreen`, ~1039-1090) — check when we get to it
- KPI row: two white bordered cards + one `secondary-6` card; labels are uppercase
  `text-xs font-extrabold tracking-widest grey-4`.
- Category cards: 5-col grid, `1.5px` borders (tint normally, category color when active),
  lots of `text-[10px]`/`text-[11px]` micro-text.

### POS/Shop (`SearchScreen`, ~634-823)
- Two-pane: products left, `w-80` checkout right. Product tiles `rounded-xl` with `h-28`
  color swatch, price green extrabold. Cart rows with steppers. Full detail in file.

## Systemic fix applied: every button should be font-bold, not font-medium (2026-07-04)

Reference `DSButton` (App.tsx ~136-157) hardcodes `font-bold` into its base classes for
**every** variant — primary, secondary, outline, ghost, danger, no exceptions. The live shared
`Button` (`src/components/ui/button.tsx`) instead defaulted to `font-medium` in its base cva
string, and no per-screen override corrected it — so this wasn't a one-off, every button built
on the shared component was under-weight app-wide (Filter, Export, Manage Category, More, Add
New, Create, etc.).

**Fix applied**: changed the base class in `button.tsx` from `font-medium` → `font-bold`. This
is a global change (touches every screen using `<Button>`, not just the ones reviewed so far).

**Known follow-up**: a few call sites explicitly override with `font-medium` in their
`className`, which (via tailwind-merge) wins over the new bold base and silently blocks the
fix on that instance. Found and fixed two so far — Inventory's "Add New" and "More" buttons.
There are ~166 files with `font-medium` somewhere, but most are on non-Button elements (table
cells, labels, badges, helper text) which are out of scope — only ones literally on a `<Button>`
matter here. Not fully audited; check for `<Button ... font-medium` per screen as we touch it.

## Sidebar (`AppSideBar.tsx` vs. reference `Sidebar`, App.tsx ~289-344) (2026-07-04)

- **Fixed a real clipping bug**: shared `SidebarMenuButton` bakes in `h-8` (32px) + `overflow-hidden`
  as its base size — fine with the default `p-2` padding (16px content room, fits a 16px icon),
  but three places override padding to `py-2.5` (20px) without overriding the height: the
  Store/Stock/Operations collapsible triggers and the Logout button. 32px − 20px = 12px left
  inside an overflow-hidden box → likely icon/text clipping. **Fixed** by adding `h-auto` to all
  three trigger buttons.
- **Not yet fixed / flagged, needs a decision before touching**: the reference sidebar is a dark
  green (`DS.primary`) background with white nav text throughout; the live sidebar is white bg
  with dark text — a wholesale visual-identity difference, not a tweak. Don't silently redo this;
  confirm with the user/boss first.
- **Font/weight discrepancies found, not yet fixed**:
  - Section/group header ("Account"-style label): live `text-xs font-semibold tracking-wider`
    (12px/600) vs spec `text-[10px] font-extrabold tracking-widest` (10px/800).
  - Nav link text weight: live `font-semibold` (600) vs spec `font-bold` (700).
  - Nav icon size: live `h-4 w-4` (16px) vs spec `size={17}` (17px).
- **Internal spacing inconsistency** (not even about matching the spec): the Store/Stock/
  Operations triggers + Logout explicitly set `py-2.5` (10px vertical); plain top-level nav
  links and nested sub-items set no vertical padding at all and fall back to the shared
  button's default `p-2` (8px) — two different vertical rhythms in one sidebar. Spec uses one
  uniform `py-2.5` everywhere.

## Inventory brought in line with Orders (the calibration screen) (2026-07-04)

Orders is the designated reference for other screens ([[project-design-fidelity-boss-feedback]]).
Comparing `Inventory.tsx` against it surfaced several real deviations, now fixed:

- **Filters button**: added `rounded-xl` + `text-sm` (shared `Button` defaults to `rounded-md`;
  Orders' Filter/Export buttons already carry this override, Inventory's didn't).
- **Filter count badge**: was an inline pill (`ml-2 px-1.5 py-0.5 rounded-full font-medium`) —
  switched to the same absolute corner-circle Orders uses (`absolute -top-2 -right-2 w-5 h-5
  rounded-full flex items-center justify-center`), so the same UI pattern now looks the same.
- **"Add New" / "More" dropdown menus**: removed a redundant `bg-white border border-grey-5
  shadow-lg` override — the shared `DropdownMenuContent` already defaults to `bg-white
  border-grey-5 rounded-xl shadow-md`, which is what Orders' dropdown relies on unmodified. The
  `shadow-lg` was an unintentional heavier shadow, and was applied inconsistently even within
  Inventory itself (a third dropdown had no override).
- **Department/Category pill filters**: `font-medium` → `font-bold`, confirmed against the
  reference `InventoryScreen` (App.tsx ~541-562), which specs `text-xs font-bold` for these —
  matches the weight Orders/Sales already use on their own pill filters (status tabs, date
  presets, category tabs are all `font-bold` across those screens).
- **Category pill labels**: added `capitalize` (Department pill already had it, Category didn't —
  now consistent, and category names render capitalized as requested).
- **"Manage Category" button**: was green (`text-primary-green-300 border-secondary-4`) — the
  reference's coded button for this exact row (App.tsx ~534-535) is plain grey (`DS.grey2` /
  `DS.grey5`, same treatment as Filters/More) — switched to `text-grey-2 border-grey-5`.

## Process going forward

When comparing any other screen against the design:
1. Check if `App.tsx` has a real coded function for that screen (grep for `<ScreenName>Screen`)
   before measuring a screenshot.
2. Cross-reference colors against `theme.css` / the `DS` object at the top of `App.tsx`.
3. Only pixel-measure a screenshot (via a cropped/zoomed image, or PowerShell `System.Drawing`
   pixel scans) as a last resort when no coded reference exists.
4. Flag systemic findings (like the border tint) here before applying app-wide, since they
   affect many screens at once.
