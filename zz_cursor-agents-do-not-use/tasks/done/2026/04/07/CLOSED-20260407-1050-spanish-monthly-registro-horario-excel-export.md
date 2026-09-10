---
## Closing summary (TOP)

- **What happened:** Issue #170 requested a Spanish-style monthly **registro horario** `.xlsx` export (official paper-style layout) alongside existing attendance exports.
- **What was done:** A distinct export path and UI (**Download registro horario (ES)**) were implemented with tenant header fields (including CCC via migration `20260407120000_tenant_ccc`), per-day grid with **Firma del empleado** on every row, and backend aggregation aligned with the spec.
- **What was tested:** Migration, pytest (`test_registro_horario_excel`, `test_attendance_excel`), Reports flow / network download for a month with data, and frontend build logs — **all PASS** per the tester report.
- **Why closed:** Acceptance criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-04-07 11:07
---

# Spanish monthly time record (registro horario) Excel export — spec

## GitHub Issues
- [github.com/satisfecho/pos/issues](https://github.com/satisfecho/pos/issues)
- `gh issue list --repo satisfecho/pos --state open --limit 40`
- Optional: `--json number,title,labels,updatedAt,url`
- **Issue:** https://github.com/satisfecho/pos/issues/170

## Problem / goal
Deliver a **Spanish-style monthly “registro horario”** export as **`.xlsx`** that follows the **official paper-style layout** as closely as product data allows. This is **additive**: keep the existing “one row per work session” attendance export unless product explicitly replaces it; prefer a **new export type** or file so there is no silent regression.

Per employee and calendar month, the workbook should include:

- **Header:** company name, CIF/NIF, workplace/center, CCC (or equivalent), and other legal header fields — populated from tenant/company settings where they exist; otherwise leave cells blank but preserve rows/labels. **Employee:** employee number (from user profile when configured) and full name. **Period:** month/year of the export.
- **Daily grid (one row per calendar day 1…28/29/30/31):** weekday/date column suitable for Spanish locale; **planned** shift blocks (morning/afternoon entry-exit or equivalent) when schedule data exists, else empty; **actual** clocked blocks from **closed work sessions** (and breaks) aggregated per calendar day, with display rules documented in code comments if non-obvious; **signature column on every day row** (cells empty for ink on paper — never omit the column).
- **Footer:** monthly total hours per defined business rule; optional rows for employee/company signature placeholders (empty cells).
- **Optional static legal/footer text** in Spanish (e.g. reference to RD-ley 8/2019) if product wants parity with paper forms.

**Data / Excel quality:** extend tenant/user schema if CIF, CCC, etc. are required but missing; respect tenant timezone when aggregating sessions; empty days still get a row (product decision: blank vs “—” but be consistent); column widths so headers are not truncated; hours as decimals with locale-appropriate separators or consistent `hh:mm`.

**Acceptance:** download is `.xlsx` with **signature column on every daily row** (always empty); clarify one sheet per employee per month vs one workbook per employee to match UI (multi-staff may need multiple sheets). **Out of scope:** capturing real digital signatures — only empty cells.

## High-level instructions for coder
- Locate existing **attendance / monthly / Excel** export paths (reports API and UI) and add a **distinct** export entry point or file type for this template; keep the legacy session-based export unless explicitly superseded.
- Map **tenant** and **user** fields to header block; add or migrate DB fields only where needed for legal header data (CIF, CCC, etc.), with migrations and tenant scoping consistent with the rest of the app.
- Implement **per-day aggregation** of work sessions (and breaks) in tenant timezone; integrate **planned** shifts from working plan when available; document non-obvious split rules (e.g. morning vs afternoon columns) in code comments.
- Build the **Excel** with stable column layout, signature column on **each** day row, footer totals, and optional legal text block; set column widths and number/date formats appropriately for Spanish locale expectations.
- Add or extend tests (backend and/or smoke) so the new export generates valid `.xlsx` and does not break existing export routes.
- See `docs/` for reports, attendance, and tenant settings patterns if present; align with i18n and security rules (no secrets in exports).

## Testing instructions

1. **Migrate:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate` (expect **`20260407120000_tenant_ccc`** applied).
2. **Backend:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_registro_horario_excel.py tests/test_attendance_excel.py -q`
3. **Manual:** Log in as a user with **`report:read`**, open **Reports**, pick a month with attendance (or select staff), click **Download registro horario (ES)** — file `registro_horario_YYYY_MM.xlsx` should open with one sheet per employee, **Firma del empleado** column on each day row, header/totals/footer. Optionally set **Settings → Business → CCC** and confirm it appears in the export header.
4. **Frontend build:** After `front/` edits, `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=80 front` — no Angular/TS errors.

## Test report

1. **Date/time (UTC) and log window:** 2026-04-07T11:05Z – 2026-04-07T11:20Z (verification run).
2. **Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202` (HAProxy); branch **`development`** (synced via `./scripts/git-sync-development.sh` before edits). Credentials: repo **`.env`** `DEMO_LOGIN_*` mapped to Puppeteer `LOGIN_*` where used.
3. **What was tested:** Task **Testing instructions** items 1–4 (migrate `20260407120000_tenant_ccc`, backend pytest for registro horario + attendance Excel, manual/UI flow for **Download registro horario (ES)** with a month that has data, front build logs).
4. **Results:**
   - **Migrate `20260407120000_tenant_ccc`:** **PASS** — `app.migrate` reports schema version **20260407120000**; migration **`20260407120000_tenant_ccc`** listed applied.
   - **Pytest** (`tests/test_registro_horario_excel.py`, `tests/test_attendance_excel.py`): **PASS** — `4 passed in 2.71s`.
   - **Manual / UI (Reports → registro horario):** **PASS** — `npm run test:reports` (HEADLESS=1, demo login) exit 0; attendance Excel section present. Additional check: Puppeteer set `#attendance-excel-month` to **2026-03**, clicked button matching **registro horario**; network response **`GET …/attendance-registro-horario-excel?year=2026&month=3`** returned **200** with **`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`** (~6590 bytes). (Default month alone returned **404** until a month with attendance was selected — expected.)
   - **Optional CCC in Settings:** **N/A** — not required for PASS; backend tests cover tenant **CCC** in export path.
   - **Frontend build (docker logs):** **PASS** — last **`front`** log lines show **Application bundle generation complete** with no `ERROR` / `TS` / `NG` failures in the `--tail=80` window.
5. **Overall:** **PASS**
6. **Product owner feedback:** The Spanish monthly **registro horario** export is verified end-to-end: API tests confirm the **Firma del empleado** column and grid structure, and the Reports UI successfully requests the **.xlsx** for a month with attendance. Users should pick a month (or staff) that has clocked sessions to avoid a **no data** response.
7. **URLs tested (numbered):**
   1. `http://127.0.0.1:4202/login`
   2. `http://127.0.0.1:4202/dashboard` (post-login)
   3. `http://127.0.0.1:4202/reports`
   4. Network: `http://127.0.0.1:4202/api/reports/attendance-registro-horario-excel?year=2026&month=3` (via browser; same origin through HAProxy)
8. **Relevant log excerpts (last section)**

**Migrate (back container, excerpt):**
```
INFO: Database schema version (max applied): 20260407120000
...
INFO:   - 20260407120000_tenant_ccc.sql (version: 20260407120000, type: timestamp, status: applied)
✅ Database schema version: 20260407120000
```

**Pytest (back container):**
```
....                                                                     [100%]
4 passed in 2.71s
```

**Front (compose, excerpt):**
```
pos-front  | Application bundle generation complete. [6.760 seconds] - 2026-04-07T11:00:55.805Z
pos-front  | Watch mode enabled. Watching for file changes...
```
