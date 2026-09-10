---
## Closing summary (TOP)

- **What happened:** Docs index task to list `0030` reservation email troubleshooting in `docs/README.md` Email & SMTP.
- **What was done:** Goal already satisfied on `development` via sibling 0658 refresh (Quick links + Email & SMTP); coder confirmed no further README or product edits needed.
- **What was tested:** `rg` hits for 0030 under Email & SMTP and Quick links; on-disk runbook exists — overall **PASS**.
- **Why closed:** All pass/fail criteria met; docs-only index work already landed.
- **Closed at (UTC):** 2026-07-26 16:29
---

# Index 0030 reservation email troubleshooting in docs/README

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0030-reservation-confirmation-email-troubleshooting.md`** is the live ops runbook for “booking has email but no confirmation,” but **`docs/README.md`** never lists it under Email & SMTP (or elsewhere). Operators following the docs index stop at **0005** / **0056** and miss the diagnose script + Settings SMTP checklist. Sibling **`NEW-0-20260723-0658-refresh-0030-…`** owns a light body refresh and only *confirms* an index entry *if it exists* — it does not add one.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:16Z: `SIGNAL docs_stale×14` + `changelog_sparse` already owned; `demo_tables_check=ok`; Unreleased=1 post-2.1.28; NEW backlog≈85
- `rg` on **`docs/README.md`**: no hits for `0030` / `reservation-confirmation-email`
- File on disk: **`docs/0030-reservation-confirmation-email-troubleshooting.md`** (age >90d; cross-linked from email NEWs)
- Do **not** merge with **0658** refresh (body/commands) or gmail **0018** align NEW

## High-level instructions for coder

- In **`docs/README.md` Email & SMTP**, add one row for **`0030-reservation-confirmation-email-troubleshooting.md`**: confirmation not arriving, `diagnose_reservation_email.py`, Settings → Email SMTP checks
- Index only; no product code; no bulk rewrite of 0030 (leave body to **0658** if still open)
- Pass/fail: `rg -n '0030|confirmation-email-troubleshooting' docs/README.md` hits Email & SMTP; link resolves

## Coder notes

- On start (2026-07-26): goal already satisfied on `development`. Sibling **`CLOSED-0-20260723-0658-refresh-0030-…`** (release 2.1.100 / commit `735ea616`) indexed **0030** under **Email & SMTP** and **Quick links** while refreshing the runbook body.
- Verified current `docs/README.md`:
  - L17 Quick links: “Troubleshoot missing reservation confirmation email” → `0030-…`
  - L43 Email & SMTP: row with diagnose script / tenant vs global SMTP blurb
- Target file `docs/0030-reservation-confirmation-email-troubleshooting.md` exists; no further README edit needed; no `back/` / `front/` changes.

## Testing instructions

### What to verify

- `docs/README.md` lists **0030** under **Email & SMTP** (and optionally Quick links).
- The markdown link resolves to the on-disk runbook.

### How to test

```bash
# From repo root
rg -n '0030|confirmation-email-troubleshooting' docs/README.md
test -f docs/0030-reservation-confirmation-email-troubleshooting.md && echo OK
```

### Pass/fail criteria

- **Pass:** `rg` hits Email & SMTP (and Quick links); `docs/0030-reservation-confirmation-email-troubleshooting.md` exists; no product code required for this task.
- **Fail:** 0030 missing from Email & SMTP table, or link target missing.

## Test report

1. **Date/time (UTC):** 2026-07-26T16:28:40Z – 2026-07-26T16:28:42Z (log window N/A — docs-only).
2. **Environment:** repo root on branch `development` @ `7add5c3d`; no Docker/BASE_URL (documentation index check only).
3. **What was tested:** `docs/README.md` indexes **0030** under Email & SMTP and Quick links; on-disk runbook exists.
4. **Results:**
   - Email & SMTP lists 0030 — **PASS** (`docs/README.md:49` ops row; also cross-ref at L47).
   - Quick links lists 0030 — **PASS** (`docs/README.md:17`).
   - Link target exists — **PASS** (`test -f` → `OK_FILE`).
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators scanning the docs index can now find the reservation confirmation email troubleshooting runbook from both Quick links and Email & SMTP. No product code was required; the index work already landed with the sibling 0658 refresh.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A — no containers involved. Verification output:
   ```
   17:| Troubleshoot missing reservation confirmation email | [0030-…](0030-…) |
   49:| [0030-reservation-confirmation-email-troubleshooting.md](…) | **Ops:** …
   OK_FILE
   ```
