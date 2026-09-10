---
## Closing summary (TOP)

- **What happened:** Branch hub fulfillment (central kitchen → branches) was implemented and verified end-to-end for issue #323.
- **What was done:** ADR + migration for restaurant-group hub and `branch_hub_fulfillment`; API (hub set, request, list, status patch) and Settings/Orders UI for HQ prep request and inbox.
- **What was tested:** Migration, 4 pytest cases, API happy path with tenant isolation, hub inbox + branch Request HQ prep UI, landing-version smoke — overall **PASS**.
- **Why closed:** All acceptance criteria passed; MVP usable end-to-end with outsider 404 isolation.
- **Closed at (UTC):** 2026-07-26 15:09
---

# Branch displays (central kitchen → branches)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/323
- **323**

## Problem / goal

One **production kitchen** should fulfill items for **multiple branches** (sucursales): transfer, visibility, and internal billing between sites. Restaurant groups (`docs/0054-restaurant-groups.md`, #283) already share billing customers/catalog across tenants, but there is no “produced at hub / fulfilled for branch” model. From umbrella **#52** Phase C (`docs/0050-github-issue-52-split-plan.md`). Overlaps multi-warehouse (**#320** / `docs/0061-multi-warehouse-inventory.md`) — align location concepts before inventing a second stock model.

## High-level instructions for coder

- **Phase 0 first:** short ADR choosing same-tenant multi-location vs linked-tenant transfer; prefer extending restaurant groups (`docs/0054-restaurant-groups.md`) and warehouse locations (`docs/0061-multi-warehouse-inventory.md`) over a parallel hierarchy.
- Coordinate with **#320** (multi-warehouse) so “hub kitchen” and warehouse locations share one vocabulary; do not ship conflicting schemas.
- MVP slice after ADR: a branch order can show a “prepared at HQ” state **or** generate a transfer record (pick one smallest end-to-end path).
- Defer full internal billing between sites unless needed for the MVP acceptance cut.
- Tenant isolation + pytest for the chosen slice; document the ADR under `docs/`; `CHANGELOG.md`; append **Testing instructions**.

## Implementation notes

- **ADR:** Linked tenants via restaurant groups + optional `hub_tenant_id`; warehouses remain same-tenant stock bins (`docs/0069-branch-hub-fulfillment.md`).
- Migration `back/migrations/20260726172000_branch_hub_fulfillment.sql`: `restaurant_group.hub_tenant_id`, table `branch_hub_fulfillment`.
- API: `PUT /restaurant-group/hub`, `POST /orders/{id}/hub-fulfillment`, `GET /hub-fulfillments`, `PATCH /hub-fulfillments/{id}`; `GET /orders` includes `hub_fulfillment` / `can_request_hub_fulfillment`.
- UI: Settings → Restaurant group hub selector + hub inbox; Orders badge + Request HQ prep.
- Tests: `back/tests/test_branch_hub_fulfillment.py` (4 passed).

## Testing instructions

1. **Migration:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python -m app.migrate`  
   Expect schema version includes `20260726172000`.

2. **Backend tests:**  
   `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python3 -m pytest tests/test_branch_hub_fulfillment.py -q`  
   Expect **4 passed**.

3. **API happy path (two owners in one restaurant group):**  
   - Hub owner: `PUT /restaurant-group/hub` with `{"hub_tenant_id": <hub_tenant_id>}` → 200, `is_hub: true`.  
   - Branch: `POST /orders/{order_id}/hub-fulfillment` with `{}` → status `requested`.  
   - Hub: `GET /hub-fulfillments` lists the row; `PATCH /hub-fulfillments/{id}` with `{"status":"prepared_at_hq"}` → 200.  
   - Branch: `GET /orders` shows `hub_fulfillment.status == prepared_at_hq`.  
   - Outsider tenant: same PATCH → **404**.

4. **UI:** Settings → Restaurant group → set hub → as hub, use inbox **Mark prepared at HQ**. On a branch with hub set, Orders → **Request HQ prep** → badge updates after hub marks prepared.

5. **Front health:** `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front`. Confirm `docker logs --since 10m pos-front` has no TS/NG build errors.

## Test report

1. **Date/time (UTC):** 2026-07-26 15:07:12 start → 15:09:16 end. Log window: `docker logs --since 15m` (pos-back, pos-front).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Migration `20260726172000`; pytest `test_branch_hub_fulfillment.py`; API happy path (hub/branch/outsider); Settings hub inbox + Orders Request HQ prep UI; landing-version smoke + front compile health.
4. **Results:**
   - Migration includes `20260726172000` — **PASS** — migrate reported `Database schema version: 20260726172000`.
   - Backend tests 4 passed — **PASS** — `pytest tests/test_branch_hub_fulfillment.py -q` → `4 passed in 3.56s`.
   - API happy path (PUT hub → POST fulfillment → GET list → PATCH prepared → branch orders; outsider PATCH 404) — **PASS** — live TestClient against DB: `OVERALL_API_HAPPY_PATH PASS` (ff id 5; outsider 404).
   - UI hub inbox Mark prepared + branch Request HQ prep / badges — **PASS** — hub Settings showed inbox #2422 “Solicitado” → click “Marcar preparado en HQ” → “Preparado en HQ”; branch Orders #2422 badge “Prepared at HQ”; #2423 “Request HQ prep” → badge “HQ prep requested”; back logged `PATCH /hub-fulfillments/6` 200 and `POST /orders/2423/hub-fulfillment` 200.
   - Front health (landing + no TS/NG errors) — **PASS** — `test:landing-version` RESULT OK; current compile `Application bundle generation complete` (15:05:28Z). Note: earlier in the 10m window, unrelated WIP (`promos` settings section) briefly caused TS2367/TS2345 and a parse error; those cleared before UI verification — not caused by #323.
5. **Overall:** **PASS**
6. **Product owner feedback:** Central-kitchen MVP is usable end-to-end: designate hub in restaurant group, branch requests HQ prep from Orders, hub marks prepared from Settings inbox, and the badge reflects status. Tenant isolation (outsider 404) behaves as expected for a multi-site kitchen slice.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login (hub owner)
   2. http://127.0.0.1:4202/dashboard (hub)
   3. http://127.0.0.1:4202/settings (hub → Grupo de restaurantes / hub inbox)
   4. http://127.0.0.1:4202/login (branch owner, isolated context)
   5. http://127.0.0.1:4202/dashboard (branch)
   6. http://127.0.0.1:4202/staff/orders (branch badges + Request HQ prep)
   7. Landing smoke also visited `/`, `/dashboard`, `/my-shift`, `/staff/orders`, inventory sublinks (via `test:landing-version`)
8. **Relevant log excerpts:**
   ```
   ✅ Database schema version: 20260726172000
   ....  [100%]  4 passed, 1 warning in 3.56s
   INFO: ... "GET /hub-fulfillments HTTP/1.1" 200 OK
   INFO: ... "PATCH /hub-fulfillments/6 HTTP/1.1" 200 OK
   INFO: ... "POST /orders/2423/hub-fulfillment HTTP/1.1" 200 OK
   Application bundle generation complete. [0.020 seconds] - 2026-07-26T15:05:28.881Z
   >>> RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.
   ```
