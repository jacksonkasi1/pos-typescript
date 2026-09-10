---
## Closing summary (TOP)

- **What happened:** Env-first operators had no pointer in `config.env.example` for unpaid public Satisfecho Delivery TTL cleanup despite the CLI, cron wrapper, and docs already being live.
- **What was done:** Added a comment-only block after the SaaS paywall / Stripe section pointing to the seed CLI (`--dry-run` / `--ttl-hours`), `scripts/cleanup-unpaid-public-delivery-on-server.sh`, and `docs/0053` / `docs/0001`.
- **What was tested:** `rg` confirmed cleanup pointer strings and docs refs; `SAAS_PAYWALL_ENABLED=false` unchanged; diff limited to `config.env.example` comments — **PASS**.
- **Why closed:** All pass/fail criteria met; no GitHub issue (enhancement reviewer, issue 0).
- **Closed at (UTC):** 2026-07-26 01:21
---

# Point config.env.example at unpaid delivery TTL cleanup

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Unpaid public Satisfecho Delivery TTL cleanup is live (seed module, server wrapper, amvara9 hourly cron, **`docs/0053`** / **`docs/0001`**). Operators scanning **`config.env.example`** for delivery/SaaS knobs find paywall and Stripe vars but **no** pointer to the cleanup command or cron script, so env-first setup misses the ops job.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:42Z: follow-on after delivery/TTL work; `demo_tables_check=ok`
- `rg` on **`config.env.example`**: no `unpaid`, `cleanup_unpaid`, or `cleanup-unpaid-public-delivery`
- Cleanup is CLI/`--ttl-hours` (default 2h in `back/app/cleanup_unpaid_public_delivery.py`), not a compose env flag — comment-only pointer is enough
- Sibling **`NEW-0-20260723-0752-index-unpaid-delivery-cleanup-ops-docs`** owns **`docs/README.md`** + **`docs/0004`** indexes only — do **not** merge; this task is **`config.env.example` only**

## High-level instructions for coder

- Near Delivery / SaaS / Stripe comments in **`config.env.example`**, add a short commented block that points to:
  - `python -m app.seeds.cleanup_unpaid_public_delivery` (and `--dry-run` / `--ttl-hours`)
  - `scripts/cleanup-unpaid-public-delivery-on-server.sh`
  - `docs/0053-satisfecho-delivery-order-channel.md` (and/or `docs/0001` unpaid cleanup section)
- Do not invent a new required env var unless one already exists unused; keep paywall defaults unchanged
- Pass/fail: `rg -n 'cleanup_unpaid|cleanup-unpaid' config.env.example` hits the new comments; no secrets; no product code

## Implementation notes (coder)

- Added comment-only block in **`config.env.example`** immediately after the SaaS paywall / Stripe webhook comments (before Revolut).
- Points to seed CLI (`--dry-run` / `--ttl-hours`), amvara9 wrapper script, and **`docs/0053`** / **`docs/0001`**.
- No new env var; **`SAAS_PAYWALL_ENABLED=false`** and other paywall defaults unchanged. No `back/` / `front/` product code.

## Testing instructions

### What to verify

- **`config.env.example`** documents unpaid public Satisfecho Delivery TTL cleanup for env-first operators.
- Comments only (no new required env knobs); SaaS paywall defaults unchanged.
- No secrets and no product-code changes in this task.

### How to test

From repo root:

```bash
rg -n 'cleanup_unpaid|cleanup-unpaid' config.env.example
rg -n 'SAAS_PAYWALL_ENABLED' config.env.example
git diff --stat -- config.env.example
```

Optional read-through: confirm the new block sits after the SaaS paywall section and references:

- `python -m app.seeds.cleanup_unpaid_public_delivery` (with `--dry-run` / `--ttl-hours`)
- `scripts/cleanup-unpaid-public-delivery-on-server.sh`
- `docs/0053-satisfecho-delivery-order-channel.md` and/or `docs/0001-ci-cd-amvara9.md`

No Docker / Puppeteer run required (docs/config comment only).

### Pass/fail criteria

- **Pass:** `rg -n 'cleanup_unpaid|cleanup-unpaid' config.env.example` hits the new comments; `SAAS_PAYWALL_ENABLED=false` still present; diff is limited to **`config.env.example`** comments (plus this task file).
- **Fail:** missing pointer strings, a new required env var invented, paywall defaults changed, or unrelated `back/` / `front/` edits.

## Test report

1. **Date/time (UTC):** 2026-07-26T01:21:07Z start → 2026-07-26T01:21:11Z end. Log window: N/A (docs/config comment only; no Docker/Puppeteer).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`); local working tree; no compose / `BASE_URL` required.
3. **What was tested:** `config.env.example` pointer for unpaid public Satisfecho Delivery TTL cleanup; comments-only / paywall defaults / no secrets / no product-code scope.
4. **Results:**
   - `rg -n 'cleanup_unpaid|cleanup-unpaid' config.env.example` hits new comments — **PASS** (lines 67–70: seed CLI, `--dry-run`, `--ttl-hours`, `scripts/cleanup-unpaid-public-delivery-on-server.sh`).
   - Optional docs pointers present — **PASS** (lines 71–72: `docs/0053-…`, `docs/0001-…`).
   - Block placement after SaaS paywall / before Revolut — **PASS** (`git diff` inserts at ~L62 after webhook comments).
   - `SAAS_PAYWALL_ENABLED=false` unchanged — **PASS** (line 55).
   - Diff limited to comment-only `config.env.example` (+9 lines); no new required env var; no `back/` / `front/` edits from this task — **PASS** (`git diff --stat -- config.env.example` → `9 +++++++++`; `git status --short -- back/ front/` empty for this change).
5. **Overall:** **PASS**
6. **Product owner feedback:** Env-first operators scanning Delivery/SaaS/Stripe knobs now see a clear ops path for unpaid public delivery TTL cleanup without inventing a compose flag. Pointers match the live CLI, server wrapper, and docs sections. Safe comment-only change; ready to close.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A — no containers exercised. Command evidence:
   ```
   $ rg -n 'cleanup_unpaid|cleanup-unpaid' config.env.example
   67:# Local / Docker:  docker compose exec back python -m app.seeds.cleanup_unpaid_public_delivery
   68:#                  … --dry-run
   69:#                  … --ttl-hours 4
   70:# amvara9 cron:    ./scripts/cleanup-unpaid-public-delivery-on-server.sh
   $ rg -n 'SAAS_PAYWALL_ENABLED' config.env.example
   55:SAAS_PAYWALL_ENABLED=false
   $ git diff --stat -- config.env.example
    config.env.example | 9 +++++++++
   ```
