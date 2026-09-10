---
## Closing summary (TOP)

- **What happened:** Public guest feedback (`/feedback/:tenantId`) was shipped but missing from README Access Points and the 0011 reservation user guide.
- **What was done:** Added a Public guest feedback Access Point row in README and short public/staff feedback pointers (summary + URL table) in `docs/0011-table-reservation-user-guide.md`; docs-only, no product code.
- **What was tested:** `rg` confirmed `/feedback` in README and 0011, `guest-feedback` in 0011, and `git diff --stat` limited to those docs — overall **PASS**.
- **Why closed:** All pass/fail criteria met; tester reported PASS.
- **Closed at (UTC):** 2026-07-26 04:29
---

# Add public /feedback Access Point and short 0011 pointer

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Public guest feedback at **`/feedback/:tenantId`** is shipped (rate-limited, i18n smoke, Google-review thank-you path), but root **`README.md` Access Points** and **`docs/0011-table-reservation-user-guide.md`** never mention it. Operators sharing book/waitlist links miss the feedback URL; staff nav already lists Guest feedback without a public counterpart in Access Points.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T19:43Z: SIGNAL stale-doc basenames already owned; not a bulk `docs/*.md` rewrite
- README Access Points (~L117–130): `/book/{tenantId}` present; no `/feedback/{tenantId}`
- `rg` on **`docs/0011-table-reservation-user-guide.md`**: no `feedback` hits
- `docs/testing.md` already indexes `test:feedback-public-i18n`; siblings own waitlist Access Point (**`NEW-0-20260723-1744-readme-restaurant-groups-and-waitlist`**) and AGENTS Key URLs without feedback (**`NEW-0-20260723-1933-agents-md-key-urls-jul-guest-routes`**) — do **not** merge; this task is README Access Points + one short 0011 pointer only
- Out of scope: staff smoke (**`NEW-0-20260723-1943-staff-guest-feedback-puppeteer-smoke`**)

## High-level instructions for coder

- In **`README.md` Access Points**, add one row for public guest feedback, e.g. `http://localhost:4202/feedback/{tenantId}`
- In **`docs/0011-table-reservation-user-guide.md`**, add a short bullet or URL-table row pointing at public `/feedback/:tenantId` and staff `/guest-feedback` (no new epic doc)
- Do not rewrite branding docs (**`NEW-0-20260722-1359-align-0028-…`** owns waitlist/feedback branding table)
- Pass/fail: `rg '/feedback' README.md docs/0011-table-reservation-user-guide.md` hits; no product code

## Implementation notes (coder)

- **`README.md` Access Points:** added **Public guest feedback** → `http://localhost:4202/feedback/{tenantId}` (after Public booking).
- **`docs/0011-table-reservation-user-guide.md`:** staff bullet for `/guest-feedback`; end-user bullet for `/feedback/:tenantId`; URL reference rows for public and staff feedback.
- No product code changes. Sibling README waitlist / AGENTS Key URLs tasks left untouched.

## Testing instructions

### What to verify

- Root README Access Points lists the public guest feedback URL.
- Reservation user guide mentions public `/feedback/:tenantId` and staff `/guest-feedback` (summary + URL table).
- No unrelated product/code changes.

### How to test

From repo root:

```bash
rg '/feedback' README.md docs/0011-table-reservation-user-guide.md
rg -n 'guest-feedback' docs/0011-table-reservation-user-guide.md
git diff --stat README.md docs/0011-table-reservation-user-guide.md
```

Optional (runtime smoke already indexed; not required for this docs-only task):

```bash
BASE_URL=http://127.0.0.1:4202 npm run test:feedback-public-i18n --prefix front
```

### Pass/fail criteria

- **Pass:** `rg '/feedback'` hits both `README.md` and `docs/0011-table-reservation-user-guide.md`; `guest-feedback` appears in 0011; diff is limited to those docs files (plus this task rename).
- **Fail:** either file still missing `/feedback`, or product code under `back/` / `front/` was changed for this task.

## Test report

1. **Date/time (UTC):** 2026-07-26T04:29:31Z start → 2026-07-26T04:29:34Z end. Log window N/A (docs-only).
2. **Environment:** branch `development` @ `7b771853`; local workspace; compose not required; `BASE_URL` N/A.
3. **What was tested:** README Access Points public guest feedback URL; 0011 summary + URL table for `/feedback/:tenantId` and `/guest-feedback`; scope limited to those docs (no product code).
4. **Results:**
   - README Access Points lists `http://localhost:4202/feedback/{tenantId}` — **PASS** (`rg '/feedback' README.md` → Public guest feedback row).
   - 0011 mentions public `/feedback/:tenantId` and staff `/guest-feedback` (summary + URL table) — **PASS** (`rg` hits on leave-feedback bullet and URL rows; `guest-feedback` at lines 13, 23, 110).
   - No unrelated product/code changes — **PASS** (`git diff --stat` = README.md + docs/0011 only, +5 lines; `git status --short back/ front/` empty for this task).
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators can now copy the public feedback link from Access Points the same way as booking. The reservation guide ties guest submit and staff review URLs together without a new epic doc. Docs-only change; no runtime risk.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification via `rg` and `git diff --stat`.
