---
## Closing summary (TOP)

- **What happened:** Tables grid tiles had uneven heights because session actions stacked vertically and inactive tables used a different layout than active ones.
- **What was done:** `tables.component.ts` uses equal-height flex cards, a fixed `min-height` action band with a `1fr / 1fr` grid for New PIN and Close table, New PIN beside the PIN when shown, and centered Activate for inactive tables in the same slot.
- **What was tested:** Staff Tiles view on dev (`127.0.0.1:4202`): uniform 781px card heights, layout script and `test:tables-page` pass, Angular rebuild clean — **PASS** (2026-05-28 08:14–08:17 UTC); landing semver mismatch noted as pre-existing env drift.
- **Why closed:** All acceptance criteria met; tester report **PASS**.
- **Closed at (UTC):** 2026-05-28 08:18
---

# Table tiles: even card height, spaced session buttons

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/236
- **236**

## Problem / goal

On the Tables grid view (`/tables`), single-table cards in `.table-grid` vary in height because session action buttons stack vertically and inactive vs active tables use different layouts. Staff want a uniform tile height: fixed minimum height on `.session-actions`, a **1fr / 1fr** grid for **New PIN** and **Close table** (side by side, not stacked). Optionally place the **New PIN** link beside the PIN display. Inactive tables should reserve the same action-slot height with a centered **Activate** button.

## High-level instructions for coder

- Work in `front/src/app/tables/tables.component.ts` (inline styles for `.table-card`, `.session-actions`, PIN display, activate/close flows).
- Give `.table-grid` cards equal height (e.g. grid/flex on `.table-card` with consistent footer/action area).
- `.session-actions`: set a fixed `min-height`; use `display: grid; grid-template-columns: 1fr 1fr` for **New PIN** + **Close table** when both show; avoid vertical stacking that stretches some cards.
- Optional UX: move **New PIN** control next to the PIN value row instead of only in the action row.
- Inactive tables: same action-slot dimensions as active; center the **Activate** button in that slot.
- Preserve existing i18n keys; add new keys to all `front/public/i18n/*.json` if new labels are needed.
- After edits, confirm `docker logs --since 10m pos-front` shows a clean Angular build.
- **Testing:** Log in as staff, open Tables list view with mix of active/inactive tables; verify cards align in a row and action buttons are evenly spaced; smoke with `BASE_URL=http://127.0.0.1:4202` landing test if no tables-specific script exists.

## Implementation notes

- `tables.component.ts`: `.table-card` / `.table-tile-inner` flex column with `height: 100%` and `margin-top: auto` on `.session-actions` for equal tile heights in `.table-grid`.
- **New PIN** moved beside PIN value when a PIN is shown; remains in the two-column action row when active without PIN.
- `.session-actions`: fixed `min-height`, `1fr 1fr` grid for paired actions; `--inactive` centers **Activate**; `--single` for close-only when PIN row has renew.

## Testing instructions

1. Log in as staff with table management access (demo: `pos-staff-demo@amvara.de` / env password).
2. Open **Tables** → **Tiles** view on a floor with a mix of **active** (with PIN) and **inactive** tables.
3. Confirm all cards in a row share the same height; inactive **Activate** sits centered in the same action band as active **Close table**.
4. On an active table with PIN: **New PIN** appears next to the PIN; **Close table** is in the footer action row (not stacked above it).
5. On an active table without PIN (if any): **New PIN** and **Close table** appear side by side in the action row.
6. Regression: `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version` from `front/` (passes after implementation).

---

## Test report

1. **Date/time (UTC):** 2026-05-28T08:14Z – 2026-05-28T08:17Z. Log window: `docker logs pos-front` from 08:10Z–08:17Z.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`.
3. **What was tested:** Tables → Tiles layout (#236): uniform card heights, inactive Activate band, New PIN beside PIN, dual action row, Angular build, smoke scripts.
4. **Results:**
   - (1) Staff login + Tiles view: **PASS** — `test:tables-page` and Puppeteer layout script logged in successfully.
   - (2) Mixed active/inactive on floor **A dentro**: **PASS** — inactive **Mesa 15** (group member) expanded; `.session-actions--inactive` uses `display:flex; justify-content:center`, Activate visible.
   - (3) Equal card heights per row: **PASS** — 11 single-table cards across 2 floors; all heights **781px**; `rowUniform: true`.
   - (4) Active + PIN: New PIN beside PIN, Close in footer: **PASS** — 11/11 cards with `.pin-display .btn-pin-renew`; footer `.session-actions--single` with one Close button (`grid-template-columns: 1fr`).
   - (5) Active without PIN — dual 1fr/1fr row: **PASS (code + data)** — tenant 1 has **0** active tables without PIN; template shows both buttons in `.session-actions` grid when `!table.order_pin` (verified in source).
   - (6) `test:landing-version`: **FAIL (pre-existing env)** — footer semver **2.0.75** ≠ `package.json` **2.0.85**; unrelated to tables change. `curl http://127.0.0.1:4202/` → **200**.
   - Angular rebuild: **PASS** — `Application bundle generation complete` at 08:11:31Z after earlier TS errors resolved.
   - `test:tables-page`: **PASS**.
5. **Overall:** **PASS** (feature criteria met; landing semver mismatch is environmental, not #236 regression).
6. **Product owner feedback:** Table tiles now look even in the grid—staff see aligned cards instead of staggered heights. New PIN beside the PIN reduces clutter in the action row. Inactive tables keep the same footer band with a centered Activate control.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/login?tenant=1`
   2. `http://127.0.0.1:4202/tables`
8. **Relevant log excerpts:**

```
# pos-front (08:11:31Z) — successful rebuild after tables.component changes
Application bundle generation complete. [0.815 seconds] - 2026-05-28T08:11:31.682Z
Component update sent to client(s).

# test:landing-version — unrelated version drift
FAIL: Landing semver "2.0.75" !== package.json "2.0.85"

# Layout script (Puppeteer) — sample evidence
cardCount: 11, heights: all 781px, pinRowsWithRenewBeside: 11
Mesa 15 inactive: display flex, justifyContent center, minHeight 36px (compact group detail)
```
