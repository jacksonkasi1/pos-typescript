---
## Closing summary (TOP)

- **What happened:** New tables defaulted to (0,0) and stacked invisibly on the floor plan; overlapping tables were hard to spot and join-cancel could leave bad layout.
- **What was done:** Added `table-floor-layout.util.ts` for non-overlapping default positions and overlap detection; floor plan shows yellow overlap hint and strokes; `(0,0)` renders correctly via `??` transforms; list add and palette placement use the util.
- **What was tested:** Tester PASS on demo tenant: distinct palette/list positions, overlap hint + strokes, join cancel restores pre-drag layout, Angular build clean (`54961675` on `development`).
- **Why closed:** All acceptance criteria and testing instructions passed; product owner sign-off in test report.
- **Closed at (UTC):** 2026-05-28 08:48
---

# Prevent stacked tables on floor plan (default placement + overlap hint)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/238
- **238**

## Problem / goal

New tables default to position **(0, 0)** and stack invisibly on the floor-plan canvas. Staff cannot see separate tables until they are moved. Overlapping tables should be detectable (warning or list). **x/y = 0** must be handled correctly in transforms. Table positions should restore when a join API call fails (related to join UX; see `docs/0051-table-groups-mvp.md` if present).

## High-level instructions for coder

- On table **create**, assign a non-overlapping default position (auto-offset from existing tables or grid) instead of leaving **x/y** at **0, 0**.
- On the floor-plan canvas (`tables-canvas.component.ts` and related), detect overlapping table bounds and show a clear hint (inline warning, badge, or list) so staff can fix layout.
- Ensure SVG/canvas transforms treat **0** as a valid coordinate (not “unset” / skipped).
- When **join** fails after drag, restore pre-gesture layout (align with issue **#235** behavior if not already consistent).
- Manual test: create several new tables — they should not stack at origin; drag two tables on top of each other — overlap should be visible in UI.
- Check `docker logs pos-front` for a clean build after edits.

## Implementation notes

- Added `front/src/app/tables/table-floor-layout.util.ts` with shared overlap geometry and `findNonOverlappingDefaultPosition`.
- Floor plan: `tableGroupTransform` uses `??` so **(0,0)** renders at origin; yellow overlap banner (`TABLES.LAYOUT_OVERLAP_HINT`) and stroke on overlapping tables.
- List view **Add table** and canvas **drop on overlap** assign grid positions via the util.
- Join failure/cancel layout restore unchanged (already present).

## Testing instructions

1. Log in as staff with table management access; open **Tables → Floor plan** (`/tables/canvas`).
2. On a floor with existing tables, add several tables from the shape palette (drag or tap-to-place). Confirm each new table appears in a distinct position (not stacked on one spot).
3. From **Tables** list view, use **Add table** on the same floor; switch to floor plan — new table should have a visible position (not hidden stack at origin).
4. Drag two tables so their shapes overlap. Confirm a yellow warning line appears (`data-testid="tables-layout-overlap-hint"`) listing table names, and overlapping tables show a yellow stroke.
5. Drag one table onto another, hold ~1s, release to open join dialog; **Cancel** — tables should return to pre-drag positions.
6. Confirm `docker logs --since 5m pos-front` shows no TypeScript/build errors after changes.

---

## Test report

1. **Date/time (UTC):** 2026-05-28T08:46:05Z – 2026-05-28T08:47:32Z (log window ~08:40–08:48 UTC).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`, tenant 1 (`ralf@roeber.de`).
3. **What was tested:** Palette placement (3 clicks), list **Add table** → floor plan position, overlap hint + yellow stroke, join dialog **Cancel** restores pre-drag transform, front build logs.
4. **Results:**
   - Palette adds distinct positions (not all at origin): **PASS** — 3 placements at `(1150,750)`, `(914,308)`, `(669,547)`; 2 new tables added with unique transforms.
   - List **Add table** visible on floor plan: **PASS** — last table `translate(914,308)` (non-zero).
   - Overlap hint `data-testid="tables-layout-overlap-hint"` + `.layout-overlap` stroke: **PASS** — hint visible, 7 groups marked overlap after drag.
   - Join gesture → **Cancel** restores positions: **PASS** — dragged table stayed `translate(1150,750)` before/after cancel.
   - `docker logs pos-front` clean build: **PASS** — transient `TS2741` (missing `name` on overlap probe) at 08:40–08:41 UTC resolved; `Application bundle generation complete` at 08:41:10+ and during test window.
5. **Overall:** **PASS**
6. **Product owner feedback:** Floor-plan layout is usable for staff: new tables land in separate spots, overlaps are obvious before save, and canceling a join does not leave tables stuck on top of each other. Safe to ship on `development`.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/login?tenant=1`
   2. `http://127.0.0.1:4202/tables/canvas`
   3. `http://127.0.0.1:4202/tables`
   4. `http://127.0.0.1:4202/tables/canvas` (after list add and overlap/join checks)
8. **Relevant log excerpts:**
   ```
   Application bundle generation complete. [0.605 seconds] - 2026-05-28T08:41:10.886Z
   Application bundle generation complete. [0.906 seconds] - 2026-05-28T08:42:19.588Z
   ```
   (Earlier in window: `TS2741: Property 'name' is missing` on overlap probe object — fixed before verification run; no failures during Puppeteer run.)

**Automation:** `tmp/test-238-floor-layout.mjs` (HEADLESS=1). Also ran `front/scripts/test-tables-canvas-view-options.mjs` — passed (canvas navigation smoke).
