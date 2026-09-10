---
## Closing summary (TOP)

- **What happened:** Reports user guide (`docs/0016-reports.md`) omitted the overbooking slots summary card already shown in the Reports UI when count > 0.
- **What was done:** Documented Overbooking slots in the Features table and API section (`overbooking_slots_count`, link to 0025); updated `docs/README.md` 0016 blurb. Docs only — no product code.
- **What was tested:** Doc Features/API mentions, README blurb, UI/API alignment, and no back/front edits — all PASS (2026-07-26 ~09:14 UTC).
- **Why closed:** All testing criteria passed; product-owner feedback confirms the guide matches shipped UI behaviour.
- **Closed at (UTC):** 2026-07-26 09:15
---

# Align 0016 reports doc with overbooking summary

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0016-reports.md` describes summary cards (revenue, orders, average payment, reservation count/by source) but omits the **overbooking slots** summary that the Reports UI already shows when `reservations.overbooking_slots_count > 0`. Operators and agents following the doc miss a shipped metric tied to 0025 overbooking.

## Evidence (008 preflight / review)

- Stale feature guide (~128d) outside the preflight top-14 list but same docs-vs-code theme
- UI: `front/src/app/reports/reports.component.html` summary card `overbooking` / `overbooking_slots_count`
- API: `back/app/reports_routes.py` returns `overbooking_slots_count`
- Sibling task marks the **0025 plan** as shipped; this task only patches the **reports user guide**

## High-level instructions for coder

- Edit **only** `docs/0016-reports.md` (and `docs/README.md` blurb only if the one-liner is wrong).
- Add one Features-table row (or short Summary bullet) for **Overbooking slots**: count of overbooked reservation slots in the selected date range; shown when count &gt; 0; sourced from reports reservations payload.
- Optionally one cross-link to `docs/0025-reservation-overbooking-detection.md` / reservations overbooking report — do not duplicate the full 0025 design.
- No product code changes; no chart/export redesign.
- Pass/fail: doc mentions `overbooking_slots_count` (or equivalent plain language) matching the Reports UI card.

## Implementation notes (coder)

- Added **Overbooking slots** row to the Features table in `docs/0016-reports.md` (shown when count &gt; 0; field `reservations.overbooking_slots_count`; link to `docs/0025-…`).
- Documented `overbooking_slots_count` on the `GET /reports/sales` API bullet.
- Updated `docs/README.md` 0016 one-liner to mention overbooking slots when &gt; 0.
- No product code changes.

## Testing instructions

### What to verify

- `docs/0016-reports.md` documents the overbooking slots summary card and matches Reports UI/API behaviour.
- `docs/README.md` index blurb for 0016 mentions overbooking slots.
- No unrelated product or chart/export changes.

### How to test

From repo root:

```bash
# Features table + API mention overbooking_slots_count
grep -nE 'Overbooking slots|overbooking_slots_count|0025-reservation-overbooking' docs/0016-reports.md

# README index one-liner updated
grep -n '0016-reports' docs/README.md

# Optional UI smoke (stack up): confirm card exists when count > 0
# cd front && BASE_URL=http://127.0.0.1:4202 HEADLESS=1 LOGIN_EMAIL=... LOGIN_PASSWORD=... npm run test:reports
```

### Pass/fail criteria

- **PASS** if `docs/0016-reports.md` has an Overbooking slots feature row (or equivalent) that states the card shows when count &gt; 0 and names `overbooking_slots_count` (or clear plain-language equivalent), with a link or pointer to 0025; API section lists the field; README 0016 blurb is accurate; no `back/` / `front/` product edits for this task.
- **FAIL** if the doc still omits overbooking summary behaviour, contradicts the UI (`@if (…overbooking_slots_count > 0)`), or product code was changed unnecessarily.

## Test report

- **Date/time (UTC):** 2026-07-26 09:14:24 – 09:14:45 UTC (log window ~5m)
- **Environment:** branch `development`; compose `docker-compose.yml` + `docker-compose.dev.yml`; containers up (pos-front, pos-back, pos-haproxy, postgres, redis). Docs-only verification; no browser required.
- **What was tested:** Features table + API mention of overbooking slots in `docs/0016-reports.md`; README 0016 index blurb; alignment with Reports UI/API; no product code edits for this task.

### Results

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Overbooking slots feature row: shows when count > 0; names `overbooking_slots_count`; pointer to 0025 | **PASS** | `docs/0016-reports.md:26` — Features row with field name, “greater than 0”, link to `0025-reservation-overbooking-detection.md` |
| API section lists `overbooking_slots_count` | **PASS** | `docs/0016-reports.md:39` — `reservations` includes **`overbooking_slots_count`** |
| README 0016 blurb mentions overbooking slots | **PASS** | `docs/README.md:59` — “summary (incl. overbooking slots when > 0)” |
| Doc matches UI (`@if (…overbooking_slots_count > 0)`) | **PASS** | `reports.component.html:94–98` same guard and field; API `reports_routes.py` returns `overbooking_slots_count` |
| No unrelated `back/` / `front/` product edits | **PASS** | Working tree for this change: only `docs/0016-reports.md` (+2/−1) and `docs/README.md` (+1/−1) |

- **Overall:** **PASS**
- **Product owner feedback:** The reports guide now documents the overbooking summary card operators already see in the UI, including when it appears and the API field name. Cross-link to 0025 keeps the design detail out of the user guide. Index blurb is accurate for discovery.
- **URLs tested:** N/A — no browser (docs + source alignment only)

### Relevant log excerpts

Stack healthy during verification; no app code change, so no build errors expected:

```
pos-back Up 12 hours
pos-front Up 12 hours
pos-haproxy Up 3 weeks
INFO: … "GET /docs HTTP/1.0" 200 OK
```

