---
## Closing summary (TOP)

- **What happened:** Desktop floor-plan shape palette cards overflowed when seat labels were long (e.g. Spanish “4 asientos”), spilling text outside the sidebar cards at normal and high zoom.
- **What was done:** Stacked name and seat count in `.palette-shape-labels`, applied `min-width: 0`, flex growth, and ellipsis on name/seat lines; palette rows use full width within the 180px sidebar.
- **What was tested:** Tester PASS — Spanish UI at 100% and 200% zoom (no spill, ellipsis OK), landing smoke 200, `test:tables-canvas-view-options`, clean Angular build on `development`.
- **Why closed:** All acceptance criteria and testing instructions passed; product owner sign-off in test report.
- **Closed at (UTC):** 2026-05-28 09:11
---

# Fix shape palette text overflow on floor plan sidebar

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/239
- **239**

## Problem / goal

On the floor-plan view, the desktop **shape palette** (`.palette-shape` rows in `tables-canvas.component.ts` / styles) overflows: labels such as seat count (e.g. Spanish **“4 asientos”** via `TABLES.SEATS`) extend outside the card. Layout should stay readable at **100%** and **200%** browser zoom.

## High-level instructions for coder

- In `tables-canvas.component.ts` (template) and associated SCSS, fix `.shape-palette` / `.palette-shape` row layout so name and seat count do not overflow the card.
- Prefer stacking **name** and **seat count** vertically, **`min-width: 0`**, and text ellipsis where needed; alternatively widen `.shape-palette` modestly (~180px) if that matches the design system.
- Use existing i18n keys (`TABLES.SEATS`); do not hard-code Spanish-only strings.
- Verify at **100%** and **200%** zoom with a long seat label (e.g. Spanish UI).
- Check `docker logs pos-front` for a clean build after edits.

## Implementation notes

- Wrapped shape name and seat count in `.palette-shape-labels` (vertical stack).
- Added `min-width: 0`, flex growth on desktop row layout, and ellipsis on `.palette-shape-name` / `.palette-shape-seats`.
- Desktop `.palette-shape` rows use `width: 100%` within the 180px sidebar.

## Testing instructions

1. Log in as staff with floor-plan access; open **Tables** → floor plan canvas (`/tables` or tables canvas route).
2. Deselect any table so the **Add table** shape palette appears (desktop: right sidebar; mobile: bottom strip).
3. Switch UI language to **Spanish** (or German) so seat labels are long (e.g. `4 asientos`, `4 Sitzplätze`).
4. At **100%** browser zoom: confirm each palette card keeps name and seat text inside the border; long names truncate with ellipsis instead of spilling out.
5. Repeat at **200%** zoom (browser zoom, not OS scaling only).
6. Smoke: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → `200`.
7. Build: `docker logs --since 5m pos-front 2>&1 | grep -iE 'error|failed'` should show no Angular compile errors after the change.

---

## Test report

1. **Date/time (UTC):** 2026-05-28T09:06:00Z – 2026-05-28T09:10:11Z. Log window: same window on `pos-front`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` (synced before test).
3. **What was tested:** Staff floor-plan shape palette with Spanish seat labels at 100% and 200% zoom; landing smoke; Angular build health; tables canvas regression (`test:tables-canvas-view-options`).
4. **Results:**
   - Staff login + floor plan canvas with palette visible (no table selected): **PASS** — 8 `.palette-shape` cards, sidebar visible.
   - Spanish UI (`pos_language=es`), long seat text (`4 asientos`, `6 asientos`): **PASS** — translated shape names (e.g. `Cuadrada (4)`).
   - 100% zoom — text inside card borders, no spill (`getBoundingClientRect` vs card): **PASS** — all 8 shapes `spills: false`.
   - 200% zoom (`document.body.style.zoom = 200%`): **PASS** — all 8 shapes `spills: false`, cards scale (154px → 308px width).
   - Ellipsis / overflow CSS on labels: **PASS** — `ellipsisOk: true` on all sampled labels.
   - `curl` smoke → 200: **PASS**.
   - `test:tables-canvas-view-options` (tenant 1): **PASS**.
   - Front build after change: **PASS** — transient TS2353 errors during concurrent #240 edit resolved; final logs show `Application bundle generation complete` (09:04:47–09:05:03Z) with no errors in verification window.
5. **Overall:** **PASS**
6. **Product owner feedback:** The shape palette sidebar now keeps Spanish seat counts readable inside each card at normal and doubled zoom. Long names stack vertically with ellipsis instead of breaking the layout. Safe to ship with the related #240 zoom/i18n work already on the branch.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/login?tenant=1`
   2. `http://127.0.0.1:4202/tables/canvas`
8. **Relevant log excerpts:**

```
Application bundle generation complete. [0.011 seconds] - 2026-05-28T09:05:03.793Z
Page reload sent to client(s).
```

(Earlier in window: transient `TS2353: 'name' does not exist in type 'TableShape'` during overlapping #240 coder edits; cleared before verification completed.)
