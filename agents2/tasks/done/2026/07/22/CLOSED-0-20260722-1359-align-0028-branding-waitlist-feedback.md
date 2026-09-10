---
## Closing summary (TOP)

- **What happened:** Docs for tenant public branding (0028) listed book/menu/reservation only while waitlist and guest feedback already used the same branding tokens.
- **What was done:** Updated `docs/0028-tenant-public-branding.md` (Status: shipped, overview, coverage table) and the `docs/README.md` 0028 blurb to include `/waitlist/:tenantId` and `/feedback/:tenantId`; no product code changes.
- **What was tested:** Doc/README checks and optional UI smoke on waitlist/feedback heroes — overall **PASS**.
- **Why closed:** All pass criteria met; tester reported PASS.
- **Closed at (UTC):** 2026-07-26 11:15
---

# Align 0028 public branding coverage (waitlist + feedback)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0028-tenant-public-branding.md` documents background colour and header image for `/book`, `/menu`, and reservation-view only. Public **waitlist** and **guest feedback** pages already apply the same branding tokens, so the coverage table is incomplete and agents may skip branding when touching those routes.

## Evidence (008 preflight / review)

- Doc age >90d (`docs_stale` family; not in current SIGNAL top-14; no dedicated open task)
- `waitlist-public` / `feedback-public` templates bind `--color-bg` and `has-bg-image` / header background like book/menu
- Doc “Where it applies” table omits waitlist and feedback public URLs
- Preflight weekly sweep; prefer small doc align over bulk rewrite

## High-level instructions for coder

- Update the **Where it applies** table (and any one-line overview) to include public waitlist and guest-feedback pages that already use `public_background_color` / header background.
- Keep Settings / API / migration sections; only fix coverage drift.
- Optional one-line **Status: shipped** at top if missing.
- Pass criteria: a reader sees waitlist + feedback in the coverage table; no product code changes required unless a page is documented as branded but is not (then note gap only — do not expand branding in this task unless trivial).

## Implementation notes (coder)

- Verified `waitlist-public.component.html` and `feedback-public.component.html` already bind `--color-bg` / `--hero-header-bg`, `has-bg-image`, and `headerBackgroundStyle()` (routes `/waitlist/:tenantId`, `/feedback/:tenantId`).
- Updated `docs/0028-tenant-public-branding.md`: **Status: shipped** banner; overview lists waitlist + guest feedback; coverage table adds both rows.
- Updated `docs/README.md` feature-guides blurb for 0028 to mention waitlist and guest feedback.
- No `back/` / `front/` product code changes (coverage already correct in UI).

## Testing instructions

### What to verify

- `docs/0028-tenant-public-branding.md` “Where it applies” includes `/waitlist/:tenantId` and `/feedback/:tenantId` with background colour and header image checked.
- Doc opens with a shipped status; overview mentions waitlist and guest feedback.
- `docs/README.md` 0028 row mentions waitlist and guest feedback (not book/menu/reservation only).

### How to test

```bash
# From repo root
rg -n 'waitlist|feedback|Status: shipped' docs/0028-tenant-public-branding.md
rg -n '0028-tenant-public-branding' docs/README.md

# Optional UI smoke (branding already live; no code change):
# BASE_URL=http://127.0.0.1:4202 — open /waitlist/1 and /feedback/1 and confirm hero uses tenant colour/header if set
```

### Pass/fail criteria

- **Pass:** Coverage table lists waitlist + feedback; README blurb matches; no contradictory “book/menu/reservation only” framing in 0028.
- **Fail:** Either public route missing from the table, or README still omits waitlist/feedback.

## Test report

1. **Date/time (UTC):** 2026-07-26 11:14:24–11:14:50 UTC. Log window: `docker logs --since 15m` (pos-front, pos-haproxy) / `--since 5m` (pos-back).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** 0028 coverage table + shipped status + overview; README 0028 blurb; optional UI smoke that waitlist/feedback heroes still bind header branding.
4. **Results:**
   - Coverage table includes `/waitlist/:tenantId` and `/feedback/:tenantId` with background colour and header image ✓ — **PASS** (`docs/0028-tenant-public-branding.md` lines 17–18).
   - Doc opens with **Status: shipped**; overview lists waiting list + guest feedback — **PASS** (lines 3, 5).
   - `docs/README.md` 0028 row mentions waitlist and guest feedback — **PASS** (line 63).
   - No “book/menu/reservation only” framing left in 0028 — **PASS** (`rg` showed only inclusive overview/table wording).
   - Optional UI: `/waitlist/1` and `/feedback/1` both render `hero-header has-bg-image` with tenant header image URL — **PASS**.
5. **Overall:** **PASS**
6. **Product owner feedback:** Doc drift is fixed: agents reading 0028 now see waitlist and guest feedback as first-class branded surfaces, matching the live UI. README index no longer implies book/menu/reservation-only coverage. No product code was required; optional browser check confirmed branding tokens still apply on both routes.
7. **URLs tested:**
   1. http://127.0.0.1:4202/waitlist/1
   2. http://127.0.0.1:4202/feedback/1
8. **Relevant log excerpts:**
   - pos-front: `Application bundle generation complete` (no TS/Angular errors in window).
   - pos-back: `GET /public/tenants/1 HTTP/1.1" 200 OK` (waitlist/feedback tenant public load).
   - pos-haproxy: `GET /feedback-public.component.css.map` 304 during feedback navigation; HTTP 200 for `/waitlist/1` and `/feedback/1` via curl.
