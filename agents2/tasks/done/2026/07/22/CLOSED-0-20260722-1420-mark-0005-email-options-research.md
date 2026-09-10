---
## Closing summary (TOP)

- **What happened:** Docs task to mark `0005-email-sending-options` as historical research so agents stop treating provider shopping as open product work.
- **What was done:** Added a research/options banner on `docs/0005-email-sending-options.md` (pointing to 0056 ops and 0030 troubleshooting) and softened the `docs/README.md` Email & SMTP row to research-only; no product code changes.
- **What was tested:** Docs-only checks (`head` / `rg` / file existence / diff) — overall **PASS**; banner and README status clear; provider tables unchanged in substance.
- **Why closed:** All pass/fail criteria met; tester product-owner feedback approved close.
- **Closed at (UTC):** 2026-07-26 11:33
---

# Mark 0005 email-sending options as research

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0005-email-sending-options.md` is a long comparison of Proton Mail / SendGrid / Resend / Gmail with no status banner. It still appears in `docs/README.md` as a live options guide while day-to-day ops live in **`docs/0056-gmail-setup.md`** and **`docs/0030-…`**. Agents may treat provider shopping as open product work.

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` continuation — basename not in the top-14 list but **>90d** and unqueued (earlier 008 runs deferred `0005`)
- Cross-check already noted in open **`NEW-0-20260722-1239-align-gmail-setup-doc-smtp-fields.md`** (0018 owns SMTP field alignment; this task is status/index only)
- README row presents 0005 as current “comparison and config” without “research” wording

## High-level instructions for coder

- Add a short top banner on **`docs/0005-email-sending-options.md`**: **research / options comparison** — not an implementation backlog; for Gmail/SMTP ops use **`docs/0056-gmail-setup.md`** and for confirmation failures use **`docs/0030-…`**.
- Soften the **`docs/README.md`** index blurb to say research/comparison (one line).
- Do **not** rewrite provider tables or pick a new mail vendor in this task.
- Pass/fail: first screenful + README make clear 0005 is historical research; no product code changes.

## Coder notes (2026-07-26)

- Added research banner on `docs/0005-email-sending-options.md` pointing to 0056 (ops) and 0030 (troubleshooting).
- Updated `docs/README.md` Email & SMTP row to **Research only** with ops cross-links.
- No product code changes.

## Testing instructions

### What to verify

- `docs/0005-email-sending-options.md` opens with a clear **research / options comparison** banner (not backlog).
- Banner points to `0056-gmail-setup.md` and `0030-reservation-confirmation-email-troubleshooting.md`.
- `docs/README.md` index row for 0005 says research-only (not a live shipping guide).
- Provider comparison body below the banner is unchanged in substance.

### How to test

```bash
# From repo root
head -n 8 docs/0005-email-sending-options.md
rg -n '0005-email-sending-options' docs/README.md
```

Optional: open both files in an editor and confirm first screenful + README row.

### Pass/fail criteria

- **Pass:** Banner + README make research status obvious; ops paths named; no product/code/deploy changes; no bulk rewrite of provider tables.
- **Fail:** Doc still reads as open vendor-selection work, README still implies live config guide, or unrelated product edits were made.

## Test report

1. **Date/time (UTC):** 2026-07-26T11:33:10Z start → 2026-07-26T11:33:14Z end. Log window: N/A (docs-only; no container runs).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`); local repo root; no Docker / no `BASE_URL`.
3. **What was tested:** Research banner on `docs/0005-email-sending-options.md`; links to 0056 + 0030; README Email & SMTP row research-only wording; provider comparison body still present; no product code edits.
4. **Results:**
   - Banner research / options comparison (not backlog): **PASS** — `head -n 8` shows blockquote: “Research / options comparison — not an implementation backlog.”
   - Banner points to 0056 and 0030: **PASS** — links `0056-gmail-setup.md` and `0030-reservation-confirmation-email-troubleshooting.md`; both files exist on disk.
   - README row research-only: **PASS** — `docs/README.md:47` “**Research only** — provider comparison…; not a shipping checklist. Ops: 0056, 0030.”
   - Provider body unchanged in substance: **PASS** — Proton / SendGrid / Resend / Gmail sections and comparison tables still present (~359 lines); unstaged diff is +2 lines banner + README blurb only (`docs/` only; no `back/` / `front/`).
5. **Overall:** **PASS**
6. **Product owner feedback:** 0005 is clearly historical research now; operators are steered to 0056 and 0030. Index no longer reads like a live vendor-selection guide. Safe to close.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification (`head` / `rg` / `test -f` / `git diff --stat`).
