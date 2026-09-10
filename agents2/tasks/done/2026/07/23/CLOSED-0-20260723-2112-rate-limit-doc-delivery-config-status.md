---
## Closing summary (TOP)

- **What happened:** Ops doc `docs/0020-rate-limiting-production.md` omitted two unauthenticated delivery GETs that already share the public-menu IP rate-limit bucket.
- **What was done:** Documented `GET …/satisfecho-delivery-config` and `GET …/delivery-status` under Public menu & discovery (same `RATE_LIMIT_PUBLIC_MENU_PER_MINUTE`); no code or new env var changes.
- **What was tested:** `rg` alignment of doc paths, env checklist, and `@public_menu_ip_limit()` on both routes — overall **PASS**.
- **Why closed:** All pass/fail criteria met; doc and code aligned.
- **Closed at (UTC):** 2026-07-25 23:47
---

# Document delivery-config and delivery-status in rate-limit ops doc

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**2.1.32** added two unauthenticated delivery GETs that share the public-menu IP bucket, but **`docs/0020-rate-limiting-production.md`** still only lists **`POST …/satisfecho-delivery`** (and webhooks). Operators tuning `RATE_LIMIT_PUBLIC_MENU_PER_MINUTE` for track-page polling will not see those paths in the ops checklist.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T21:12Z: follow-on from shipped **CLOSED-306** / changelog **2.1.32**; SIGNAL stale basenames owned; demo OK
- Code already has `@public_menu_ip_limit()` on:
  - `GET /public/tenants/{tenant_id}/satisfecho-delivery-config`
  - `GET /public/orders/{order_id}/delivery-status`
- `docs/0020` public-menu bullet lists delivery **create** + webhook only (from CLOSED-1142); no config/status GETs
- Sibling **`NEW-0-20260723-2112-security-review-delivery-zones-track`** owns **SECURITY-REVIEW** — do **not** merge; this task is **0020** only
- Do not invent a new dedicated rate-limit bucket unless product asks; document the existing shared bucket

## High-level instructions for coder

- Extend the **Public menu & discovery** bullet in **`docs/0020-rate-limiting-production.md`** to include the two GETs above (same `RATE_LIMIT_PUBLIC_MENU_PER_MINUTE` bucket)
- Optionally note that the customer track page polls delivery-status (so aggressive clients share the 30/min IP budget with menu/discovery)
- No code changes required unless a path is missing the decorator (spot-check `main.py` first)
- Pass/fail: `rg -n 'satisfecho-delivery-config|delivery-status' docs/0020-rate-limiting-production.md` hits; env checklist unchanged unless a new var is introduced (prefer not)

## Coder notes

- Spot-checked `back/app/main.py`: both GETs already use `@public_menu_ip_limit()` — no code change.
- Extended **Public menu & discovery** in `docs/0020-rate-limiting-production.md` with config + delivery-status paths and a short note that track-page polling shares the public-menu IP budget.
- Env checklist left unchanged (`RATE_LIMIT_PUBLIC_MENU_PER_MINUTE=30` only).

## Testing instructions

### What to verify

- Ops doc lists both unauthenticated delivery GETs under the shared public-menu rate-limit bucket.
- No new rate-limit env var was introduced.
- Decorators remain on the two routes in code (doc/code alignment).

### How to test

From repo root:

```bash
rg -n 'satisfecho-delivery-config|delivery-status' docs/0020-rate-limiting-production.md
rg -n 'RATE_LIMIT_PUBLIC_MENU_PER_MINUTE' docs/0020-rate-limiting-production.md
rg -n '@public_menu_ip_limit' -A2 back/app/main.py | rg -n 'satisfecho-delivery-config|delivery-status|public_menu_ip_limit' 
# Or: confirm decorators on the route defs:
rg -n 'satisfecho-delivery-config|delivery-status' -B3 back/app/main.py
```

Optional (no product change expected): stack health only if desired — `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → 200.

### Pass/fail criteria

- **Pass:** `rg` finds both path strings in `docs/0020-rate-limiting-production.md` in the Public menu & discovery bullet; env section still only documents existing `RATE_LIMIT_PUBLIC_MENU_PER_MINUTE` (no new dedicated delivery bucket); both routes in `main.py` still have `@public_menu_ip_limit()`.
- **Fail:** paths missing from 0020, new env var invented without product ask, or a route lacks the decorator while the doc claims it shares the bucket.

## Test report

1. **Date/time (UTC):** 2026-07-25T23:46:50Z – 2026-07-25T23:46:55Z (log window N/A — docs/code alignment only)
2. **Environment:** branch `development` (synced); local repo root; no compose/browser required for pass criteria
3. **What was tested:** Ops doc lists both unauthenticated delivery GETs under public-menu bucket; no new rate-limit env var; `@public_menu_ip_limit()` still on both routes in `main.py`
4. **Results:**
   - Ops doc lists `GET …/satisfecho-delivery-config` and `GET …/delivery-status` under Public menu & discovery with `RATE_LIMIT_PUBLIC_MENU_PER_MINUTE`: **PASS** — `docs/0020-rate-limiting-production.md:11`
   - No new dedicated delivery rate-limit env var: **PASS** — env checklist still only `RATE_LIMIT_PUBLIC_MENU_PER_MINUTE=30` at line 34; `rg` found no `RATE_LIMIT_*DELIVERY*` invent
   - Decorators on both routes: **PASS** — `back/app/main.py` `@public_menu_ip_limit()` at lines 1191 and 1230
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators tuning the public-menu IP budget can now see that delivery-config and track-status polling share the same 30/min bucket. No product code change was needed; doc and decorators stay aligned.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — verification was `rg` against docs and `main.py` only

