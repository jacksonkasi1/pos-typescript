---
## Closing summary (TOP)

- **What happened:** Desktop floor-plan zoom controls overlapped the shape palette, and palette shape names were hardcoded English strings.
- **What was done:** Zoom controls were repositioned (mobile top-right, desktop bottom-left) with palette padding as needed; `tableShapes` now use `nameKey` plus `translate`, with `TABLES.SHAPE_*` keys synced across all locale JSON files.
- **What was tested:** Puppeteer verified desktop/mobile layout at 100% and 200% zoom, Spanish and German palette labels, landing smoke, Angular build, and view-options regression — **PASS** (2026-05-28 UTC).
- **Why closed:** All acceptance criteria and tester outcomes passed; no rework required.
- **Closed at (UTC):** 2026-05-28 09:35
---

# Move floor plan zoom controls clear of shape palette; translate palette labels

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/240
- **240**

## Problem / goal

On the floor-plan canvas (`tables-canvas.component.ts`), desktop **zoom controls** (`.zoom-controls`) overlap the **shape palette** (`.shape-palette`), making both hard to use. Reposition zoom UI (e.g. bottom-left of canvas or a fixed footer below the palette) and add bottom padding on the palette list if needed. Verify at **100%** and **200%** browser zoom.

Palette shape names are hardcoded English in `tableShapes[].name` (e.g. `Square 4`, `Rectangle 4`). Replace with **i18n** keys and the `translate` pipe in the template. Add any missing keys (e.g. for `rect4`, `circle6`, `bar4`) in **all** `front/public/i18n/*.json` locales. Align naming with existing `TABLES.SHAPE_*` keys where they already exist (e.g. in `es.json`).

Related work: issue **#239** (palette text overflow) is in **UNTESTED** — do not regress that layout when moving zoom controls.

## High-level instructions for coder

- In `tables-canvas.component.ts` and its component styles, adjust `.zoom-controls` and `.shape-palette` layout so zoom buttons do not cover palette cards on desktop; consider bottom-left placement on the canvas or a dedicated strip below the palette.
- Add palette list bottom padding if the new zoom position still risks overlap at high zoom.
- Change `tableShapes` to use translation keys (e.g. `nameKey: 'TABLES.SHAPE_…'`) instead of literal `name` strings; bind labels with `translate` in the palette template.
- Add/sync keys across all locale JSON files under `front/public/i18n/`; reuse existing `TABLES.SHAPE_SQUARE_4`, `TABLES.SHAPE_RECT_6`, etc. where they match shapes; add new keys only where gaps exist.
- Manual test: floor plan at 100% and 200% zoom — zoom controls and palette both usable; switch UI to Spanish (or German) and confirm shape names are translated.
- Check `docker logs --since 5m pos-front` for a clean Angular build after edits.

## Implementation notes

- **Zoom controls:** Mobile-first top-right (palette is a bottom strip). From `768px`, bottom-left so they no longer sit under the desktop right sidebar palette.
- **Palette padding:** Extra bottom padding on mobile `.palette-shapes` so horizontal scroll area clears the canvas edge; desktop palette uses normal padding (no overlap with bottom-left zoom).
- **i18n:** `TableShape.name` → `nameKey`; template uses `{{ shape.nameKey | translate }}`. New keys: `TABLES.SHAPE_RECT_4`, `TABLES.SHAPE_ROUND_6`, `TABLES.SHAPE_BAR_4` in all `front/public/i18n/*.json` locales. Existing keys reused for square4, rect6, circle4, oval6, booth4.

## Testing instructions

1. Log in as staff with floor-plan access; open **Tables** → floor plan canvas.
2. Deselect any table so the **Add table** shape palette is visible.
3. **Desktop (≥768px):** Confirm zoom controls are at the **bottom-left** of the canvas and do not cover palette cards on the **top-right** sidebar. Use zoom in/out/reset; palette rows remain readable (no regression from #239 ellipsis layout).
4. **Mobile (<768px):** Confirm zoom controls are at **top-right** and do not cover the bottom palette strip; palette shapes scroll horizontally without clipping under zoom UI.
5. At **100%** and **200%** browser zoom, repeat steps 3–4.
6. Switch UI to **Spanish** or **German**; confirm palette shape names show translated text (e.g. `Cuadrada (4)`, `Quadrat (4)`), not English literals.
7. Smoke: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → `200`.
8. Build: `docker logs --since 5m pos-front 2>&1 | grep -iE 'error|failed'` should show no Angular compile errors.

---

## Test report

1. **Date/time (UTC):** 2026-05-28T09:24:37Z – 2026-05-28T09:27:50Z. Log window: `docker logs --since 15m pos-front` (09:12–09:28 UTC).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development`.
3. **What was tested:** Floor-plan canvas layout (desktop/mobile, 100%/200% page scale), shape palette i18n (es/de), landing smoke, Angular build, tables canvas view-options regression smoke.
4. **Results:**
   - Staff login + floor plan with Add-table palette visible — **PASS** (Puppeteer `tmp/test-issue-240-floor-plan-zoom-palette.mjs`).
   - Desktop ≥768px: zoom bottom-left in canvas, palette on right, no overlap — **PASS** (100% and 200% via CDP `Emulation.setPageScaleFactor`).
   - Mobile &lt;768px: zoom top-right in canvas, palette bottom strip, no overlap — **PASS** (100% and 200%).
   - Spanish palette labels (e.g. `Cuadrada (4)`, `Barra (4)`) — **PASS** (`pos_language=es`).
   - German palette labels (e.g. `Quadrat (4)`, `Nische (4)`) — **PASS** (`pos_language=de`).
   - `TABLES.SHAPE_*` keys present in all `front/public/i18n/*.json` — **PASS** (grep).
   - Landing `curl` → 200 — **PASS**.
   - Angular build — **PASS** (`Application bundle generation complete`; no TS/NG errors in log grep).
   - View-options / Add-table header regression (`test-tables-canvas-view-options.mjs`) — **PASS**.
5. **Overall:** **PASS**
6. **Product owner feedback:** Zoom controls and the shape palette no longer compete for the same corner on desktop; mobile keeps zoom away from the bottom palette strip. Palette shape names follow the active UI language instead of hardcoded English, which matches staff expectations on multilingual tenants.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/tables/canvas
8. **Relevant log excerpts:**

```
Application bundle generation complete. [0.517 seconds] - 2026-05-28T09:21:40.075Z
(docker logs --since 15m pos-front | grep -iE 'error|failed|TS[0-9]|NG[0-9]' → no matches)
curl http://127.0.0.1:4202/ → 200
Puppeteer i18n-es sample: ["Cuadrada (4)","Rectangular (4)",…,"Barra (4)"]
Puppeteer i18n-de sample: ["Quadrat (4)","Rechteck (4)",…,"Bar (4)"]
>>> RESULT: Tables canvas view-options test passed
```
