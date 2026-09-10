---
## Closing summary (TOP)

- **What happened:** Postgres ad-hoc SQL doc listed order/table names but omitted the shipped waiting-list table, inviting wrong guesses.
- **What was done:** Documented `waiting_list_entry` with tenant/status filter and example SELECT; noted Satisfecho Delivery lives on `"order"` (no `deliveryorder` table).
- **What was tested:** `rg` found `waiting_list_entry` in the doc; example SQL returned 5 live rows via Docker `psql` — overall PASS.
- **Why closed:** All pass/fail criteria met; tester overall PASS; doc-only change.
- **Closed at (UTC):** 2026-07-26 05:21
---

# Extend postgres ad-hoc SQL doc with waiting_list_entry

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0033-postgres-adhoc-sql-table-names.md` helps operators avoid the fake `restaurantorder` table, but only lists `"order"`, `orderitem`, and `"table"`. Since waiting list shipped (#282), ad-hoc queries often need **`waiting_list_entry`**. The doc is flagged stale while code moved; a small table-name addition prevents wrong guesses (`waitinglist`, `waitlist`, etc.).

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` — `docs/0033-postgres-adhoc-sql-table-names.md` age_days≈110
- Model: `WaitingListEntry.__tablename__ = "waiting_list_entry"` in `back/app/models.py`
- Queue already covers many other stale docs (PRINTING, 0026, 0014, README); **0033 only** here
- Skip bulk roadmap/plan docs (0023/0029/0050/0032)

## High-level instructions for coder

- Update **`docs/0033-postgres-adhoc-sql-table-names.md` only**: add a row for waiting-list entries → **`waiting_list_entry`**, note `tenant_id` / status filter, and one short example `SELECT` (active `waiting`/`notified` for tenant 1).
- Optional one-liner: Satisfecho Delivery lives on **`"order"`** (channel/address columns) — no separate `deliveryorder` table — if that fits without bloating the doc.
- Do not invent tables; verify names against `models.py` / migrations.
- Pass criteria: `rg waiting_list_entry docs/0033-postgres-adhoc-sql-table-names.md` matches; example SQL is valid against current schema.
- Append **Testing instructions** (doc + optional `psql` dry-run in Docker).

## Coder notes

- Updated **`docs/0033-postgres-adhoc-sql-table-names.md` only** (no product code).
- Added table row for **`waiting_list_entry`** with `tenant_id` / status values from `WaitingListStatus`.
- Added example `SELECT` for active `waiting`/`notified` rows (tenant 1).
- Optional delivery note on **`"order"`**: Satisfecho Delivery uses `order_channel` / `delivery_address`; no `deliveryorder` table.
- Verified table name against `WaitingListEntry.__tablename__` in `back/app/models.py`; dry-ran example SQL in Docker `psql` (returned rows).

## Testing instructions

### What to verify

- `docs/0033-postgres-adhoc-sql-table-names.md` documents **`waiting_list_entry`** (not waitlist/waitinglist).
- Example SQL for active waiting-list rows is present and valid against the live schema.
- Optional: `"order"` notes that delivery is not a separate table.

### How to test

```bash
# From repo root
rg -n 'waiting_list_entry' docs/0033-postgres-adhoc-sql-table-names.md

# Optional: dry-run example SQL (stack up)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T db \
  psql -U pos -d pos -c "
SELECT id, customer_name, party_size, status, notified_at, created_at
FROM waiting_list_entry
WHERE tenant_id = 1
  AND status IN ('waiting', 'notified')
ORDER BY created_at
LIMIT 5;
"
```

### Pass/fail criteria

- **Pass:** `rg` finds `waiting_list_entry` in the doc; `psql` query succeeds (0+ rows, no relation/column errors).
- **Fail:** Doc still omits waiting list, invents wrong table names, or example SQL errors against current DB.

## Test report

1. **Date/time (UTC):** 2026-07-26 05:20:51–05:20:56 UTC. Log window: `docker logs --since 5m` on `pos-postgres` / `pos-back` (no errors in window; verification via `psql` stdout).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development`; local DB `pos` via `pos-postgres` (`psql -U pos -d pos`). No browser (`BASE_URL` N/A).
3. **What was tested:** Doc documents `waiting_list_entry`; example active-queue SQL runs against live schema; optional `"order"` / no-`deliveryorder` note present.
4. **Results:**
   - Doc names `waiting_list_entry` (not waitlist/waitinglist): **PASS** — `rg` hits lines 21 and 48 in `docs/0033-postgres-adhoc-sql-table-names.md`.
   - Example SQL valid: **PASS** — `psql` returned 5 rows (`waiting`/`notified` for tenant 1); no relation/column errors.
   - Optional delivery note on `"order"`: **PASS** — line 18 notes `order_channel` / `delivery_address` and no `deliveryorder` table.
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators now have the correct waiting-list table name and a copy-paste query that works on the live DB. The short delivery note on `"order"` should stop guesses at a separate delivery table. Doc-only change; no product risk.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
```text
# rg
21:| Walk-in **waiting list** | **`waiting_list_entry`** | ...
48:FROM waiting_list_entry

# psql (excerpt)
 id | customer_name | party_size |  status  | ...
 43 | Jonas Berg    |          4 | waiting  | ...
 45 | Marco Bianchi |          2 | notified | ...
(5 rows)
```
