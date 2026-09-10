---
## Closing summary (TOP)

- **What happened:** Docs task clarified that the provider portal (`/provider`) is supplier catalog, not the courier delivery portal (`/courier`).
- **What was done:** Added a “Not the courier portal” callout at the top of `docs/0014-provider-portal.md` and the same contrast (with a 0053 link) on the Feature guides row in `docs/README.md`.
- **What was tested:** `rg` checks and scope review passed; optional HTTP smoke of `/provider/login` and `/courier/login` both returned 200 — overall PASS.
- **Why closed:** All pass criteria met; tester handed off as CLOSED with no product-code changes required.
- **Closed at (UTC):** 2026-07-26 04:04
---

# Clarify provider vs courier portal in docs/0014

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0014-provider-portal.md`** is still the supplier-catalog guide (`/provider`) but has not been touched in ~128 days while a separate **courier** portal (`/courier`) and Satisfecho Delivery staff flows shipped. Support and agents can confuse “provider” (wholesale catalog) with “courier” (delivery fulfillment). A short disambiguation at the top of 0014 prevents wrong login URLs and wrong role setup.

## Evidence (008 preflight / review)

- `stale_doc path=docs/0014-provider-portal.md age_days=128`
- `SIGNAL docs_stale count=15` — edit **0014 only** (plus optional one cross-link); no bulk docs rewrite
- Courier routes live under `front/src/app/courier/` (`/courier/login`, `/courier`); API in **`docs/0053-satisfecho-delivery-order-channel.md`**
- Root README still lists Provider portal without contrasting courier (separate task **NEW-0-20260722-1159-readme-delivery-courier-saas-features.md**)

## High-level instructions for coder

- At the top of **`docs/0014-provider-portal.md`**, add a short “Not the courier portal” note: provider = catalog suppliers at `/provider`; couriers = `/courier` for delivery orders; link **0053**
- Optionally add the same one-liner to the provider row in **`docs/README.md`** Feature guides table — only if a single-line edit keeps it clear
- Do not rewrite provider API tables or screenshots in this task
- Pass criteria: opening 0014 immediately distinguishes `/provider` from `/courier`; no changes to PRINTING / SECURITY-REVIEW / other stale plans here

## Coder notes (2026-07-26)

- Added “Not the courier portal” callout at top of `docs/0014-provider-portal.md` (`/provider` vs `/courier`, link to 0053).
- Updated Feature guides row for 0014 in `docs/README.md` with the same contrast + 0053 link.
- No product code changes.

## Testing instructions

### What to verify

- Opening `docs/0014-provider-portal.md` immediately distinguishes provider (supplier catalog at `/provider`) from courier (`/courier`).
- `docs/README.md` Feature guides row for 0014 mentions courier contrast and links 0053.
- No unrelated docs (PRINTING, SECURITY-REVIEW, etc.) were edited; no `back/` / `front/` product changes for this task.

### How to test

From repo root:

```bash
# Callout distinguishes portals and links 0053
rg -n 'Not the courier portal|/courier|0053-satisfecho' docs/0014-provider-portal.md

# Index row updated
rg -n '0014-provider-portal|/courier|0053' docs/README.md

# Scope check: only these two docs should differ for this task
git diff --name-only -- docs/0014-provider-portal.md docs/README.md
```

Optional smoke (stack up): open `http://127.0.0.1:4202/provider/login` and `http://127.0.0.1:4202/courier/login` — different portals (no doc change required for routes to work).

### Pass/fail criteria

- **Pass:** 0014 opens with provider ≠ courier; README 0014 row mentions `/courier` and 0053; `rg` hits as above; no product code in the diff for this task.
- **Fail:** Callout missing, wrong URLs, or unrelated stale docs rewritten.

## Test report

1. **Date/time (UTC):** 2026-07-26 04:03:32 – 04:03:35 UTC. Log window: `docker logs --since 5m` (pos-front, pos-back, pos-haproxy).
2. **Environment:** Local Docker (`docker-compose.yml` + `docker-compose.dev.yml`), `BASE_URL=http://127.0.0.1:4202`, branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Doc callout in `docs/0014-provider-portal.md` distinguishing `/provider` vs `/courier` + link to 0053; Feature guides row in `docs/README.md`; scope limited to those two docs; optional HTTP smoke of both login routes.
4. **Results:**
   - 0014 opens with “Not the courier portal” callout (`/provider` ≠ `/courier`, links 0053) — **PASS** (`rg` lines 5–8; head shows callout before Overview).
   - README Feature guides 0014 row mentions `/courier` and links 0053 — **PASS** (`docs/README.md:49`).
   - Scope: only `docs/0014-provider-portal.md` and `docs/README.md` differ under docs/; no `back/` / `front/` product changes; PRINTING.md / SECURITY-REVIEW.md untouched — **PASS** (`git status --short -- docs/ back/ front/`).
   - Optional smoke: `/provider/login` and `/courier/login` both HTTP 200 — **PASS** (HAProxy access log).
5. **Overall:** **PASS**
6. **Product owner feedback:** Opening 0014 now makes the supplier vs courier distinction obvious, with correct login paths and a pointer to 0053. The docs index row matches, so agents scanning Feature guides should not send people to the wrong portal. No product code was required for this clarification.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (200)
   2. `http://127.0.0.1:4202/provider/login` (200)
   3. `http://127.0.0.1:4202/courier/login` (200)
8. **Relevant log excerpts:**
```
pos-haproxy:
192.168.65.1:64152 [26/Jul/2026:04:03:34.921] … "GET /provider/login HTTP/1.1" … 200
192.168.65.1:46034 [26/Jul/2026:04:03:34.933] … "GET /courier/login HTTP/1.1" … 200
```
