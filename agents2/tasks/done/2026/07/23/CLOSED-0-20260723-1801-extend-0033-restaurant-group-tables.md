---
## Closing summary (TOP)

- **What happened:** Enhancement task to document restaurant group tables in the postgres ad-hoc SQL cheat sheet.
- **What was done:** Added `restaurant_group` and `restaurant_group_member` rows plus a verified join example to `docs/0033-postgres-adhoc-sql-table-names.md`, without changing waiting-list content.
- **What was tested:** Doc `rg` hits both tables; example SQL matches models; optional `psql` dry-run returned 1 row for tenant 1 — overall **PASS**.
- **Why closed:** All pass criteria met; tester Test report overall PASS.
- **Closed at (UTC):** 2026-07-26 06:00
---

# Extend postgres ad-hoc SQL doc with restaurant_group tables

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0033-postgres-adhoc-sql-table-names.md` still lists only `"order"` / `orderitem` / `"table"`. Sibling **`NEW-0-20260722-1226-postgres-adhoc-sql-waiting-list-table`** owns **`waiting_list_entry`** (and an optional delivery note on `"order"`). Restaurant groups (#283) use **`restaurant_group`** + **`restaurant_group_member`**; operators guessing `restaurantgroup` / `group_member` will hit relation errors. Keep this task to **groups only** — do not merge with the waiting-list NEW.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:01Z: `SIGNAL docs_stale` includes `docs/0033-postgres-adhoc-sql-table-names.md`; basename already has a waiting-list NEW, but **groups tables are unqueued**
- Models: `RestaurantGroup.__tablename__ = "restaurant_group"`, `RestaurantGroupMember.__tablename__ = "restaurant_group_member"` in `back/app/models.py`
- Feature guide: `docs/0054-restaurant-groups.md` (no SQL table cheat-sheet)
- `demo_tables_check=ok`; NEW backlog deep — one-file doc addition only

## High-level instructions for coder

- Update **`docs/0033-postgres-adhoc-sql-table-names.md` only**: add rows for **`restaurant_group`** and **`restaurant_group_member`** (join via `group_id` / `tenant_id` as in models)
- One short example `SELECT` listing members for a group / tenant (verify column names against `models.py`)
- If the waiting-list NEW has not landed yet, do **not** steal `waiting_list_entry` — leave that to the sibling; optional one-liner cross-link is fine
- Pass criteria: `rg restaurant_group docs/0033-postgres-adhoc-sql-table-names.md` hits both tables; example SQL matches schema
- Append **Testing instructions** (doc + optional `psql` dry-run in Docker)

## Coder notes

- Waiting-list rows/example were already present in `docs/0033` (sibling landed); this change adds **groups only**.
- Added table rows for `restaurant_group` / `restaurant_group_member` (with wrong-name hints) and example `SELECT` joining on `group_id` / filter `tenant_id`.
- Verified example SQL against local Docker Postgres (`pos` DB): columns resolve; tenant 1 returns a member row.

## Testing instructions

### What to verify

- `docs/0033-postgres-adhoc-sql-table-names.md` documents both **`restaurant_group`** and **`restaurant_group_member`**.
- Example SQL column/join names match `RestaurantGroup` / `RestaurantGroupMember` in `back/app/models.py`.
- Waiting-list content was not removed or rewritten.

### How to test

```bash
# From repo root
rg -n 'restaurant_group' docs/0033-postgres-adhoc-sql-table-names.md
# Expect hits for both restaurant_group and restaurant_group_member (table + example)

# Optional: dry-run example against local stack
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T db \
  psql -U pos -d pos -c "
SELECT g.id AS group_id, g.name, g.join_code, g.share_products, g.share_customers,
       m.tenant_id, m.joined_at
FROM restaurant_group_member m
JOIN restaurant_group g ON g.id = m.group_id
WHERE m.tenant_id = 1;
"
```

### Pass/fail criteria

- **Pass:** `rg restaurant_group docs/0033-postgres-adhoc-sql-table-names.md` hits both table names; optional `psql` runs without “relation/column does not exist” (0 rows OK if tenant has no group).
- **Fail:** Missing either table name, wrong join columns, or waiting-list section removed.

## Test report

1. **Date/time (UTC):** start 2026-07-26T05:59:28Z, end 2026-07-26T05:59:37Z. Log window: same interval (doc + optional psql only; no front/back product change).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development` (synced via `./scripts/git-sync-development.sh`); no browser / `BASE_URL` N/A.
3. **What was tested:** Doc lists `restaurant_group` and `restaurant_group_member`; example SQL columns/joins match models; waiting-list section still present; optional `psql` dry-run.
4. **Results:**
   - Both table names documented: **PASS** — `rg -n restaurant_group docs/0033-postgres-adhoc-sql-table-names.md` hits lines 22–23 (table rows) and 61–62 (example JOIN).
   - Example SQL matches models: **PASS** — `RestaurantGroup` / `RestaurantGroupMember` use `__tablename__` `restaurant_group` / `restaurant_group_member`; columns `join_code`, `share_products`, `share_customers`, `group_id`, `tenant_id`, `joined_at` match the example SELECT.
   - Waiting-list content preserved: **PASS** — `waiting_list_entry` still in table (line 21) and example section (lines 46–54).
   - Optional psql dry-run: **PASS** — query exit 0, 1 row for tenant 1 (`group_id=9`, no relation/column errors).
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators now have the correct group table names and a verified join example in the ad-hoc SQL cheat sheet, which should cut “relation does not exist” mistakes when inspecting multi-location groups. Waiting-list guidance was left intact as required.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** No product runtime errors in scope. `psql` evidence:

```
 group_id |     name      |  join_code   | share_products | share_customers | tenant_id |          joined_at
----------+---------------+--------------+----------------+-----------------+-----------+------------------------------
        9 | Live Test 283 | 8Jtda9sWrnnG | t              | t               |         1 | 2026-07-12 11:31:22.81704+00
(1 row)
```

