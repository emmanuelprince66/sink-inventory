# Test Plan: Bulk Discounts, Offline Sales, Sell Without Stock, Accountant Approvals

Run everything on **staging**. Do the sections in order: later steps reuse products created earlier.

---

## 0. Setup

- [ ] Dashboard `sink/src/constants/base-url.ts` points at `https://staging-api.sync360.africa/api/v1/`
- [ ] Storefront `store-front/src/base-url.ts` points at staging (it defaults to **production**). Restart the storefront after changing it.
- [ ] Logged in to the dashboard as an **Owner**
- [ ] Browser DevTools open (**F12 → Network**) to check requests

If a step fails, note the **step number**, take a **screenshot**, and copy the failing request from the Network tab.

---

## 1. Bulk discounts: simple product (Dashboard)

1. [ ] **Add Product**, single product: selling price **₦2,000**, cost **₦1,000**. Tick **Sell online**.
2. [ ] Under **Bulk discounts** add tiers:
   - 5 – 9 → 5%
   - 10 – 19 → 10%
   - 20 – (Max blank) → 15%

   ✅ Preview shows ₦1,900 / ₦1,800 / ₦1,700 each.
3. [ ] Change tier 2's Min to **9**. ✅ Overlap error shows; form won't save. Change it back.
4. [ ] Save. ✅ Product saves; `discount-thresholds` request returns 200.
5. [ ] Reopen **Edit**. ✅ All 3 tiers are there, shown as whole numbers (5, not 5.00).
6. [ ] Change only the name, save, reopen. ✅ Tiers still there.

## 2. Bulk discounts: product with variations (Dashboard)

1. [ ] **Add Product** with variations: Size **S** (₦1,000) and **M** (₦1,500).
2. [ ] Turn on **Bulk Edit**, tick both, then **Edit Selected → Bulk Discounts**. Add **3+ → 10%**, click **Apply to selected**.
   ✅ Both variation headers show "1 bulk tier".
3. [ ] Expand **M** and use its own **Bulk Discounts** button. Change it to **5+ → 20%**.
4. [ ] Save. ✅ In Network, the save request's `variation_inputs` includes `discount_thresholds` for each variation.
5. [ ] Reopen. ✅ S = 3+ → 10%, M = 5+ → 20%.

## 3. Bulk discounts: ₦-off tier

1. [ ] Edit a product, add a tier **3+ → Fixed amount (₦ per unit) ₦200**, save.
   ✅ Request shows `"discount_type": "PRICE"` and returns 200.
2. [ ] Reopen. ✅ Tier shows as Fixed amount ₦200.

## 4. Inventory list

1. [ ] On the simple product, click **Set Discount**. ✅ Its tiers load.
2. [ ] Change 20+ to **60%**. ✅ Red "selling at a loss" warning (₦800 < ₦1,000 cost). Change back to 15% and save.
3. [ ] **Set Discount** on the variation product. ✅ A list of its variations with each one's price and saved tiers.
   - Expand **S**, change its tier, **Save**. ✅ In Network, only S's `discount-thresholds` request is sent. Reopen Edit Product. ✅ It matches.
   - **Apply the same tiers to all**, add a tier, apply. ✅ Every row shows it. Save. ✅ All are saved.
   - Add an overlapping tier on one. ✅ The row says "Needs fixing" and Save is disabled.
   - Set a tier below cost. ✅ A red warning on that row.
   - On a variation with an old single discount: it shows as a tier. Delete it and save, then reopen and ring it up on the POS. ✅ No discount comes back. In Network, its `edit-product` request returned 200.
   - Block `discount-thresholds` requests in DevTools and open the modal. ✅ "Couldn't load the saved bulk discounts" with **Try again**, not an endless skeleton.
   - Block one variation's request in DevTools and save. ✅ The modal stays open, that row shows why, and Save retries only that one.
4. [ ] **View Details** on the simple product. ✅ "Bulk Discounts" lists the tiers.

## 5. Bulk discounts: POS

1. [ ] Add the simple product and step the quantity:

   | Qty | Expected |
   |---|---|
   | 4 | No discount · "Add 1 more for 5% off" |
   | 5 | "Tier 1: 5% off applied" · total ₦9,500 |
   | 10 | "Tier 2: 10% off applied" · total ₦18,000 |
   | 20 | "Tier 3: 15% off applied" · total ₦34,000 |

2. [ ] Add variation **M × 5**. ✅ "20% off applied", line ₦6,000.
3. [ ] Edit the simple product's price to ₦1,500. ✅ Its bulk discount disappears. Undo the edit.
4. [ ] Complete the sale. ✅ Receipt shows the discounts; total matches **Sales History**.
5. [ ] Add the ₦-off product × 3. ✅ "₦200 off each applied", line drops by ₦600.

## 6. Bulk discounts: Create Order (Dashboard)

1. [ ] Add the simple product × 10. ✅ "Discount Applied" ₦200 off per unit, and "Buy 10 more to get 15% off".

## 7. Bulk discounts: Storefront

1. [ ] Open the simple product. ✅ "Buy in bulk & save" table shows "5 – 9 pcs", etc.
2. [ ] Click **+** up to 5, then 10. ✅ + works; highlighted tier moves; hint updates ("Add 5 more to unlock 10% off").
3. [ ] Stock label reads "10 in stock" (not "10.00"). **+** stops at the stock limit.
4. [ ] Open the variation product, pick **M**. ✅ Table shows 5+ → 20%.
5. [ ] Add the simple product × 12. ✅ Cart line shows ~~₦24,000~~ **₦21,600**, "Bulk price: 10% off applied", "Add 8 more to unlock 15% off", and "Bulk discount −₦2,400" in the summary.
6. [ ] Check out. ✅ Amount charged = ₦21,600 + delivery; success screen lines add up to the total.

## 8. Old single discount

1. [ ] Edit an older product that had the old discount. ✅ Shows as Tier 1 (values over 100 show as a ₦ tier).
2. [ ] Delete the tier, save, reopen. ✅ No discount comes back; POS gives no discount.

---

## 9. Offline Sales (POS)

Open the POS **while online** first and stay on it for a few seconds (the page must be loaded before it can work offline, and products and customers are saved on the device in the background).

### Connection indicator
1. [ ] Look at the POS header. ✅ There's no switch, just a green pill "Online".
2. [ ] DevTools → Network → throttling **Offline**. ✅ Pill turns amber, "Offline", with no action from you, and a small toast says "You're offline. Sales will be saved on this device."
3. [ ] Set throttling back to **No throttling**. ✅ Pill returns to "Online" by itself, and a small toast says "You're back online."
4. [ ] Repeat at phone width. ✅ The switch and pill fit without overflowing the header.

### Taking sales offline
5. [ ] DevTools → Network → throttling **Offline**.
   ✅ Amber "You're offline" banner. Load Presale and Self Checkout are greyed out.
6. [ ] Go to Pay. ✅ Only **Cash** and **Bank Transfer**; no Split Bill; note says the sale is saved on this device.
7. [ ] Make a **Cash** sale. On the confirm, tap **Yes twice quickly**. ✅ Receipt prints once.
8. [ ] Make a **Bank** sale with an **attendant** and a **customer** selected.
9. [ ] Add a **loyalty reward**. ✅ Pay is blocked with a message. Remove it.
10. [ ] Wait a minute while still offline. ✅ The status by the pill says "N waiting", with no popup and no errors.

### Stock goes down with offline sales
11. [ ] Note a product's **Stock** on its card (say 5). Sell 2 offline. ✅ Without any page reload the card shows 3, and the cart's **Available** line and the + button agree with it.
12. [ ] Do the same for one variation. ✅ The variation picker and the Change Variation modal show that variation's lower number; the card's total drops too; the other variations don't change.
13. [ ] Sell a decimal quantity (e.g. 1.5). ✅ Stock drops by exactly 1.5, with no long decimals.
14. [ ] Sell a service and a combo. ✅ No stock number moves for them.
15. [ ] Sell without stock **ON**: take a product with stock 1 and sell 3 offline, one at a time. ✅ Card shows 0, then -1, then -2. Still clickable, no popups.
16. [ ] Sell without stock **OFF**: sell a product down to 0 offline. ✅ Card greys out and can't be added; the picker shows Out of Stock for a variation at 0.
17. [ ] Sell without stock **OFF**: put a product in two sale tabs, then sell all of its stock from one. ✅ In the other tab, **Available** is red and **Complete Order** is disabled until the quantity is reduced.

### Sell without stock with no business data
18. [ ] With Sell without stock ON and the POS opened online once, reload with the business request blocked (DevTools → Network → block `/api/businesses/*`). ✅ Empty products are still clickable. Unblock it and turn the setting off. ✅ The POS follows the fresh value.

### Search and barcode offline
19. [ ] Offline, DevTools → Network: search by **name**, then **SKU**, then **barcode**, including a code that belongs to a variation. ✅ Results appear; no inventory request is sent.
20. [ ] Page through the results. ✅ Same pagination as online; stock includes the offline sales above.
21. [ ] Search for nonsense. ✅ "No saved products match…" message, not an empty grid.
22. [ ] Scan a product's barcode. ✅ It's added to the cart. Scan a variation's barcode. ✅ That variation is added. Scan a product that has variations. ✅ The variation picker opens. Scan an unknown code. ✅ Toast "No saved product matches…".
23. [ ] Scan a self checkout (INS-) code offline. ✅ Toast saying it needs a connection.
24. [ ] In DevTools → Application → IndexedDB, delete `sync360-pos-cache`, then go offline. ✅ "No products saved on this device yet" message; scanning explains the same. `sync360-pos` and its offline sales are untouched.

### Customers and loyalty offline
25. [ ] Offline, select a customer who has a loyalty card. DevTools → Network: ✅ no `loyalty` requests, no error toasts, no "View loyalty" button or reward banner; the bar says loyalty updates when the sale syncs.
26. [ ] Open **Add Customer** and search by name and phone. ✅ Results come from the device; Create Customer is disabled with a note saying why. Tap one. ✅ They go straight onto the sale.
27. [ ] Tap **Scan Loyalty** and scan a saved customer's card. ✅ They go onto the sale. Scan an unknown card. ✅ Toast saying no saved customer has it.
28. [ ] Make the sale and wait for it to sync. ✅ The backend applies the customer's points.

### Stock numbers by role
28a. [ ] Log in as **Owner** or **Admin-Attendant**. ✅ Stock numbers show on product cards, under cart lines and in the variation pickers.
28b. [ ] Log in as **Attendant** (or any other role). ✅ No stock numbers in any of those places. Status labels (e.g. Out of Stock) still show. Going over stock says "Not enough stock" with no number.

### Offline Sales drawer
29. [ ] DevTools → Network → throttling **Offline**, make 2 sales, click **View offline sales**. ✅ A drawer opens over the POS with no page change.
   ✅ Status pill "No connection". Amber card "Waiting for internet". **Sync now** disabled.
   ✅ Summary cards: sale count, total value, "None" need attention.
   ✅ Sales grouped under "Today", each with method, time, receipt no., attendant/customer.
30. [ ] Click a sale. ✅ It expands to show items and total.
31. [ ] Repeat at phone width. ✅ The drawer fills the screen and everything fits; the X closes it.
32. [ ] Hard reload while online, go offline **without** opening the drawer first, then open it. ✅ It still opens.

### Background sync
33. [ ] Set throttling back to **No throttling**. ✅ Within about 5 seconds the sales sync on their own with **no success popup**; drawer shows "All caught up".
34. [ ] Watch the product cards while that happens. ✅ The stock doesn't jump up and back, or drop twice.
35. [ ] Check **Sales History** and **Inventory**. ✅ Each sale appears **once**, with the right date and attendant; stock dropped once.
36. [ ] Make a sale with **no attendant selected**. ✅ After it syncs, it's recorded under the logged-in cashier.
37. [ ] Leave the POS for another dashboard page right after an offline sale. ✅ It still syncs.
38. [ ] Go offline, make a sale, close the tab, go back online and open the dashboard. ✅ It syncs a few seconds later.
39. [ ] Go offline, make a sale, click **Log out**. ✅ A warning says the sale is waiting. Cancel. ✅ You stay logged in.
39b. [ ] Owner with 2 businesses: go offline, sell in business A, switch to B, go back online. ✅ A's sale still syncs on its own.
39c. [ ] Simple product: sell 3 of 10 offline, then go back online. ✅ Card stays at 7 after the sync.
39d. [ ] Offline, put a loyalty reward on a sale, then select a different customer. ✅ The free item leaves the cart and Pay isn't blocked.
39e. [ ] Go offline, make a sale, open it in the drawer and click **Reprint receipt**. ✅ The print dialog opens, with items, VAT and total matching the first receipt.
39f. [ ] With VAT on: block `/api/businesses/*`, reload the POS, go offline and sell a taxed item. ✅ The receipt still includes VAT.
39g. [ ] With a sale waiting (DevTools offline), open **Sales**. ✅ A note says it's still syncing. Back online, the note goes and the sale appears.
39h. [ ] **No internet but the browser says online:** in DevTools → Network → block request URLs, block `/api/sales/*/create-sale` and `/api/connection-check` (throttling off), then make a Cash sale. ✅ The receipt prints with no error, the pill turns "Offline", and the sale is saved. In Network, ✅ the failed request and the later sync carry the **same** `client_sale_id`.
39l. [ ] **Slow connection:** throttle so the sale takes over 10 seconds. ✅ After about 10 seconds the receipt prints and the sale is saved offline. After it syncs, ✅ it appears **once** in Sales History.
39m. [ ] While the pill says "Offline" from 39h, make another sale. ✅ It's instant, with no 10-second wait.
39n. [ ] Unblock both requests. ✅ Within about a minute the pill returns to "Online" and the sales sync on their own.
39o. [ ] Same block, but pay by **Credit** with a customer. ✅ No receipt; a message says the sale may have gone through and to check Sales History, and the cart stays. Switch to **Cash** and pay. ✅ The new request has a **different** `client_sale_id`.
39p. [ ] After 39h puts the till offline, wait. ✅ It stays "Offline" for about 2 minutes before checking again (unblock the requests first), then comes back within about 40 seconds.
39q. [ ] While the pill says "Offline" from a blocked request (browser online), open the drawer and press **Sync now** with the requests unblocked. ✅ The sales sync and the pill returns to "Online".
39r. [ ] Log in as an **Attendant** and oversell an item past its stock (Sell without stock off). ✅ The error says "Not enough stock for X" with no number, and the cart quantity isn't changed.
39i. [ ] Simulate a lost reply: DevTools → Network → throttling **Offline** at the moment you press Yes on an online sale is hard to time, so instead copy the `client_sale_id` from a completed online sale, and in IndexedDB put it on a waiting offline sale before going online. ✅ Sync returns `ALREADY_SYNCED`, and the sale appears once with stock taken once.
39j. [ ] After completing a sale, ring up the **same items** again. ✅ The new request has a **different** `client_sale_id`, and two sales appear in Sales History.
39k. [ ] Offline sale with VAT on: ✅ the sync request includes `tax_rate`, and the server's VAT matches the receipt.
39a. [ ] With 1+ sale waiting offline, go back online while blocking `/api/sales/*/sync`. ✅ The sale stays waiting and isn't marked Failed. Unblock it. ✅ It syncs within about a minute, or at once with **Sync now**.

### Deleted product and rejected sale
40. [ ] Go offline, sell a product. In another tab, delete that product, then go back online.
    ✅ The sale still syncs (the backend only hides deleted products).
    To force a failure: go offline, make a sale, then in DevTools → Application → IndexedDB → `sync360-pos` → `offline_sales`, change a product `id` in that sale to a random UUID, and go back online.
    ✅ A red banner and "1 failed" by the pill. The sale shows "Failed" with the reason, plus **Remove** (asks for confirmation). It doesn't retry on its own, and other sales still sync.
41. [ ] Click **Remove** and confirm. ✅ The sale goes and the stock it was holding comes back.

### Sign out
42. [ ] Sign out. In DevTools → IndexedDB, ✅ `sync360-pos-cache` is empty; any unsynced sales in `sync360-pos` are still there.

---

## 10. Sell Without Stock

1. [ ] **Settings → General → Inventory & Sales**: turn **Sell without stock** ON.
2. [ ] POS: sell an item with 0 stock. ✅ Allowed; Inventory shows "−1 (Oversold)" in red.
3. [ ] Create Order: quantity above stock. ✅ Allowed.
4. [ ] Storefront: an out-of-stock item. ✅ "Available on Order" badge, "Order Now" button.
5. [ ] Turn it **OFF**, try to oversell on the POS. ✅ Error toast; cart quantity drops to what's left.

## 11. Accountant approvals

1. [ ] Log in as an **Accountant**. ✅ Expenses is in the sidebar.
2. [ ] Approve someone else's expense with your own PIN. ✅ Works.
3. [ ] Open your own expense. ✅ No Approve button.

---

## 12. Automatic selling price

1. [ ] **Settings → General → Inventory & Sales**: turn on **Automatic selling price**. ✅ A margin box and a recalculate checkbox appear. Save is shown; the card doesn't save until you press it.
2. [ ] Enter **0**, then **100**. ✅ Error, and Save is disabled. Enter **20**. ✅ "A cost of ₦8,000 sells at ₦10,000". Save, refresh. ✅ It stayed on at 20%.
3. [ ] **Add Product**, single: enter cost **8000**. ✅ Selling price fills in **10000** with the badge "Auto (20% margin)".
4. [ ] Change the margin to 15% in settings and enter cost **3500**. ✅ Selling price **4118** (rounded up). Set the margin back to 20%.
5. [ ] Type **12500** as the selling price. ✅ Badge "Custom override" with its margin, and **Reset to suggested price**. Change the cost. ✅ Your price stays. Press Reset. ✅ It returns to the suggestion and "Auto".
6. [ ] Save with a custom price and reopen. ✅ The price is what you typed.
7. [ ] **Variations:** give one cost 4000 and leave its price. ✅ 5000, Auto. Give another cost 8000 and type 12500. ✅ Custom. Bulk edit the cost of the first. ✅ Its price follows; the custom one doesn't.
8. [ ] **Edit** a saved product: change only the name and save. ✅ The price is unchanged, even if it doesn't match the margin.
9. [ ] Edit it again and change the cost, with recalculate **on**. ✅ The price follows the new cost. With recalculate **off**, ✅ it stays, marked "Custom override", and Reset still works.
10. [ ] **Restock:** type a new cost of 12000. ✅ Selling price becomes 15000. On a product with variations, pick a variation. ✅ Its saved cost and price load unchanged until you type a new cost.
11. [ ] Turn the feature **off** and save. ✅ No badges, and prices no longer fill in.

---

## 13. Staff permissions

1. [ ] **Add HR**, pick a role. ✅ A Permissions list of 16 modules appears, ticked with that role's defaults, saying "Using this role's standard permissions". Each module shows a count like "3 of 7".
2. [ ] Pick another role. ✅ The ticks change to that role's defaults. **Manager** is in the list.
3. [ ] Open **Sales & POS** and untick **Give manual discounts**. ✅ "Customised for this person" and **Reset to Role Defaults** appear. Press Reset. ✅ Back to defaults.
4. [ ] Add a staff member with a custom tick. ✅ In Network, `create` carries `set_permissions.permissions_matrix`. Open **Edit**. ✅ The custom tick is there.
5. [ ] Edit only their phone and save. ✅ The phone changes, and the custom ticks stay.
6. [ ] Press **Reset to Role Defaults** and save. ✅ The saved request has no `set_permissions`, and reopening shows the defaults.
7. [ ] Change a staff member's role and save. ✅ Reopening shows the new role with its defaults.
8. [ ] Block `/api/business/attendant-permissions/*`, open **Edit**. ✅ "Try again" shows, and saving is refused rather than wiping permissions.
10. [ ] As the owner, untick an Attendant's **Sales & POS → Give manual discounts**. Log in as them (log out and back in). ✅ No pencil to change a price on the POS.
11. [ ] Give an Attendant **Inventory → View**. After they log in again: ✅ Inventory is in their sidebar, the page opens, and POS stock numbers show.
12. [ ] Take an Accountant's **Sales & POS → View** away. After they log in again: ✅ Sales is gone from the sidebar, and typing `/sales` shows "You don't have access to this page" with **Go to my dashboard**.
13. [ ] Untick an Admin Attendant's **Staff → Invite staff**. ✅ No **Add HR** button. Untick **Change roles and permissions**. ✅ No edit/delete buttons on staff rows.
14. [ ] Log in as an **Inventory Manager** and pick the business. ✅ You land on a page you can open (Inventory), not POS.
15. [ ] Owner: ✅ everything still shows.
16. [ ] Give an Inventory Manager **Orders → View** only. After they log in again: ✅ Orders shows, but no **Create** button, no Mark as Processing, Cancel, Update Status or shipping status buttons; typing `/orders/create` shows the no-access page. Tick **Manage**, log in again. ✅ All of those appear, and a whole order can be created without errors.
17. [ ] As the owner, tick a box in **Sales & POS**, then in the expense section below switch on **approve** and press its own Save, then press **Update Staff Member**. ✅ Reopen: both changes are kept.
18. [ ] **Auto price, recalculate on:** a saved product with a hand-set price (not matching the margin). Change its cost. ✅ The price stays as you set it.
19. [ ] **No log-out needed:** with an Attendant signed in on another browser, untick their **Sales → View**. ✅ Within about 2 minutes (or when they switch back to the tab) Sales leaves their sidebar.
20. [ ] **Override PIN setup:** as an Admin Attendant or Manager, open **Settings → Security & Privacy**. ✅ A "Manager override PIN" tab; set a PIN. As an Attendant with no approval rights, ✅ no such tab.
21. [ ] **Reversal with approval:** as an Attendant without **Reverse sales**, open a sale. ✅ "Reverse Sale (manager approval)". Press it, enter a wrong PIN. ✅ "That PIN didn't work…" and the dialog stays. Enter the manager's PIN. ✅ The sale is reversed.
22. [ ] **Watchlist:** as someone without **Sell watchlist items**, ✅ watchlist products are greyed out at the POS, and clicking or scanning one says you don't have permission.
23. [ ] **Discount with approval:** as an Attendant without **Give manual discounts**, lower a product's price at the POS and pay. ✅ The PIN pad appears; the manager's PIN completes the sale. ✅ Services and combos show no price pencil for them.
24. [ ] Same Attendant, offline: ✅ no price pencil. Lower a price online, then lose the connection and pay. ✅ A message says the lowered price needs internet; the normal price sells offline.
9. [ ] Log in as a **Manager**. ✅ The sidebar matches an Admin Attendant's. Try to add staff. ✅ A permission error, unless the owner granted `staff: invite`.

---

## Results

| Section | Pass / Fail | Notes |
|---|---|---|
| 1. Simple product tiers | | |
| 2. Variation tiers | | |
| 3. ₦-off tier | | |
| 4. Inventory list | | |
| 5. POS discounts | | |
| 6. Create Order | | |
| 7. Storefront | | |
| 8. Old discount | | |
| 9. Offline Sales | | |
| 10. Sell Without Stock | | |
| 11. Accountant | | |
| 12. Automatic selling price | | |
| 13. Staff permissions | | |
