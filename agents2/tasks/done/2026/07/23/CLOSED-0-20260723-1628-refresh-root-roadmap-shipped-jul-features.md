---
## Closing summary (TOP)

- **What happened:** Root ROADMAP.md still omitted major Jul shipped product areas (Delivery, waitlist, groups, paywall, platform operator, order comments).
- **What was done:** Added Completed Features bullets with doc links and Documentation reference entries for 0052/0053/0054/platform operator (live path 0059 after renumber); ROADMAP.md only.
- **What was tested:** `rg` hits for Jul bullets and doc paths; linked docs on disk; no back/front product edits — Overall PASS.
- **Why closed:** All testing criteria passed; product-owner feedback confirms ROADMAP matches the Jul shipped surface.
- **Closed at (UTC):** 2026-07-26 08:37
---

# Refresh root ROADMAP.md for shipped Jul features

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Root **`ROADMAP.md`** (last substantive touch ~2026-06-01) still omits major shipped product areas: **Satisfecho Delivery** + courier, **waiting list**, **restaurant groups**, **SaaS signup paywall**, **platform operator**, and **order/item comments**. Contributors reading ROADMAP “Completed Features” get a false picture vs **`CHANGELOG.md`** / **`docs/0052`–`0054`**. Sibling **`NEW-0-20260722-1159-readme-delivery-courier-saas-features`** covers root **README only**; **`NEW-0-20260722-1250-roadmap-0032-…`** covers **`docs/0032`** only — not this file.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL docs_stale×14` all owned; demo_tables_check=ok; NEW backlog≈58 — keep this **one-file**, bullet-add only (no bulk `docs/` rewrite)
- `rg` on **`ROADMAP.md`**: no hits for Delivery, waiting list, restaurant group, paywall, platform operator, courier, order comment, signup wizard
- Feature docs exist and are indexed in **`docs/README.md`**: `0053`, `0052`, `0054`, `0015-platform-operator-portal.md`, `0011` (waiting list)
- Do not duplicate **WIP-304** (TenantProduct checkout fix)

## High-level instructions for coder

- In **`ROADMAP.md`** § Completed Features, add short bullets (with doc links) for:
  - Satisfecho Delivery (staff + public `/delivery/{tenantId}` + courier) → `docs/0053-satisfecho-delivery-order-channel.md`
  - Waiting list (guest + staff) → `docs/0011-table-reservation-user-guide.md`
  - Restaurant groups → `docs/0054-restaurant-groups.md`
  - SaaS signup paywall (flag default off) → `docs/0052-saas-signup-paywall.md`
  - Platform operator portal → `docs/0015-platform-operator-portal.md`
  - Optional order / item comments → point at kitchen/order docs or closed #284 behaviour (no new long spec)
- Optionally add one line under Documentation reference for `0052` / `0053` / `0054` / platform portal
- Do **not** rewrite Missing Features / rate-limit roadmap sections; do not edit `docs/0032` here
- Pass/fail: `rg -i 'delivery|waiting list|restaurant group|paywall|platform operator' ROADMAP.md` hits the new bullets; no product code changes

## Implementation notes (coder)

- Edited **`ROADMAP.md` only** (no product code).
- § Completed Features: added bullets for Satisfecho Delivery (`0053`), waiting list (`0011`), restaurant groups (`0054`), SaaS signup paywall (`0052`), platform operator portal (`0015-platform-operator-portal.md`), order/item comments (`0015-kitchen-display.md` + `test:order-comments`).
- § Documentation reference: appended `0015-platform-operator-portal.md`, `0052`, `0053`, `0054`.
- Left Missing Features / rate-limit sections untouched; did not edit `docs/0032`.

## Testing instructions

### What to verify
- Root **`ROADMAP.md`** Completed Features lists the Jul shipped areas with correct doc links.
- Documentation reference includes `0052` / `0053` / `0054` and the platform operator doc.
- No product / `back/` / `front/` code changes in this task.

### How to test
```bash
# From repo root
rg -ni 'delivery|waiting list|restaurant group|paywall|platform operator' ROADMAP.md
rg -n '0052-saas-signup-paywall|0053-satisfecho-delivery|0054-restaurant-groups|0015-platform-operator' ROADMAP.md
# Linked files exist
test -f docs/0052-saas-signup-paywall.md \
  && test -f docs/0053-satisfecho-delivery-order-channel.md \
  && test -f docs/0054-restaurant-groups.md \
  && test -f docs/0015-platform-operator-portal.md \
  && test -f docs/0011-table-reservation-user-guide.md \
  && test -f docs/0015-kitchen-display.md
```

### Pass/fail criteria
- **Pass:** `rg` hits the new Completed Feature bullets (not only incidental “delivery” in older order-status wording); doc paths resolve on disk; `git diff --stat` shows only `ROADMAP.md` (+ this task file rename).
- **Fail:** Missing any of the six feature bullets, broken doc filenames, or unrelated product edits.

## Test report

- **Date/time (UTC):** 2026-07-26 08:37:13 – 08:37:24 UTC (log window N/A — docs-only)
- **Environment:** local repo on `development` (synced via `./scripts/git-sync-development.sh`); no Docker/browser; `BASE_URL` N/A
- **What was tested:** Root `ROADMAP.md` Completed Features Jul bullets + Documentation reference links; linked docs on disk; no product code changes for this task

### Results
- Completed Features six bullets (Delivery, waiting list, restaurant groups, paywall, platform operator, order/item comments) with doc links — **PASS** — `rg` lines 28–33
- Documentation reference includes `0052` / `0053` / `0054` and platform operator doc — **PASS** — line 42 lists those paths (`0059-platform-operator-portal.md` after renumber)
- Linked doc files resolve on disk — **PASS** — `0052`, `0053`, `0054`, `0059-platform-operator-portal.md`, `0011`, `0015-kitchen-display.md` all exist
- No `back/` / `front/` product edits from this task — **PASS** — `ROADMAP.md` already committed (`96879346`); working tree clean for product paths
- Note: How-to-test still named `0015-platform-operator-portal.md`; post-`2118d203` the live path is `0059-platform-operator-portal.md` and ROADMAP matches disk — not a failure under pass/fail criteria

### Overall: **PASS**

### Product owner feedback
ROADMAP Completed Features now reflects the Jul shipped surface (delivery, waitlist, groups, paywall, platform, order comments) with working doc links. The platform-operator path correctly follows the later 0015→0059 renumber; no further ROADMAP edit needed for this task.

### URLs tested
N/A — no browser

### Relevant log excerpts (last section)
N/A — docs-only verification (`rg` + `test -f`); no container logs.
