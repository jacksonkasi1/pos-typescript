---
## Closing summary (TOP)

- **What happened:** Root ROADMAP was stale — end-user customer accounts (#340) still listed as fully Deferred after shipping.
- **What was done:** Refreshed ROADMAP (Shipped vs Deferred slices, weekly checklist), aligned docs/0032 and agent-loop pointers, CHANGELOG Unreleased note for #341.
- **What was tested:** Doc-only PASS — Deferred/Shipped grep, weekly checklist, CHANGELOG cross-check, no product-code in commit.
- **Why closed:** All pass criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-08-01 11:22
---

# Update ROADMAP.md

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/341
- **341**

## Problem / goal

Root **`ROADMAP.md`** is stale: it still lists **End-user customer accounts** under **Deferred**, but that shipped **2026-07-31** as **#340** (`docs/0002`, CLOSED-340). The doc implies a recurring refresh cadence that has not run. Fix the roadmap now and add a lightweight weekly-review habit so shipped vs deferred stays accurate.

## High-level instructions for coder

- Read current **`ROADMAP.md`** end-to-end; cross-check against recent changelog / closed issues (especially **#340** customer accounts, and any other shipped items still marked Deferred / In progress incorrectly).
- Move **End-user customer accounts** out of Deferred into the appropriate shipped / done section; note remaining deferred slices if any (e.g. MFA, self-serve invoices) without claiming unfinished work is done.
- Refresh other stale rows only when evidence is clear from docs/CHANGELOG/closed issues — do not invent status.
- Add a short **weekly review** note or checklist (in ROADMAP itself or a linked doc) so agents/humans know to re-scan ~once a week; keep it minimal (no new automation required unless already exists).
- **Out of scope:** implementing customer MFA/invoices; rewriting the whole product strategy; creating duplicate roadmap files.
- Pass criteria: ROADMAP no longer claims customer accounts are fully Deferred after #340; weekly refresh expectation is documented; obvious contradictions with July 31+ shipped work are cleared.
- Append **Testing instructions** when moving to UNTESTED (doc-only: diff review + grep Deferred/customer).

## Security note (001)

Issue body summarized for product intent only; no secrets copied.

## Implementation notes (010)

- **`ROADMAP.md`:** End-user customer accounts (#340) moved to **Shipped**; Deferred now lists only remaining slices (MFA / self-serve invoices / auto-link). Weekly review section expanded with a short checklist. Offline (#333), loyalty VIP/referrals (#334), migration bulk CSV (#336), `/about`, wallet-pass + fiscal-live tracking links refreshed from CHANGELOG evidence only.
- **`docs/0032-github-issues-roadmap.md`:** Offline #52 row notes deferred-card #333.
- **`docs/agent-loop.md`:** Points at ~weekly ROADMAP checklist.
- **`CHANGELOG.md`:** `[Unreleased]` Changed entry for #341.

## Testing instructions

Doc-only verification (no app/container required):

1. Confirm **Deferred** does **not** list full “End-user customer accounts” as deferred:
   `rg -n 'End-user customer accounts' ROADMAP.md` — expect a **Shipped** row; Deferred should mention **Customer MFA / self-serve invoices** only.
2. Confirm weekly habit exists: `rg -n 'Weekly checklist|weekly review' ROADMAP.md`.
3. Spot-check shipped notes vs CHANGELOG: Offline mentions #333; Promos & loyalty mentions #334; customer accounts mentions #340.
4. `rg -n 'deferred-card|#333' docs/0032-github-issues-roadmap.md` — offline theme updated.
5. Diff review: no product code under `back/` / `front/`; secrets none.

## Test report

1. **Date/time (UTC):** 2026-08-01 11:20:26 start → 11:21:26 end. Log window: N/A (doc-only).
2. **Environment:** branch `development` @ `0d4c385e` (commit “Refresh ROADMAP for shipped customer accounts (#341)”); no Docker/app required.
3. **What was tested:** Doc-only criteria from Testing instructions (ROADMAP Deferred/Shipped, weekly checklist, changelog cross-check, docs/0032 offline row, no product-code in #341 commit).
4. **Results:**
   - Deferred vs Shipped customer accounts: **PASS** — `End-user customer accounts` only under Shipped (ROADMAP.md:39, cites #340); Deferred has **Customer MFA / self-serve invoices** (ROADMAP.md:68), not the full account slice.
   - Weekly habit: **PASS** — `## How to keep this current (weekly review)` + `**Weekly checklist (keep it light):**` (ROADMAP.md:9–13).
   - Spot-check vs CHANGELOG: **PASS** — Offline cites #333; Promos & loyalty cites #334; customer accounts cites #340 (ROADMAP.md:36–39).
   - docs/0032 offline: **PASS** — `deferred-card #333` in Offline operation row (docs/0032-github-issues-roadmap.md:18).
   - Diff / no product code: **PASS** — `git show 0d4c385e --name-only` is CHANGELOG.md, ROADMAP.md, task file, docs/0032, docs/agent-loop.md only; no `back/` or `front/`; no secrets.
5. **Overall:** **PASS**
6. **Product owner feedback:** Roadmap now matches shipped #340 and keeps MFA/invoices honestly deferred. The weekly checklist is short enough that agents can actually run it. Unrelated working-tree product changes for #342/#343 were not treated as part of this task.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A — doc-only verification; evidence is `rg` + `git show 0d4c385e`.
