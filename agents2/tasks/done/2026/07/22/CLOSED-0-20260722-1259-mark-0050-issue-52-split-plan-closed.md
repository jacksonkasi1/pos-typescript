---
## Closing summary (TOP)

- **What happened:** Docs still treated closed umbrella #52 split plan as an active filing backlog.
- **What was done:** Added a Historical / closed umbrella banner on `docs/0050-…` and updated the `docs/README.md` Plans blurb so agents do not re-file paste bodies; phases A–E and drafts kept.
- **What was tested:** Docs-only checks (banner, 0032/0053 pointers, phases/drafts retained, README wording, no `back/`/`front/` diff) — all **PASS**.
- **Why closed:** All pass/fail criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-26 11:24
---

# Mark 0050 (#52 split plan) as historical

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0050-github-issue-52-split-plan.md` still reads as an active filing plan for umbrella **#52** (“Various topics to enhance”), with copy-paste issue bodies and “after filing, update 0032”. Parent **#52 is CLOSED** (2026-03-23). Agents and operators may treat the doc as live backlog and re-file duplicates.

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` — `docs/0050-github-issue-52-split-plan.md` (~121d untouched)
- `gh issue view 52`: **state=CLOSED**, closedAt **2026-03-23**; comment “This is done”
- `docs/README.md` Plans row still describes 0050 as child-issue specs for filing
- Related: `NEW-0-20260722-1250-roadmap-0032-satisfecho-delivery-shipped.md` updates 0032 only; does not banner 0050

## High-level instructions for coder

- Edit **only** `docs/0050-github-issue-52-split-plan.md` and the matching **`docs/README.md`** Plans blurb.
- Add a short top banner: **historical / closed umbrella** — parent **#52** is closed; do not file the pasted bodies as new issues without product owner review; for current roadmap status prefer **`docs/0032-…`** and shipped feature docs (e.g. **0053**).
- Do not rewrite phases A–E or delete the issue-body drafts; no `gh issue create` in this task.
- Pass/fail: banner + README make closed status obvious; no product code changes.

## Coder notes (2026-07-26)

- Added top **Historical / closed umbrella** banner on `docs/0050-github-issue-52-split-plan.md`: #52 CLOSED; do not re-file paste bodies without owner review; prefer **0032** + shipped docs (**0053**, **0051**).
- Softened intro / filing paragraph to past tense + historical note; phases A–E and issue-body drafts left intact.
- Updated `docs/README.md` Plans row for 0050 to say **historical** / do not re-file; prefer 0032.
- No `back/` / `front/` product changes; no `gh issue create`.

## Testing instructions

### What to verify

- `docs/0050-github-issue-52-split-plan.md` opens with a **Historical / closed umbrella** banner stating #52 is closed and not to re-file paste bodies without review.
- Banner points readers to **0032** and at least one shipped feature doc (e.g. **0053**).
- Phases A–E table and issue-body drafts are still present (not deleted).
- `docs/README.md` Plans blurb for 0050 says historical / closed and does not read as an active filing plan.
- Diff is docs-only (no `back/` / `front/` product edits).

### How to test

```bash
# From repo root
head -n 15 docs/0050-github-issue-52-split-plan.md
# Expect: Historical / closed umbrella; CLOSED; do not re-file; links to 0032 / 0053 (or similar)

rg -n "Suggested phases|## Issue " docs/0050-github-issue-52-split-plan.md | head
# Expect: phases and issue drafts still present

rg -n "0050-github-issue-52-split-plan" docs/README.md
# Expect: historical / CLOSED / do not re-file wording

test -f docs/0032-github-issues-roadmap.md
test -f docs/0053-satisfecho-delivery-order-channel.md

git diff --stat -- docs/0050-github-issue-52-split-plan.md docs/README.md
# Expect: docs only (plus this task rename)
```

No app/Puppeteer run required (docs-only).

### Pass/fail criteria

- **Pass:** Banner + README make closed/#52 historical status obvious; phases/drafts retained; no product code in the diff.
- **Fail:** Missing banner, README still implies active filing, phases/drafts removed, or unrelated `back/`/`front/` edits.

## Test report

1. **Date/time (UTC):** 2026-07-26 11:24:15 – 11:24:18 UTC. Log window: N/A (docs-only; no container exercise).
2. **Environment:** branch `development` @ `63abe1fb`; local repo docs checks only (no compose / no `BASE_URL`).
3. **What was tested:** Historical banner on `docs/0050-…`; pointers to 0032 + shipped docs; phases A–E + issue-body drafts retained; `docs/README.md` Plans blurb; docs-only diff (no `back/` / `front/`).
4. **Results:**
   - Banner **Historical / closed umbrella** with #52 CLOSED + do-not-re-file: **PASS** — `head` lines 3–5 of `docs/0050-github-issue-52-split-plan.md`.
   - Points to **0032** and shipped docs (**0053**, **0051**): **PASS** — same banner links.
   - Phases A–E table present: **PASS** — rows A–E at lines 17–21; `## Suggested phases` retained.
   - Issue-body drafts retained: **PASS** — 10× `## Issue N` sections (`rg` count 10).
   - `docs/README.md` Plans blurb historical / do not re-file: **PASS** — line 90 wording includes **historical**, CLOSED, do not re-file, prefer **0032**.
   - Related shipped docs exist: **PASS** — `docs/0032-github-issues-roadmap.md`, `docs/0053-satisfecho-delivery-order-channel.md`.
   - Diff docs-only: **PASS** — `git diff --stat` shows only `docs/0050-…` (+8/−3) and `docs/README.md` (+2/−1); no `back/` / `front/` changes.
5. **Overall:** **PASS**
6. **Product owner feedback:** 0050 now clearly reads as archival for closed umbrella #52, so agents should not re-file paste bodies. README Plans row matches. Safe docs-only change; no app verification needed.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification; no `pos-front` / `pos-back` logs collected.
