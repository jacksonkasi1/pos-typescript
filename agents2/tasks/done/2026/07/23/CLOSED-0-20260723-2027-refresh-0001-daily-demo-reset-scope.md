---
## Closing summary (TOP)

- **What happened:** Ops doc `docs/0001-ci-cd-amvara9.md` still claimed daily demo reset only re-seeds orders + reservations, while `reset_demo_data` also clears/reseeds waiting-list and Satisfecho Delivery samples.
- **What was done:** Updated the Daily demo data reset section in 0001 to match `reset_demo_data` and `AGENTS.md` (orders incl. Delivery samples, reservations, waiting-list; tables/products/users untouched); cron install block left unchanged.
- **What was tested:** Docs-only `rg` checks — stale phrase gone, scope keywords present, cron block intact, AGENTS.md aligned, seed module docstring consistent. Overall PASS.
- **Why closed:** All criteria passed; no product/seed code changes required.
- **Closed at (UTC):** 2026-07-25 23:39
---

# Refresh docs/0001 daily demo reset scope (Delivery + waitlist)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0001-ci-cd-amvara9.md` § *Daily demo data reset* still says reset re-seeds **orders + reservations only**. `reset_demo_data` now also clears/reseeds **waiting-list entries** and includes **Satisfecho Delivery** sample orders. Operators following 0001 alone will misread what cron refreshes on tenant 1.

## Evidence (008 preflight / review)

- Digest 2026-07-23T20:26Z: `demo_daily_reset=documented`; scope text in 0001 is stale vs `back/app/seeds/reset_demo_data.py` + CHANGELOG 2.1.30/2.1.31
- 0001 line: “reset and re-seed **orders + reservations only** (tables, products, and users are untouched)”
- No open NEW covers refreshing this 0001 paragraph (Delivery/waitlist seed tasks own code, not this ops blurb)

## High-level instructions for coder

- Update **`docs/0001-ci-cd-amvara9.md`** Daily demo data reset section to state that reset clears/reseeds **orders** (including Satisfecho Delivery samples), **reservations**, and **waiting-list entries** for tenant 1; tables/products/users remain untouched
- Keep cron install instructions unchanged; one short sentence is enough
- Cross-check wording against **`AGENTS.md`** Demo reset blurb so the two stay aligned
- Pass/fail: 0001 no longer claims “orders + reservations only”; mentions waitlist and Delivery samples; no code/seed changes required

## Status / notes (coder)

- **WIP → implemented (2026-07-25 UTC):** Updated Daily demo data reset intro in `docs/0001-ci-cd-amvara9.md` to match `reset_demo_data` + `AGENTS.md` (orders incl. Satisfecho Delivery samples, reservations, waiting-list; tables/products/users untouched). Cron block unchanged. No product/seed code changes.

## Testing instructions

### What to verify

- `docs/0001-ci-cd-amvara9.md` § *Daily demo data reset* describes the full reset scope (orders including Satisfecho Delivery samples, reservations, waiting-list entries) and no longer says “orders + reservations only”.
- Cron install instructions in that section are unchanged.
- Wording stays consistent with **`AGENTS.md`** Demo orders/reservations/waiting-list reset blurb.

### How to test

From repo root:

```bash
# Stale phrase must be gone
! rg -n 'orders \+ reservations only' docs/0001-ci-cd-amvara9.md

# Scope keywords present in the Daily demo section
rg -n 'waiting-list|Satisfecho Delivery samples|Daily demo data reset' docs/0001-ci-cd-amvara9.md

# Align with AGENTS.md demo reset blurb
rg -n 'waiting-list|Satisfecho Delivery|reset_demo_data' AGENTS.md
```

No Docker / Puppeteer required (docs-only). Optional sanity: skim `back/app/seeds/reset_demo_data.py` module docstring vs 0001 paragraph.

### Pass/fail criteria

- **Pass:** 0001 has no “orders + reservations only”; mentions waiting-list and Satisfecho Delivery samples; cron commands unchanged; `AGENTS.md` still documents the same reset scope.
- **Fail:** Stale “orders + reservations only” remains, or waitlist/Delivery omitted, or cron block was rewritten.

## Test report

1. **Date/time (UTC):** 2026-07-25T23:38:24Z – 2026-07-25T23:38:31Z. Log window: N/A (docs-only; no containers exercised).
2. **Environment:** branch `development` @ `401fe366`; local working tree (docs check). Compose/BASE_URL: N/A — no Docker / Puppeteer.
3. **What was tested:** Daily demo data reset scope wording in `docs/0001-ci-cd-amvara9.md` vs stale “orders + reservations only”; cron install block intact; alignment with `AGENTS.md` demo reset blurb; optional skim of `reset_demo_data.py` module docstring.
4. **Results:**
   - Stale phrase gone (`orders + reservations only`): **PASS** — `rg` exit 1 (no matches) on `docs/0001-ci-cd-amvara9.md`.
   - Scope keywords (waiting-list, Satisfecho Delivery samples, Daily demo data reset): **PASS** — section heading L119; scope sentence L121 includes orders (incl. Satisfecho Delivery samples), reservations, waiting-list entries; tables/products/users untouched.
   - Cron install instructions unchanged: **PASS** — host cron block still `0 4 * * * … reset-demo-data-on-server.sh` (L130–L143); wrapper path unchanged.
   - `AGENTS.md` same reset scope: **PASS** — Demo orders/reservations/waiting-list reset blurb documents clear/re-seed of orders, reservations, waiting-list + Satisfecho Delivery samples / `reset_demo_data`.
   - Optional `reset_demo_data.py` docstring vs 0001: **PASS** — module docstring clears/reseeds orders, reservations, waiting-list; Satisfecho Delivery samples; does not remove tables/products/users.
5. **Overall:** **PASS**
6. **Product owner feedback:** Ops docs now match what daily cron actually refreshes on tenant 1, so demos that rely on Delivery samples and waitlist will not surprise operators who only read 0001. No product code change was required; keep 0001 and AGENTS.md in sync if seed scope grows again.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification via `rg` on `docs/0001-ci-cd-amvara9.md` and `AGENTS.md`.
