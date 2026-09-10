---
## Closing summary (TOP)

- **What happened:** Feature guides / Quick links in `docs/README.md` omitted waiting list even though `docs/0011` already covered it.
- **What was done:** Updated the 0011 Feature guides blurb and matching Quick links label to mention public `/waitlist/:tenantId` and staff Waiting list.
- **What was tested:** `rg` confirmed waitlist cues on Feature guides + Quick links; docs-only diff; overall PASS.
- **Why closed:** All pass/fail criteria met; no product code changes.
- **Closed at (UTC):** 2026-07-26 09:32
---

# Mention waiting list in docs/README Feature guides (0011 row)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0011-table-reservation-user-guide.md`** already documents public **`/waitlist/:tenantId`** and staff Waiting list tab, but the **Feature guides** one-liner in **`docs/README.md`** still describes only timed reservations (book + view/cancel). Contributors scanning the index miss that waiting list lives under 0011 (there is no separate `005x` waitlist guide).

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T17:14Z: `SIGNAL docs_stale×14` owned; docs-vs-code follow-on (one-row blurb), not a bulk stale-doc rewrite
- `docs/README.md` Feature guides ≈L48: “Table reservations: staff flows, public booking… view/cancel…” — no waitlist / `/waitlist`
- **`docs/0011`** §§ public waiting list + staff tab are current (~10d touch)
- Out of scope / do not merge:
  - Quick links Delivery/paywall (**`NEW-0-20260723-1628-docs-readme-quick-links-delivery-paywall`**) — that NEW forbids Feature guides edits
  - Waiting-list Puppeteer smoke (**`NEW-0-20260723-1648-waiting-list-puppeteer-smoke`**)
  - Root ROADMAP refresh (**`NEW-0-20260723-1628-refresh-root-roadmap-shipped-jul-features`**)

## High-level instructions for coder

- Edit **only** the **0011** description cell in **`docs/README.md`** Feature guides (and the matching Quick links reservations blurb **only if** it also omits waiting list — one short phrase)
- Example cue: mention public `/waitlist/:tenantId` and staff Waiting list tab alongside book/view-cancel
- Do not add a new doc file; do not rewrite 0011 body
- Pass/fail: `rg -n 'waitlist|waiting list' docs/README.md` hits the Feature guides 0011 row; no product code

## Coder notes (2026-07-26)

- Updated **`docs/README.md`** Feature guides **0011** row to mention public `/waitlist/:tenantId` and staff Waiting list tab.
- Updated matching Quick links row label to “reservations / waiting list” (same 0011 link).
- No product code changes; did not edit `docs/0011` body.

## Testing instructions

### What to verify

- **`docs/README.md`** Feature guides row for **0011** mentions waiting list / `/waitlist/:tenantId` (and staff Waiting list).
- Quick links reservations entry also cues waiting list (optional per task; done).
- No unrelated docs or product files changed for this task.

### How to test

```bash
# From repo root
rg -n 'waitlist|waiting list' docs/README.md
# Expect hits on Feature guides 0011 description (and Quick links label).

# Confirm Feature guides cell (not only Quick links):
rg -n '0011-table-reservation' docs/README.md
```

Optional sanity: open `docs/README.md` and skim Feature guides + Quick links for 0011.

### Pass/fail criteria

- **Pass:** `rg -n 'waitlist|waiting list' docs/README.md` hits the Feature guides **0011** row; Quick links still points at `0011-table-reservation-user-guide.md`; no product code in the change set for this task.
- **Fail:** Feature guides 0011 blurb still omits waitlist/waiting list, or waitlist was added only outside that row without the Feature guides hit.

## Test report

1. **Date/time (UTC):** 2026-07-26T09:31:51Z start → 2026-07-26T09:32:10Z end. Log window: N/A (docs-only; no app runtime under test).
2. **Environment:** branch `development` (synced); local working tree; compose up (`pos-front`/`pos-back`/`pos-haproxy` healthy) but unused for this task. No `BASE_URL`.
3. **What was tested:** Feature guides 0011 blurb mentions waiting list / `/waitlist/:tenantId` + staff Waiting list; Quick links 0011 cue; change set limited to `docs/README.md` (no product code).
4. **Results:**
   - Feature guides 0011 row mentions waitlist/waiting list: **PASS** — `docs/README.md:56` includes `public waiting list at `/waitlist/:tenantId` and staff Waiting list tab`.
   - Quick links reservations cue: **PASS** — `docs/README.md:18` label is `Understand reservations / waiting list (staff + public)` → still links `0011-table-reservation-user-guide.md`.
   - No product code in change set: **PASS** — `git diff docs/README.md` is exactly two lines (Quick links label + Feature guides 0011 description); no `back/` or `front/` edits for this task.
5. **Overall:** **PASS**
6. **Product owner feedback:** Contributors scanning `docs/README.md` now see waiting list next to reservations in both Quick links and Feature guides, pointing at the existing 0011 guide. No separate waitlist doc was needed; the index gap is closed with a short blurb.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification via `rg` + `git diff`. Evidence commands:
   ```
   rg -n 'waitlist|waiting list' docs/README.md
   # 18:…reservations / waiting list…
   # 56:…/waitlist/:tenantId… Waiting list tab.
   ```
