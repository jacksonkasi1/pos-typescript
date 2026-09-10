---
## Closing summary (TOP)

- **What happened:** The open Feature guides blurb NEW for docs/0053 still described pre-#306 scope (staff Delivery / public checkout / unpaid TTL only), so it would lag zones/fees and guest `/track` once applied.
- **What was done:** Archived superseded 1734 as sole prior owner; updated `docs/README.md` Feature guides row for 0053 to one sentence covering fee/zone/radius, guest `/delivery/{tenantId}/track`, public checkout, staff Delivery, and unpaid TTL (#297 / #306).
- **What was tested:** `rg` Feature guides hit includes fee/track/`/delivery`; 1734 absent as NEW/WIP and present under `done/2026/07/23/` — overall PASS (docs + task hygiene only).
- **Why closed:** All pass/fail criteria met; tester reported PASS with product-owner feedback.
- **Closed at (UTC):** 2026-07-25 23:56
---

# Retarget 0053 docs/README blurb NEW for zones/fees/track

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`NEW-0-20260723-1734-refresh-docs-readme-0053-feature-guides-blurb.md`** still tells the coder to mention staff Delivery, public `/delivery/{tenantId}`, and unpaid TTL only. **2.1.32 / #306** shipped **zones/fees** and the customer **`/track`** page (and **`docs/0053`** body already documents them), so the open NEW’s instructions would leave the Feature guides row lagging the tip again the moment it lands.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T21:03Z: `docs/0053-satisfecho-delivery-order-channel.md` updated in commit `7f6d2578`; Feature guides blurb owner is still **1734** with pre-zones scope
- Open owner: **`NEW-0-20260723-1734-…`**; Quick links sibling **`NEW-0-20260723-1628-…`** — do not create a second Feature guides row owner
- Root README delivery overview owned by **`NEW-0-20260722-1159-…`** — optional one-liner for track URL there is out of scope here

## High-level instructions for coder

- Rewrite **`NEW-0-20260723-1734-…`** Evidence + instructions (or close 1734 and keep this file as sole owner — pick one) so the **`docs/README.md`** Feature guides row for **0053** also mentions:
  - Configurable delivery fee / postal codes / radius
  - Customer track page **`/delivery/{tenantId}/track`** (token-gated; no maps)
- Keep the row to one short sentence; no bulk `docs/` rewrite; do not re-document migration SQL here
- Pass criteria: 1734 (or this file alone) instructs the tip scope above; when implemented, `rg -n '0053|fee|track|/delivery' docs/README.md` under Feature guides reflects zones/fees/track

## Implementation notes (coder)

- Closed and archived superseded **`NEW-0-20260723-1734-…`** → `agents2/tasks/done/2026/07/23/CLOSED-0-20260723-1734-refresh-docs-readme-0053-feature-guides-blurb.md` (this task is sole Feature guides owner).
- Updated **`docs/README.md`** Feature guides row for **0053** to one sentence covering staff Delivery / courier API, public `/delivery/{tenantId}`, fee/postal/radius, guest `/delivery/{tenantId}/track`, and unpaid public TTL cleanup (#297 / #306).
- Quick links sibling **1628** and root README **1159** left untouched.

## Testing instructions

### What to verify

- **`docs/README.md`** Feature guides description for **`0053-satisfecho-delivery-order-channel.md`** mentions fee/zone/radius coverage and guest track **`/delivery/{tenantId}/track`** (plus public checkout / staff Delivery).
- Superseded **1734** NEW is not still open in the live queue.

### How to test

```bash
# From repo root
rg -n '0053|fee|track|/delivery' docs/README.md
test ! -f agents2/tasks/NEW-0-20260723-1734-refresh-docs-readme-0053-feature-guides-blurb.md
test ! -f agents2/tasks/WIP-0-20260723-1734-refresh-docs-readme-0053-feature-guides-blurb.md
test -f agents2/tasks/done/2026/07/23/CLOSED-0-20260723-1734-refresh-docs-readme-0053-feature-guides-blurb.md
```

No product code / Docker / Puppeteer required (docs + task hygiene only).

### Pass/fail criteria

- **Pass:** `rg` Feature guides hit includes `fee`, `track`, and `/delivery`; 1734 is only under `done/`; no other Feature guides rows changed for this task.
- **Fail:** Blurb still only “courier API (#297)” or omits zones/fees/track; 1734 still open as NEW/WIP in `agents2/tasks/`.

## Test report

1. **Date/time (UTC):** 2026-07-25 23:55:56 – 23:56:10 UTC. Log window: N/A (docs + task hygiene only; no Docker/Puppeteer).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`); no browser (`BASE_URL` N/A); compose unused.
3. **What was tested:** `docs/README.md` Feature guides blurb for **0053** covers fee/zone/radius and guest `/delivery/{tenantId}/track`; superseded **1734** NEW absent from live queue and present under `done/2026/07/23/`; no other Feature guides rows changed.
4. **Results:**
   - Feature guides `rg` hit includes `fee`, `track`, and `/delivery` — **PASS** (`docs/README.md:56` — fee/postal/radius coverage, guest track `/delivery/{tenantId}/track`, public checkout `/delivery/{tenantId}`, staff Delivery).
   - Superseded **1734** not open as NEW/WIP in `agents2/tasks/` — **PASS** (`test ! -f …NEW-…1734…`; `test ! -f …WIP-…1734…`).
   - **1734** archived under `done/` — **PASS** (`agents2/tasks/done/2026/07/23/CLOSED-0-20260723-1734-refresh-docs-readme-0053-feature-guides-blurb.md`).
   - Only the **0053** Feature guides row changed in `docs/README.md` — **PASS** (`git diff` single-line swap of that description; adjacent 0015/0052/0054/0055 rows untouched).
5. **Overall:** **PASS**
6. **Product owner feedback:** The Feature guides one-liner for 0053 now matches shipped #306 scope (zones/fees/track) without bloating the index, and the pre-zones 1734 NEW is correctly archived so this task is the sole owner. Docs-only verification is complete; safe to close.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
```
$ rg -n '0053|fee|track|/delivery' docs/README.md
56:| [0053-satisfecho-delivery-order-channel.md](0053-satisfecho-delivery-order-channel.md) | Satisfecho Delivery: staff Delivery tab / courier API, public checkout `/delivery/{tenantId}`, fee/postal/radius coverage, guest track `/delivery/{tenantId}/track`, unpaid public TTL cleanup (issue #297 / #306). |

$ test ! -f agents2/tasks/NEW-0-20260723-1734-refresh-docs-readme-0053-feature-guides-blurb.md
$ test ! -f agents2/tasks/WIP-0-20260723-1734-refresh-docs-readme-0053-feature-guides-blurb.md
$ test -f agents2/tasks/done/2026/07/23/CLOSED-0-20260723-1734-refresh-docs-readme-0053-feature-guides-blurb.md
(all exit 0)

$ git diff docs/README.md  # only 0053 Feature guides description line changed
```
