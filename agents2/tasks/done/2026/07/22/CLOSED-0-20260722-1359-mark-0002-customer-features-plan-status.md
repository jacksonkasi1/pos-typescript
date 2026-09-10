---
## Closing summary (TOP)

- **What happened:** Docs for end-user customer features (0002) still read like open product scope while staff Factura CRM already ships.
- **What was done:** Added a partial Status banner on `docs/0002-customer-features-plan.md`, softened README indexes, and moved end-user customer accounts out of ROADMAP Completed.
- **What was tested:** Docs-only checks (`head`/`rg`/`git diff`) — banner, indexes, and ROADMAP all PASS; no product code diffs.
- **Why closed:** All pass criteria met (shipped vs remaining clear; no bulk rewrite).
- **Closed at (UTC):** 2026-07-26 12:31
---

# Mark 0002 customer features: shipped vs not

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0002-customer-features-plan.md` still reads as an open end-user plan (customer accounts, email verification, MFA, order history, self-serve invoices). Operators and agents can confuse that with the **staff Billing Customers (Factura)** UI and fiscal invoices, which already ship. README indexes 0002 like live product scope.

## Evidence (008 preflight / review)

- Doc age >90d (deferred after SIGNAL top-14 were queued); not yet covered by an open `NEW-0`/`FEAT-0`
- Code: `BillingCustomer` + `/customers` staff Factura flow; fiscal invoice issue/get on orders — **not** a public `Customer` account model with MFA / email verification from 0002
- `docs/README.md` line for 0002 lists registration, login, MFA, order history, invoices without shipped/remaining split
- Preflight: `SIGNAL docs_stale` family; weekly sweep continuing beyond SIGNAL basenames

## High-level instructions for coder

- Add a short top **Status** banner: **partial** — staff billing customers + fiscal invoices shipped; **not shipped:** end-user customer accounts, email verification, MFA, customer order history / self-serve tax invoices as specified in 0002.
- Soften the README index line so it does not imply the full 0002 plan is next work.
- Do **not** implement new product features or rewrite the whole plan; leave detailed sections as historical design notes unless clearly wrong.
- Pass criteria: first screenful states shipped vs remaining; no bulk rewrite.

## Implementation notes (coder)

- Added **Status: partial** banner at top of `docs/0002-customer-features-plan.md` (shipped Factura CRM + fiscal invoices vs not-shipped end-user accounts/MFA/self-serve).
- Softened index blurbs in `docs/README.md` and root `README.md`.
- Moved misplaced **Customer accounts** bullet from Completed → Missing in `ROADMAP.md` so it is not treated as shipped.
- No product code changes.

## Testing instructions

### What to verify

- First screenful of `docs/0002-customer-features-plan.md` states **partial** status: staff billing customers / fiscal invoices shipped; end-user accounts, email verification, MFA, customer order history / self-serve tax invoices **not** shipped.
- `docs/README.md` and root `README.md` index lines for 0002 do not imply the full end-user plan is live product scope.
- `ROADMAP.md` does not list end-user customer accounts under Completed Features.

### How to test

```bash
# From repo root
head -n 8 docs/0002-customer-features-plan.md
rg -n '0002-customer-features' docs/README.md README.md
rg -n 'Customer accounts' ROADMAP.md
```

No Docker, Puppeteer, or app smoke required (docs-only).

### Pass/fail criteria

- **Pass:** Banner + index/ROADMAP wording make shipped vs remaining obvious; detailed plan body unchanged beyond the banner; no product code diffs.
- **Fail:** Banner missing/ambiguous, or README/ROADMAP still read as if end-user accounts/MFA are shipped or next obligatory work.

## Test report

- **Date/time (UTC):** 2026-07-26 12:30:38 UTC (log window N/A — docs-only)
- **Environment:** branch `development`; local workspace after `./scripts/git-sync-development.sh`; no Docker/Puppeteer required
- **What was tested:** Status banner on `docs/0002-customer-features-plan.md`; index wording in `docs/README.md` and root `README.md`; `ROADMAP.md` placement of end-user customer accounts; no product-code diffs

### Results

1. **First screenful states partial / shipped vs remaining** — **PASS** — `head -n 8` shows `Status: partial` with shipped Factura CRM + fiscal invoices vs not-shipped end-user accounts/MFA/self-serve.
2. **README index lines do not imply full end-user plan is live** — **PASS** — both indexes say **partial** and call out end-user accounts/MFA not shipped.
3. **ROADMAP does not list end-user customer accounts under Completed** — **PASS** — under `### ❌ Missing Features`, marked **not shipped**; Factura CRM remains under Completed.
4. **Docs-only change (no product code)** — **PASS** — `git diff --stat HEAD -- back/ front/` empty; only README/ROADMAP/0002 docs touched (+5/-3).

### Overall: **PASS**

### Product owner feedback

The 0002 plan no longer looks like obligatory next product work: the banner and indexes split staff Factura (shipped) from end-user accounts (not shipped). ROADMAP matches that split. Operators and agents should stop confusing Factura CRM with public customer accounts.

### URLs tested

N/A — no browser

### Relevant log excerpts (last section)

N/A — docs-only verification (`head` / `rg` / `git diff`); no container logs.
