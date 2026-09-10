---
## Closing summary (TOP)

- **What happened:** Enhancement reviewer asked to expand `AGENTS.md` Key URLs so agents stop rediscovering Jul guest/ops routes from scattered docs.
- **What was done:** Key URLs gained one-line bullets for `/book/{tenantId}`, `/waitlist/{tenantId}`, `/delivery/{tenantId}`, `/features`, `/courier` (login + seed env), and `/platform` (login); README Access Points left to sibling tasks.
- **What was tested:** `rg` confirmed waitlist/delivery/features under Key URLs; book/courier/platform bullets present; no `back/`/`front/` churn; optional `/features` curl returned 200 — overall **PASS**.
- **Why closed:** All pass/fail criteria met; docs-only delivery verified by tester.
- **Closed at (UTC):** 2026-07-26 04:38
---

# Expand AGENTS.md Key URLs with Jul guest / ops routes

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`AGENTS.md` § Key URLs** only lists frontend HAProxy, `/docs`, and `/health`. Agents verifying Jul surfaces keep rediscovering public **`/book`**, **`/waitlist`**, **`/delivery`**, **`/features`**, plus **`/courier`** and **`/platform`**, via scattered feature docs. A short Key URLs list would cut that friction without rewriting product guides.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T19:33Z: SIGNAL `docs_stale×14` basenames already owned; not a bulk `docs/*.md` rewrite
- `AGENTS.md` Key URLs (~L206–210): three bullets only — no guest/ops routes
- Sibling README Access Points / features index tasks own **`README.md`** / **`docs/README.md`** only:
  - **`NEW-0-20260722-1159-readme-delivery-courier-saas-features`**
  - **`NEW-0-20260723-1744-readme-restaurant-groups-and-waitlist`**
  - **`NEW-0-20260723-1903-document-public-features-page`**
- Path-align task **`NEW-0-20260723-1138-align-agents-md-task-paths-to-agents2`** is `agents` → `agents2` wording only — do **not** merge

## High-level instructions for coder

- Add a few bullets under **`AGENTS.md` Key URLs** (localhost:4202 examples) for at least: `/book/{tenantId}`, `/waitlist/{tenantId}`, `/delivery/{tenantId}`, `/features`, and optionally `/courier` + `/platform` (note login/seed env where the file already does for other flows)
- Keep the section short; one line each; no new long runbooks
- Do not edit root README Access Points here (siblings own those)
- Pass/fail: `rg '/delivery|/waitlist|/features' AGENTS.md` hits under Key URLs; no product code

## Coder notes (2026-07-26T04:37Z)

- Expanded **`AGENTS.md` § Key URLs** with one-line bullets for `/book/{tenantId}`, `/waitlist/{tenantId}`, `/delivery/{tenantId}`, `/features`, `/courier` (+ login + seed env pointer), `/platform` (+ login).
- Did not edit `README.md` Access Points (siblings own those).
- No product code changes.

## Testing instructions

### What to verify

- **`AGENTS.md` § Key URLs** lists guest/ops routes for booking, waitlist, delivery, features, courier, and platform.
- No `back/` / `front/` product code was changed for this task.

### How to test

From repo root:

```bash
# Must hit waitlist, delivery, features under Key URLs
rg -n '/delivery|/waitlist|/features' AGENTS.md

# Spot-check the section
sed -n '/^## Key URLs$/,/^## /p' AGENTS.md | head -20

# Confirm no product code churn from this task (docs-only)
git diff --stat -- back/ front/
```

Optional smoke (stack up on 4202): `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4202/features` → expect `200`.

### Pass/fail criteria

- **Pass:** `rg '/delivery|/waitlist|/features' AGENTS.md` returns hits in the Key URLs section; bullets for `/book/`, `/courier`, `/platform` present; `git diff --stat -- back/ front/` empty for this work.
- **Fail:** Key URLs still only lists frontend/docs/health, or product code was edited unnecessarily.

## Test report

1. **Date/time (UTC):** 2026-07-26T04:38:04Z start → 2026-07-26T04:38:07Z end. Log window: last ~5m on `pos-haproxy` / stack.
2. **Environment:** branch `development` (synced with `./scripts/git-sync-development.sh`); local compose via HAProxy `BASE_URL=http://127.0.0.1:4202`; docs-only verification plus optional HTTP smoke.
3. **What was tested:** Key URLs bullets for `/book/`, `/waitlist/`, `/delivery/`, `/features`, `/courier`, `/platform`; no `back/`/`front/` product churn; optional `/features` HTTP 200.
4. **Results:**
   - Key URLs lists waitlist/delivery/features — **PASS** (`rg` lines 214–216 under `## Key URLs`)
   - Bullets for `/book/`, `/courier`, `/platform` present — **PASS** (lines 213, 217, 218)
   - No product code churn — **PASS** (`git diff --stat -- back/ front/` empty)
   - Optional `/features` smoke — **PASS** (`curl` → `200`; HAProxy access log `GET /features` 200)
5. **Overall:** **PASS**
6. **Product owner feedback:** Agents can now find Jul guest and ops entry points from AGENTS.md without hunting feature docs. Section stays one line per route. Courier bullet correctly points at seed env already documented above.
7. **URLs tested:**
   1. http://127.0.0.1:4202/features
8. **Relevant log excerpts:**
```
192.168.65.1:36240 [26/Jul/2026:04:38:04.410] http_frontend frontend_backend/front1 0/0/1/7/8 200 2663 - - ---- 4/4/3/3/0 0/0 "GET /features HTTP/1.1"
```

