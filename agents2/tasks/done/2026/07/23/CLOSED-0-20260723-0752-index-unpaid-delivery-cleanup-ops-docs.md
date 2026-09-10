---
## Closing summary (TOP)

- **What happened:** Ops indexes still pointed only at the tenant-1 demo reset cron after unpaid public Satisfecho Delivery TTL cleanup went live.
- **What was done:** Indexed unpaid cleanup in `docs/README.md` (0001 Deployment blurb) and `docs/0004-deployment.md` (step/summary cross-links to 0001 and the server wrapper); 0001 body left unchanged.
- **What was tested:** `rg` confirmed unpaid/cleanup pointers and anchors in README and 0004; 0001 section present and not rewritten — overall **PASS**.
- **Why closed:** All pass/fail criteria met (docs-only index discoverability).
- **Closed at (UTC):** 2026-07-26 04:55
---

# Index unpaid delivery cleanup in ops docs (README + 0004)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Unpaid public Satisfecho Delivery TTL cleanup is live (CLI, `scripts/cleanup-unpaid-public-delivery-on-server.sh`, amvara9 hourly cron, **`docs/0001`** § Unpaid public…). **`docs/README.md`** Deployment row for **0001** and **`docs/0004-deployment.md`** still mention only the tenant-1 **demo data reset** cron, so operators scanning indexes miss the all-tenant cleanup job.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: follow-on after **CLOSED-0-20260723-0734-install-unpaid-delivery-cleanup-cron-amvara9** (cron installed; Unreleased bullet exists)
- `docs/README.md` L27: “daily demo data reset cron for tenant 1” — no unpaid cleanup
- `docs/0004-deployment.md` § demo reset points only at 0001 daily demo reset; no unpaid cleanup link
- Feature body already correct in **0001** / **0053** — do **not** rewrite those sections; index/cross-link only
- Do not duplicate **WIP-304** or changelog_sparse owners

## High-level instructions for coder

- Update **`docs/README.md`** Deployment & operations blurb for **0001** to mention unpaid public delivery cleanup cron (all tenants) alongside demo reset
- In **`docs/0004-deployment.md`**, add a short bullet or sentence next to the demo-reset note linking to **`docs/0001-ci-cd-amvara9.md`** § Unpaid public Satisfecho Delivery cleanup (and/or the wrapper script)
- Optional: tweak **0053** Feature guides one-liner in `docs/README.md` to mention public `/delivery` + TTL cleanup if still “courier API (#297)” only
- Pass/fail: `rg -n 'unpaid|cleanup-unpaid' docs/README.md docs/0004-deployment.md` finds the new pointers; 0001 body unchanged unless a single anchor typo needs fixing

## Implementation notes (coder)

- Status: implemented 2026-07-26T04:54Z (UTC)
- `docs/README.md` Deployment & operations **0001** blurb now mentions hourly unpaid public Satisfecho Delivery cleanup (all tenants) alongside tenant-1 demo reset
- `docs/0004-deployment.md` step 7 + summary row 7 cross-link to `0001` § Unpaid public Satisfecho Delivery cleanup and `scripts/cleanup-unpaid-public-delivery-on-server.sh`
- **0053** Feature guides one-liner already mentioned public `/delivery` + unpaid TTL cleanup — left unchanged
- **0001** body unchanged (index/cross-link only)

## Testing instructions

### What to verify
Operators scanning Deployment indexes see unpaid public delivery cleanup (all tenants) next to the demo reset cron, with working links into **0001**.

### How to test
From repo root:

```bash
rg -n 'unpaid|cleanup-unpaid' docs/README.md docs/0004-deployment.md
rg -n '^## Unpaid public Satisfecho Delivery cleanup' docs/0001-ci-cd-amvara9.md
# Confirm anchor target matches 0004 links:
rg -n 'unpaid-public-satisfecho-delivery-cleanup-all-tenants' docs/0004-deployment.md
```

Optional: open `docs/README.md` and `docs/0004-deployment.md` in a markdown preview and click through to the **0001** unpaid-cleanup section.

No product code / Docker / Puppeteer required (docs-only).

### Pass/fail criteria
- **Pass:** `rg` finds unpaid/cleanup pointers in both `docs/README.md` and `docs/0004-deployment.md`; **0001** still has the Unpaid public… section; **0001** body was not rewritten.
- **Fail:** Either index still mentions only demo reset with no unpaid cleanup pointer, or links point at a missing heading.


## Test report

1. **Date/time (UTC):** 2026-07-26 04:55:07–04:56:00 UTC. Log window: N/A (docs-only; no container changes).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`); local compose up (`docker-compose.yml` + `docker-compose.dev.yml`) but unused for this task; no `BASE_URL`.
3. **What was tested:** Deployment index blurbs in `docs/README.md` and `docs/0004-deployment.md` mention unpaid public Satisfecho Delivery cleanup (all tenants) next to demo reset, with links to `docs/0001-ci-cd-amvara9.md` § Unpaid public…; 0001 section still present; 0001 not rewritten.
4. **Results:**
   - `rg` unpaid/cleanup pointers in `docs/README.md`: **PASS** — L28 Deployment 0001 row mentions hourly unpaid public cleanup (all tenants); L57 0053 one-liner already notes unpaid TTL cleanup.
   - `rg` unpaid/cleanup pointers in `docs/0004-deployment.md`: **PASS** — step 7 (L168) and summary row 7 (L196) cross-link cleanup + wrapper script.
   - Anchor target `#unpaid-public-satisfecho-delivery-cleanup-all-tenants` in 0004: **PASS** — present on L168 and L196.
   - `## Unpaid public Satisfecho Delivery cleanup` still in 0001: **PASS** — L147 `## Unpaid public Satisfecho Delivery cleanup (all tenants)`.
   - 0001 body not rewritten: **PASS** — working tree only modified `docs/README.md` and `docs/0004-deployment.md` (0001 untouched this change).
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators scanning the Deployment index and 0004 checklist now see the hourly all-tenant unpaid public delivery cleanup beside the tenant-1 demo reset cron, with clear pointers into 0001 and the server wrapper. No product risk; docs-only index fix completes the ops discoverability gap after the cron install task.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification via `rg`; no Docker/Puppeteer runs required.
