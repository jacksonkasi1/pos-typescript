---
## Closing summary (TOP)

- **What happened:** POS migration import MVP (#321) was implemented and verified (CSV products/categories cutover toolkit).
- **What was done:** Added CSV parse + CLI `import_products_csv` reusing bulk-import preview/confirm; sample fixture, runbook `docs/0062-pos-migration-import.md`, and CHANGELOG entry; tables/customers/orders left as follow-ups.
- **What was tested:** 17 pytest cases, CLI dry-run on sample CSV, invalid apply refused (blank name / price=0) with no writes, docs/CHANGELOG spot-check, landing 200 — overall **PASS**.
- **Why closed:** All acceptance criteria passed.
- **Closed at (UTC):** 2026-07-26 17:41
---

# Import existing POS / migration toolkit

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/321
- **321**

## Problem / goal

Restaurants switching from another POS need a **repeatable import path** (products, tables, customers; optionally historical orders) so they are not stuck re-entering catalogs by hand. Today only demo/catalog seed imports exist — no generic migration toolkit or cutover runbook. Blocker for real adoption (umbrella **#52** / `docs/0050-github-issue-52-split-plan.md` Issue 5; roadmap `docs/0032-github-issues-roadmap.md`).

## High-level instructions for coder

- Design MVP around **one happy path**: e.g. products + categories from a **sample CSV** with a clear column ↔ model mapping; keep tables/customers/orders as follow-ups unless a thin shared import framework is cheap.
- Prefer an **idempotent** CLI (or minimal admin UI) with **dry-run + validation report** before commit; never corrupt existing tenant data on bad rows.
- Reuse patterns from existing wine/beer/pizza / demo seeds where useful; do not invent a second parallel catalog pipeline.
- Add a short **`docs/`** cutover runbook: pre-checks, dry-run, apply, rollback, smoke tests.
- Cover with tests (validation failures, happy-path import) and a `CHANGELOG.md` entry; append **Testing instructions**.
- Stay tenant-scoped; no cross-tenant writes; no secrets or live customer PII in fixtures.

## Implementation notes

- Reused existing `app.product_bulk_import` preview/confirm (same idempotency as Products → bulk import JSON).
- Added `parse_products_csv` + CLI `python -m app.seeds.import_products_csv`.
- Sample: `back/fixtures/migration/sample_products.csv`.
- Runbook: `docs/0062-pos-migration-import.md`.
- Follow-ups (not in MVP): tables, customers, historical orders.

## Testing instructions

1. **Unit tests (required):**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
     python3 -m pytest tests/test_import_products_csv.py tests/test_product_bulk_import.py -q
   ```
   Expect all passed.

2. **CLI dry-run (no writes):**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
     python -m app.seeds.import_products_csv \
     --tenant-id 1 \
     --csv /app/fixtures/migration/sample_products.csv \
     --dry-run
   ```
   Expect `invalid=0` and `[dry-run] no database writes.`

3. **Invalid CSV refuses apply:** create a temp CSV with a blank `name` or `price=0`; run with `--apply`; expect exit code `1` and **no** new products for that tenant.

4. **Optional apply on a scratch tenant** (not required on demo tenant 1 if you want to keep the menu clean): run `--apply` once, confirm products appear in staff **Products**; re-run `--apply` and confirm updates (same names) rather than duplicates.

5. **Docs:** skim `docs/0062-pos-migration-import.md` column map + checklist; `CHANGELOG.md` Unreleased mentions #321.

## Test report

1. **Date/time (UTC):** start 2026-07-26 17:40:21 UTC; end 2026-07-26 17:40:44 UTC. Log window: `--since 15m` on `pos-back` / `pos-front`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development`; BASE_URL `http://127.0.0.1:4202` (HAProxy). No browser UI required for this task’s required steps.
3. **What was tested:** unit tests for CSV parse/import + bulk import; CLI `--dry-run` on sample CSV; `--apply` refused on blank name and `price=0`; product count unchanged on tenant 1; docs/CHANGELOG spot-check. Optional scratch-tenant apply skipped (keep demo menu clean).
4. **Results:**
   - Unit tests (`test_import_products_csv.py` + `test_product_bulk_import.py`): **PASS** — `17 passed` in 3.06s.
   - CLI dry-run sample CSV: **PASS** — `invalid=0`, `valid=7`, `[dry-run] no database writes.`
   - Invalid CSV blank name `--apply`: **PASS** — exit `1`, `errors=name_required`; tenant 1 product count 17→17.
   - Invalid CSV `price=0` `--apply`: **PASS** — exit `1`, `errors=price_must_be_positive`.
   - Docs `docs/0062-pos-migration-import.md`: **PASS** — column map + dry-run/apply/rollback checklist present.
   - CHANGELOG Unreleased #321: **PASS** — Migration (#321) CSV cutover toolkit entry present.
   - Landing HTTP: **PASS** — `curl` `/` → 200.
5. **Overall:** **PASS**
6. **Product owner feedback:** Migration MVP is usable for a products+categories cutover: dry-run is honest, bad rows never write, and the runbook matches the CLI. Optional live apply on a scratch tenant was not needed given unit coverage of create/update idempotency. Ready for closer archive.
7. **URLs tested:** N/A — no browser (CLI/pytest/docs only). Smoke: `http://127.0.0.1:4202/` → 200.
8. **Relevant log excerpts:**
   - Pytest: `17 passed, 1 warning in 3.06s`
   - Dry-run: `total=7 valid=7 invalid=0` / `[dry-run] no database writes.`
   - Invalid apply: `ERROR: invalid rows present…` / `EXIT:1` / product count unchanged
   - `pos-front` `--since 15m`: no TS/NG compile errors in grep window
