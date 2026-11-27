# Handoff: sink-inventory (as of 2026-11-25)

For the next Claude session working in this folder. Delete this file once it's no longer useful; it is not committed.

## The repo

- Folder: `C:\Users\HP PC\Desktop\sink-inventory`. Next.js 15.3.8 app (React 19, TypeScript, react-query 5.90, Tailwind 4).
- Remote `origin`: https://github.com/Mycliq-Community/sink-inventory.git. Branches there: `main`, `dev`, `feature-fix`.
- Checked out: `feature-fix`, level with `origin/feature-fix` at `5c27377`.
- `main` holds nothing that `feature-fix` lacks. Its extra commits are only "Merge pull request ... from feature-fix" records. A test merge of `feature-fix` into `main` (2026-11-24) was clean, and the result was identical to `feature-fix`.
- `node_modules` was installed fresh with `npm ci` on 2026-11-25.

## Not this repo

- `C:\Users\HP PC\Desktop\sink` is a different project: the Vite admin dashboard ("wages"), remote `emmanuelprince66/Sink`, branch `dev`. Don't edit it from here.
- `C:\Users\HP PC\Desktop\sink.worktrees\*` are worktrees of that admin repo, not this one.
- On 2026-11-25 this app had been pasted into the admin folder by mistake. That has been undone and both folders are clean. If something looks like admin code (`src/pages/*.jsx`, `vite.config.js`), it doesn't belong here.

## Uncommitted work: offline POS (needs commit + push)

Written in an earlier session and reviewed in this one. `npm run build` passes, type check included. It has not been tried in a browser yet.

**Purpose:** the POS opens with no connection once it has been opened online on that device.

**Files:**
- New: `public/offline-sw.js`, `src/lib/offline/appShell.ts`.
- Edited:
  - `public/firebase-messaging-sw.js`: `importScripts("/offline-sw.js")`.
  - `next.config.js`: no-cache headers for `/offline-sw.js`.
  - `src/middleware.ts`: the matcher skips `offline-sw.js`.
  - `src/components/app/layout.tsx`: calls `setUpOfflineShell()`.
  - `src/app/(dashboard)/pos/Pos.tsx`: calls `saveOfflinePage("/pos")` while online.
  - `src/api/auth/logout-user.ts`: calls `clearOfflinePages()`.

**Design:**
- The offline code is loaded into the existing Firebase worker. A second worker on scope `/` would replace it and break push notifications.
- The `/pos` page is network-first with a 6 s timeout, falling back to the saved copy.
- `/_next/static` is cache-first. Images, fonts and sounds are stale-while-revalidate.
- `/api` and RSC requests are never cached.
- Under `next dev`, saving is switched off and saved copies are cleared.
- Bump `VERSION` in `offline-sw.js` to drop every saved copy.

**Review notes, not fixed yet:**
1. An earlier report claimed other pages show the "You're offline" page when refreshed offline. That's wrong: only `/pos` page loads are handled (`offline-sw.js` fetch handler), and every other page gets the browser's own error page. Fix the code or the docs, whichever the user prefers.
2. The worker has no `skipWaiting`. A till that stays open all day only gets the updated worker after every tab of the app is closed.

**Testing on Windows:**
- `npm start` fails: the script is `NODE_ENV=production node server.mjs`, which cmd can't run.
- Use `npm run build` then `npx next start`. Note this bypasses `server.mjs`.
- Then open `/pos` online, wait a few seconds, switch DevTools to Offline and refresh. The POS should load with saved products.

**Open question for the user:** `TEST-PLAN.md` and `.vscode/` are untracked. Ask whether they go into the commit or stay out of git.

## Already shipped (pushed in `5c27377`)

- **POS stock visible to all staff.** The `inventory:view` gate was removed from the product grid, cart, variation and presale modals, and checkout stock errors, because the backend doesn't gate stock. `src/hooks/useCanSeeStock.ts` was deleted.
- **Analytics access.**
  - `src/utils/pageAccess.ts`: `/analytics` allows `reports:view` OR `sales:view`.
  - `src/hooks/useAnalyticHook.tsx`: returns `canViewReports`, and only fetches product, customer and tax analytics when it's true. Fallback with no permissions checklist: OWNER, ADMIN-ATTENDANT and ACCOUNTANT.
  - `src/app/(dashboard)/analytics/Analytics.tsx`: tabs use `canViewReports` instead of the role list. With only `sales:view`, a user gets the Sales tab only.

## Permissions model (useful context)

- `useCan().can(module, action, fallback)` in `src/hooks/useCan.ts`:
  - OWNER always gets true.
  - With a staff permissions checklist (matrix), the matrix decides.
  - With no checklist (older session), the `fallback` decides.
- Page rules live in `src/utils/pageAccess.ts`: ordered prefixes, first match wins, and any listed `module:action` is enough. The middleware uses them through a cookie.
- Labels for the permissions UI are in `src/utils/permissionsMatrix.ts`.

## Housekeeping

- `.claude/settings.json` has permission entries that point at the old path `Desktop\sink-inventory\sink\...`. They're harmless but stale, and can be pruned.
- Commit attribution and git conventions: follow the session's system instructions. Branch off and push only when the user asks.
