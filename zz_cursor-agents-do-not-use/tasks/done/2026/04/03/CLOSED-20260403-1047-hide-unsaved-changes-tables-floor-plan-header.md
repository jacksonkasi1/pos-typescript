---
## Closing summary (TOP)

- **What happened:** GitHub issue #157 requested hiding the visible “unsaved changes” label in the tables floor-plan header while keeping dirty tracking, autosave, Save layout, and navigation guards unchanged.
- **What was done:** The coder removed the header unsaved-changes span and `.unsaved-indicator` styles from `tables-canvas`; `hasUnsavedChanges()` and related save/guard logic were left intact per the task.
- **What was tested:** Angular front build, `test:landing-version`, `test-tables-canvas-view-options.mjs`, and manual checks (no banner, Save layout when dirty, `canDeactivate` confirm on failed save)—all **PASS** per the tester report.
- **Why closed:** All testing instructions and acceptance criteria were met; tester overall **PASS**.
- **Closed at (UTC):** 2026-04-03 10:57
---

# Hide “unsaved changes” label on tables floor-plan header

## GitHub Issues
- [github.com/satisfecho/pos/issues](https://github.com/satisfecho/pos/issues)
- `gh issue list --repo satisfecho/pos --state open --limit 40`
- Optional: `--json number,title,labels,updatedAt,url`
- **Issue:** https://github.com/satisfecho/pos/issues/157

## Problem / goal
Remove the visible unsaved-changes indicator in the tables floor-plan header (the `TABLES.UNSAVED_CHANGES` span in header actions) and clean up any now-unused `.unsaved-indicator` styles. Keep all dirty-state logic intact: `hasUnsavedChanges`, autosave behavior, Save layout enablement, and `canDeactivate` / `beforeunload` must continue to work as today—only hide that UI text.

## High-level instructions for coder
- In `tables-canvas` (component template/styles as referenced in the issue), remove or stop rendering the header unsaved-changes label while preserving underlying state.
- Remove dead CSS for `.unsaved-indicator` if nothing else relies on it; grep for other uses before deleting.
- Do not weaken navigation guards or save flows; smoke the tables floor plan after edits (drag layout, confirm Save / leave prompts still behave).
- Relevant context: recent floor-plan / canvas work in `docs/` or closed tasks under `agents/tasks/done/` if you need UX expectations for dirty layout.

## Implementation notes (coder)
- **`front/src/app/tables/tables-canvas.component.ts`:** Removed the `@if (hasUnsavedChanges())` block that rendered the translated span; removed `.unsaved-indicator` styles. **`hasUnsavedChanges()`** still drives **Save layout** `[disabled]` and all existing dirty tracking, autosave, guards, and `beforeunload`.

## Testing instructions
1. **Angular build:** With stack up (`docker compose -f docker-compose.yml -f docker-compose.dev.yml`), confirm `docker compose … logs --tail=40 front` shows **Application bundle generation complete** with no TS/template errors after the change.
2. **Smoke:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` — exit 0.
3. **Tables canvas:** `BASE_URL=http://127.0.0.1:4202 node front/scripts/test-tables-canvas-view-options.mjs` — exit 0.
4. **Manual (recommended for tester):** Log in → `/tables/canvas` → drag a table → confirm **no** “Unsaved changes” text in the header, but **Save layout** enables while dirty and works; navigate away with dirty layout and confirm **canDeactivate** / confirm dialog still appears as before; after save or discard, navigation works.

---

## Test report

1. **Date/time (UTC):** 2026-04-03 10:50–10:56 (approximately). Log window: same window for `docker compose … logs front` excerpts below.
2. **Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch **`development`** @ `7a700d0`; host Node + Puppeteer (Chrome at default path); credentials from repo `.env` (demo tenant 1).
3. **What was tested:** Items 1–4 under **Testing instructions** above; manual checks executed via headless Puppeteer from `front/` (no edits under `front/` for verification).
4. **Results:**
   - **Angular build (no TS/template errors in front logs):** **PASS** — `pos-front` log ends with `Application bundle generation complete. [0.719 seconds] - 2026-04-03T10:48:32.828Z` (no error lines in tail).
   - **`test:landing-version`:** **PASS** — exit code 0, `>>> RESULT: Landing version OK; demo login (tenant=1) OK; sidebar nav OK.`
   - **`test-tables-canvas-view-options.mjs`:** **PASS** — exit code 0, floor plan / tiles / table view switching OK.
   - **Manual — no “Unsaved changes” (and related translations) in header; `.unsaved-indicator` absent:** **PASS** — after login, header text checked; no matching phrases; `document.querySelector('.unsaved-indicator')` null. Table drag uses first `g.table-group` whose shape center passes `elementFromPoint` (avoids zoom controls overlapping DOM-first table).
   - **Manual — Save layout enabled while dirty:** **PASS** — during drag (after moves), primary “Save layout” button `disabled === false`.
   - **Manual — `canDeactivate` / confirm when leave blocked:** **PASS** — With layout dirty and `PUT /api/tables/{id}` aborted via request interception, navigating to Dashboard triggered `window.confirm` with `TABLES.LEAVE_UNSAVED_LAYOUT` English copy (“The floor layout could not be saved…”). **Note:** With a **successful** autosave, `confirmCanDeactivate` resolves without `window.confirm` (existing design: flush then leave). Dialog was verified on the **save-failed** path per `tables-canvas.component.ts` `confirmCanDeactivate`.
5. **Overall:** **PASS** (all criteria met).
6. **Product owner feedback:** The header no longer shows an unsaved banner; staff still get a clear **Save layout** affordance while the layout is dirty, and the app still tries to persist on exit and only shows the browser confirm if saving fails. No change to risk profile for losing layout work beyond the removed redundant label.
7. **URLs tested (numbered):**
   1. `http://127.0.0.1:4202/`
   2. `http://127.0.0.1:4202/login?tenant=1`
   3. `http://127.0.0.1:4202/dashboard` (and other sidebar targets from `test:landing-version`)
   4. `http://127.0.0.1:4202/tables/canvas`
   5. `http://127.0.0.1:4202/tables` (tiles/table modes during view-options script)
8. **Relevant log excerpts:**
   - Front (build OK): `Application bundle generation complete. [0.719 seconds] - 2026-04-03T10:48:32.828Z` (`docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=15 front`).
