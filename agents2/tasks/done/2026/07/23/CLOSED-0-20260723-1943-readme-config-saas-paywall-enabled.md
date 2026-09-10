---
## Closing summary (TOP)

- **What happened:** README Configuration table omitted `SAAS_PAYWALL_ENABLED`, so operators could miss the SaaS hard-paywall flag.
- **What was done:** Added one Configuration row for `SAAS_PAYWALL_ENABLED` (default `false`, `/paywall` when true) linking `docs/0052-saas-signup-paywall.md`; no product-code or default changes.
- **What was tested:** Docs-only `rg` checks on README — Configuration hit at L175 with default/`/paywall`/0052 link; commit `d422372e` README-only — **PASS**.
- **Why closed:** All pass/fail criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-26 04:21
---

# Document SAAS_PAYWALL_ENABLED in README Configuration table

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

SaaS hard paywall is controlled by **`SAAS_PAYWALL_ENABLED`** in **`config.env`** / **`config.env.example`** (default `false`), but root **`README.md` Configuration** table never lists it. Operators following README alone miss the flag when enabling trial/subscribe locally or on amvara9 (runbook lives in **`docs/0052`**).

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T19:43Z: `SIGNAL docs_stale` / `changelog_sparse` owned; `demo_tables_check=ok`; NEW backlog deep — one-table-row doc fix
- `config.env.example` already defines `SAAS_PAYWALL_ENABLED=false`; README Configuration (~L140–150) lists Stripe currency / Twilio / phone country but not SAAS paywall
- Sibling **`NEW-0-20260722-1159-readme-delivery-courier-saas-features`** owns Features / Access Points / roles for Delivery, courier, paywall URL — **not** the Configuration env table — do **not** merge
- Closed runbook **`CLOSED-0-20260723-0752-saas-paywall-production-enablement-runbook`** owns ops checklist in 0052/0001 — this task is README Configuration only

## High-level instructions for coder

- Add one row to **`README.md` Configuration** for **`SAAS_PAYWALL_ENABLED`**: optional; default `false`; when `true`, new restaurant signups hit `/paywall`; link **`docs/0052-saas-signup-paywall.md`**
- Keep the table style consistent; do not paste Stripe secrets or change defaults
- Pass/fail: `rg 'SAAS_PAYWALL_ENABLED' README.md` hits under Configuration; no product code

## Implementation notes (coder)

- Added one Configuration table row for **`SAAS_PAYWALL_ENABLED`** after **`STRIPE_CURRENCY`**, linking **`docs/0052-saas-signup-paywall.md`**. No product code or default changes.

## Testing instructions

### What to verify

- Root **`README.md` Configuration** lists **`SAAS_PAYWALL_ENABLED`** with default `false`, `/paywall` behavior, and a link to **`docs/0052-saas-signup-paywall.md`**.
- No unrelated product/config changes.

### How to test

From repo root:

```bash
rg -n 'SAAS_PAYWALL_ENABLED' README.md
rg -n '0052-saas-signup-paywall' README.md
```

Confirm the hit is under the **Configuration** table (near `STRIPE_CURRENCY` / Twilio rows), not only Features/Documentation sections.

### Pass/fail criteria

- **Pass:** `rg 'SAAS_PAYWALL_ENABLED' README.md` hits under Configuration; description mentions default `false` and `/paywall`; link to 0052 present; no `back/` / `front/` edits required for this task.
- **Fail:** Flag missing from Configuration, secrets pasted, or unrelated files changed.

## Test report

1. **Date/time (UTC):** 2026-07-26 04:20:53–04:21:00 UTC. Log window: N/A (docs-only; no container exercise).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`); no Docker/`BASE_URL` (README verification only).
3. **What was tested:** README Configuration row for `SAAS_PAYWALL_ENABLED` (default `false`, `/paywall` behavior, link to `docs/0052-saas-signup-paywall.md`); no unrelated product/config churn.
4. **Results:**
   - Configuration lists `SAAS_PAYWALL_ENABLED` after `STRIPE_CURRENCY`: **PASS** — `rg -n 'SAAS_PAYWALL_ENABLED' README.md` → L175 under `## Configuration` (L162).
   - Default `false` and `/paywall` described: **PASS** — L175 text includes default `false` and “hit `/paywall`”.
   - Link to 0052: **PASS** — L175 links `docs/0052-saas-signup-paywall.md`; file exists on disk.
   - No secrets / no `back/`/`front/` edits for this task: **PASS** — commit `d422372e` touches `README.md` (+ task file only); no Stripe secret literals in the new row.
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators can now discover the SaaS paywall env flag from the README Configuration table without digging into `config.env.example` or 0052 first. The row matches existing table style and points at the runbook. Features/Access Points mentions of paywall remain separate and correctly out of scope.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A — docs-only verification (`rg` on `README.md`; commit `d422372e`).
