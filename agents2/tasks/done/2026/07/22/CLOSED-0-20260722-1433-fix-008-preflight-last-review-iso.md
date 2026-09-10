---
## Closing summary (TOP)

- **What happened:** Enhancement-reviewer preflight treated the first line of the append-only stamp file as `last_review_iso`, so weekly cadence kept firing after same-week reviews.
- **What was done:** `last_review_iso()` in `scripts/enhancement-reviewer-preflight.sh` now prefers the latest ISO from `| FEAT:` / `| NEW:` agent lines (fallback: latest ISO anywhere).
- **What was tested:** Readonly preflight digest matched latest agent stamp (`2026-07-25T18:30:25Z`), `days_since_last_review=0`, `weekly_due=no` — overall PASS.
- **Why closed:** All pass criteria met; no GitHub issue (issue `0`).
- **Closed at (UTC):** 2026-07-26 00:05
---

# Fix 008 preflight last_review_iso (use latest stamp)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`scripts/enhancement-reviewer-preflight.sh` computes `last_review_iso` with `head -1` on `agents2/008-enhancement-reviewer/time-of-last-review.txt`. The file is **append-only**, so the first line stays **2026-07-12**. Every later 008 run still reports `days_since_last_review≈9` and `weekly_due=yes`, which keeps re-invoking the enhancement reviewer and encourages more NEW spam even after a full weekly sweep the same day.

## Evidence (008 preflight / review)

- Digest: `last_review_iso=2026-07-12T16:14:00Z`, `days_since_last_review=9`, `weekly_due=yes` while the stamp file already has many **2026-07-22** agent summaries
- Code: `last_review_iso()` → `head -1 "$STAMP_FILE" | grep -oE '^[0-9]{4}-…Z'`
- Preflight also appends `… UTC | 008 preflight | …` lines; agent appends `…Z | FEAT: n | NEW: m | …`

## High-level instructions for coder

- Change `last_review_iso()` to take the **latest** matching ISO timestamp from the stamp file (e.g. `grep -oE … | tail -1`), not the first line
- Prefer lines that look like an agent review summary (`| FEAT:` / `| NEW:`) if both preflight-only and agent lines exist; otherwise latest ISO on any line is acceptable
- Dry-run: `ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh` and confirm `last_review_iso` is today’s latest stamp and `weekly_due=no` when that stamp is under 7 days old
- Do not rewrite historical stamp entries; no product `back/` / `front/` changes
- Pass criteria: after a fresh agent stamp on the same UTC day, readonly preflight shows `weekly_due=no` (unless other SIGNALS still fire)

## Implementation notes (002 coder)

- Updated `last_review_iso()` in `scripts/enhancement-reviewer-preflight.sh`: prefer latest ISO from lines matching `| FEAT:` / `| NEW:`; fall back to latest ISO anywhere in the stamp file (no more `head -1`).
- Dry-run (2026-07-26): `last_review_iso=2026-07-25T18:30:25Z` (latest agent stamp), `days_since_last_review=0`, `weekly_due=no`. First-line ISO would have been `2026-07-25T18:02:21Z` (still wrong relative to latest agent).
- No `back/` / `front/` changes; stamp history not rewritten by this fix.

## Testing instructions

### What to verify

- Preflight cadence uses the **latest** agent review stamp, not the first line of `time-of-last-review.txt`.
- When that stamp is fewer than 7 UTC days old, `weekly_due=no`.

### How to test

From repo root:

```bash
# Optional: confirm latest agent ISO vs first line
head -1 agents2/008-enhancement-reviewer/time-of-last-review.txt
grep -E '\| FEAT:|\| NEW:' agents2/008-enhancement-reviewer/time-of-last-review.txt \
  | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z' | tail -1

ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh | sed -n '/Review cadence/,/^$/p'
```

### Pass/fail criteria

- **Pass:** Digest shows `last_review_iso=<latest agent ISO>` (matches `grep … | tail -1` above), `days_since_last_review` consistent with that stamp, and `weekly_due=no` when the stamp is &lt; 7 days old.
- **Fail:** `last_review_iso` equals the first-line ISO while a newer `| FEAT:` / `| NEW:` stamp exists, or `weekly_due=yes` solely because of a stale first line.

## Test report

1. **Date/time (UTC):** 2026-07-26T00:04:53Z start → 2026-07-26T00:05:01Z end. Log window: N/A (script-only; no Docker app containers required).
2. **Environment:** Host bash at repo root; `ENHANCEMENT_PREFLIGHT_READONLY=1`; branch `development` @ `dddb3a61`. No `BASE_URL` / compose (no browser or API).
3. **What was tested:** `last_review_iso()` uses latest `| FEAT:` / `| NEW:` stamp (not `head -1`); `weekly_due=no` when that stamp is &lt; 7 UTC days old.
4. **Results:**
   - Latest agent stamp vs first line: **PASS** — first-line ISO=`2026-07-25T18:09:23Z`; latest agent ISO=`2026-07-25T18:30:25Z` (`grep -E '| FEAT:|| NEW:' … | tail -1`).
   - Digest `last_review_iso` matches latest agent: **PASS** — `last_review_iso=2026-07-25T18:30:25Z` (not first-line `18:09:23Z`).
   - `days_since_last_review` consistent: **PASS** — `days_since_last_review=0` for 2026-07-25 stamp on 2026-07-26 UTC.
   - `weekly_due` when stamp &lt; 7 days: **PASS** — `weekly_due=no`.
5. **Overall:** **PASS**
6. **Product owner feedback:** Preflight no longer treats the oldest stamp line as the last review, so weekly cadence stops re-firing after a same-week agent run. That should cut the false `weekly_due=yes` loop that was generating NEW-task noise from 008.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**

```text
$ head -1 agents2/008-enhancement-reviewer/time-of-last-review.txt
2026-07-25T18:09:23Z | 008 agent | FEAT: 0 | NEW: 0 | …

$ grep -E '| FEAT:|| NEW:' … | grep -oE '…Z' | tail -1
2026-07-25T18:30:25Z

$ ENHANCEMENT_PREFLIGHT_READONLY=1 bash scripts/enhancement-reviewer-preflight.sh | sed -n '/Review cadence/,/^$/p'
=== Review cadence ===
last_review_iso=2026-07-25T18:30:25Z
days_since_last_review=0
weekly_due=no
```

