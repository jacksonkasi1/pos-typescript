---
## Closing summary (TOP)

- **What happened:** Issue #140 (join/unjoin table groups MVP) was implemented and the tester ran migration, pytest, authenticated table-groups API calls, `/tables/with-status` checks, landing semver smoke, and a docs skim, with overall **PASS**.
- **What was done:** Backend table groups, slowapi `JSONResponse` fix for create/delete, SQLite/JSONB test compatibility, floor UI and staff order `table_group_label` wiring, and `docs/0051-table-groups-mvp.md` alignment per the task.
- **What was tested:** Migration `20260401140000_table_group` applied; **6** pytest passes; **POST/DELETE** `/table-groups` returned **201/200** with JSON (no **500** on success paths); group fields present on `with-status`; landing **2.0.68** after `get-commit-hash.js`; canvas was partial (API-level join validation, not full headed UI proof).
- **Why closed:** All required pass/fail gates in the test report were met (**PASS** overall).
- **Closed at (UTC):** 2026-04-01 11:39
---

# Join / unjoin tables

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/140

## Problem / goal
Staff need to treat multiple physical tables as one party: shared capacity, coherent booking, and clear rules for orders and QR/menu. Deliver a **table group** concept (e.g. `table_group_id` on `Table` or a small `TableGroup` table scoped by tenant), with APIs to create a group from N tables, dissolve it, and validate same-tenant membership and non-conflicting table state. Align session vs multiple orders on grouped tables with `docs/0008-order-management-logic.md` and `docs/0050-github-issue-52-split-plan.md` (Issue 3 — Join tables). When seating reservations, support or document MVP (e.g. join first, then seat; or target a group when party size spans tables).

**Frontend:** Floor/canvas: multi-select or explicit “Join” / “Unjoin” with a clear visual that tables are grouped. Staff orders: show the group and member tables; avoid double-booking merged capacity. **Acceptance (MVP):** staff can create and clear a join from the tables UI; orders/reservations do not double-count capacity on merged tables; document minimal safe behaviour for customer menu / table token (which token, redirects). Keep APIs extensible for possible future split-bill work.

## High-level instructions for coder
- Read `docs/0008-order-management-logic.md`, `docs/0050-github-issue-52-split-plan.md`, and related reservation/table docs before changing data model or APIs.
- Design and implement backend persistence and validation for table groups (tenant-scoped); add endpoints or extend existing table APIs as appropriate.
- Implement floor plan / tables UI for join/unjoin and group indication; wire staff order flows so capacity and booking rules stay consistent.
- Add or extend tests (API and/or e2e) for group create/dissolve, validation failures, and reservation/order behaviour on grouped tables.
- Document table-token / menu behaviour for grouped tables in a short note or existing doc if product behaviour is non-obvious.

## Coder implementation notes (2026-04-01 UTC)

1. **`POST /table-groups` / `DELETE /table-groups/{id}` HTTP 500 (slowapi):** Handlers returned plain `dict` while `@limiter.limit` is applied. slowapi requires a `starlette.responses.Response` instance to inject rate-limit headers (same pattern as `POST /tables` / `PUT /tables/{id}`). Fixed by returning **`JSONResponse`** with appropriate status codes (**201** create, **200** delete).

2. **`tests/test_reservable_capacity_turn_walkin.py` on SQLite:** In-memory `create_all` failed on `Tenant` columns using PostgreSQL **JSONB**. Tests now temporarily swap JSONB → `sqlalchemy.JSON` on `Tenant.__table__` for DDL only, then restore in `tearDown` so global model state stays correct.

---

## Testing instructions

1. **Migrate:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python -m app.migrate` — expect **`20260401140000_table_group`** applied (or “up to date”).

2. **Backend unit:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_reservable_capacity_turn_walkin.py -q` — expect **6 passed**.

3. **Table-groups API (auth):** With an owner/staff token that has `TABLE_WRITE`, two **inactive** same-floor tables with no open orders or blocking reservations:
   - **`POST /table-groups`** with body `{"table_ids":[id1,id2]}` → **201**, JSON body `id`, `table_ids`, `tenant_id` (not HTTP 500).
   - **`DELETE /table-groups/{id}`** → **200**, `dissolved`, `id`, `table_ids` (not HTTP 500).

4. **Frontend:** `GET /tables/with-status` should include **`group_member_ids`** / **`group_seat_total`** for grouped tables. Canvas: multi-select → Join → violet outline; Unjoin clears. Restart **`front`** if landing semver smoke compares to `package.json`.

5. **Staff orders:** When an order targets a table in a group, **`table_group_label`** (e.g. `T1 + T2`) should appear where implemented.

6. **Smoke:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` (ensure front container picked up current `front/package.json` version).

7. **Docs:** Skim **`docs/0051-table-groups-mvp.md`** for QR/session MVP behaviour.

### What to verify
- Join/unjoin API succeeds (no 500 from rate limiter).
- Capacity tests pass in Docker.
- UI and `/tables/with-status` stay consistent with grouped tables.

### Pass/fail criteria
- **PASS:** §2 all green; §3 returns 201/200 with JSON bodies, not 500; §6 landing semver matches `package.json` after front is current.
- **FAIL:** Any 500 on §3; pytest failures in §2; broken canvas or missing group fields if those areas were touched in this round.

---

## Test report

1. **Date/time (UTC)** and log window.
   - **Started:** 2026-04-01T11:34Z (approx.). **Finished:** 2026-04-01T11:38Z.
   - Log window for excerpts: same window (compose `back` / `front` during API + Puppeteer run).

2. **Environment**
   - **Compose:** `docker-compose.yml` + `docker-compose.dev.yml`.
   - **`BASE_URL`:** `http://127.0.0.1:4202` (HAProxy).
   - **Branch:** `development` (synced via `./scripts/git-sync-development.sh` before edits).

3. **What was tested** (from “What to verify” and Testing instructions §1–7).

4. **Results**

   | Criterion | Result | Evidence |
   |-----------|--------|----------|
   | §1 Migrate `20260401140000_table_group` | **PASS** | `app.migrate`: schema at **20260401140000**, “Database is up to date”. |
   | §2 Pytest `test_reservable_capacity_turn_walkin.py` | **PASS** | **6 passed** in ~0.72s (Docker `back`). |
   | §3 `POST` / `DELETE` `/api/table-groups` (Bearer JWT, tenant 1 owner) | **PASS** | `DELETE /table-groups/1` → **200** `{"dissolved":true,"id":1,"table_ids":[634,635]}`; `POST` `{"table_ids":[634,635]}` → **201** `id`, `table_ids`, `tenant_id`; `DELETE /table-groups/5` → **200** with `dissolved`, `id`, `table_ids`. No **500** on these successful paths. |
   | §4 `GET /tables/with-status` group fields | **PASS** | Response rows include **`group_member_ids`**, **`group_seat_total`**, **`table_group_id`** (sample keys from first table objects). |
   | §4 Canvas violet / multi-select | **PASS (partial)** | Not validated in a headed browser this run; join/unjoin covered via API; nav smoke visited `/tables` (see URLs). No evidence of broken canvas from automated checks. |
   | §5 `table_group_label` in staff orders | **PASS** | **PASS (implementation check):** `front` orders template and `ApiService` types include `table_group_label`; `back` `main.py` sets `row_out["table_group_label"]` for order listings. |
   | §6 Landing semver vs `package.json` | **PASS** | Initial run: footer **2.0.66** vs `package.json` **2.0.68** (**FAIL** until sync). After **`docker compose exec front node /app/scripts/get-commit-hash.js`**, `commit-hash.ts` updated to **2.0.68**; **`npm run test:landing-version`** exited **0** (landing text showed **2.0.68**). *Note:* Regenerating `commit-hash.ts` is the supported “front current” step; restart alone did not refresh the semver until the script ran. |
   | §7 Docs `docs/0051-table-groups-mvp.md` | **PASS** | Skimmed: staff join rules, QR/session MVP, capacity as one unit — consistent with task. |

5. **Overall:** **PASS** (all required pass/fail gates met: §2, §3, §6 after `get-commit-hash.js`; no §3 500 on successful join/dissolve).

6. **Product owner feedback**
   - Table-group **create** and **dissolve** behave correctly over HTTP (**201** / **200**) with JSON bodies, addressing the prior slowapi **500** issue. Capacity regression tests are green in Docker.
   - Operators should run **`node /app/scripts/get-commit-hash.js`** inside the **front** container (or ensure **`COMMIT_HASH`/entrypoint** on deploy) when **`package.json`** version bumps, or the landing footer semver smoke will disagree until that file is regenerated.

7. **URLs tested** (Puppeteer `test:landing-version` after semver sync)
   1. `http://127.0.0.1:4202/`
   2. `http://127.0.0.1:4202/dashboard`
   3. `http://127.0.0.1:4202/my-shift`
   4. `http://127.0.0.1:4202/staff/orders`
   5. `http://127.0.0.1:4202/reservations`
   6. `http://127.0.0.1:4202/guest-feedback`
   7. `http://127.0.0.1:4202/tables`
   8. `http://127.0.0.1:4202/kitchen`
   9. `http://127.0.0.1:4202/bar`
   10. `http://127.0.0.1:4202/customers`
   11. `http://127.0.0.1:4202/products`
   12. `http://127.0.0.1:4202/catalog`
   13. `http://127.0.0.1:4202/reports`
   14. `http://127.0.0.1:4202/working-plan`
   15. `http://127.0.0.1:4202/users`
   16. `http://127.0.0.1:4202/contracts`
   17. Inventory sublinks under `/inventory/*` (5), per script output.

   **API (curl, no browser):** `DELETE /api/table-groups/1`, `POST /api/table-groups`, `DELETE /api/table-groups/5`; `GET /api/tables/with-status` (Bearer token).

8. **Relevant log excerpts (last section)**

   `pos-back` (table-groups during this session; HAProxy path shows `/table-groups` without `/api` prefix in uvicorn):

   ```
   "DELETE /table-groups/1 HTTP/1.1" 200 OK
   "POST /table-groups HTTP/1.1" 201 Created
   "POST /table-groups HTTP/1.1" 400 Bad Request
   "DELETE /table-groups/5 HTTP/1.1" 200 OK
   ```

   *(The **400** is a second `POST` after the group already existed — expected validation, not a 500.)*

   **GitHub:** Comment added on **#140** when testing started. Label **`agent:testing`** could not be applied (`gh`: label not defined in repo). Consider creating labels per **`docs/agent-loop.md`** if desired.
