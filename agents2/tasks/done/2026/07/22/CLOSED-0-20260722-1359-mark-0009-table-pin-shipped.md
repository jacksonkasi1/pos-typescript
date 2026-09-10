---
## Closing summary (TOP)

- **What happened:** Docs for table PIN security still read as an open design proposal despite activate/PIN/regenerate/close already being live.
- **What was done:** Added a Status: shipped banner and optional-GPS note to `docs/0009-table-pin-security.md`, and aligned the `docs/README.md` Plans blurb; docs only.
- **What was tested:** Banner, optional-GPS framing, README shipped wording, and no `back/`/`front/` product edits — overall **PASS**.
- **Why closed:** All pass criteria met; no GitHub issue (issue 0).
- **Closed at (UTC):** 2026-07-26 12:21
---

# Mark 0009 table PIN security as shipped reference

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0009-table-pin-security.md` describes table activation, 4-digit PIN, shared table order, and optional GPS as if it may still be a design proposal. Core activate / PIN / regenerate / close paths are implemented; without a status banner, agents may re-propose the feature or treat optional GPS as a required gap.

## Evidence (008 preflight / review)

- Doc age >90d (deferred after SIGNAL top-14; no open `NEW-0` for 0009)
- Code: `activate_table`, `regenerate_table_pin`, close/deactivate, “table not accepting orders” guards in `back/app/main.py`; `activated_at` / PIN fields on tables; tenant `latitude` / `longitude` / `location_check_enabled` exist
- `docs/README.md` indexes 0009 under feature/reference without shipped label
- Preflight: weekly_due + `docs_stale` continuation (no bulk rewrite)

## High-level instructions for coder

- Add a top **Status** banner: **shipped** — staff activate / PIN / regenerate / close and public-menu PIN gates are live; treat the rest of the doc as operator/reference.
- Clarify **optional GPS / location_check** in one short note: fields exist; do not start a new GPS product epic from this task — only document whether order-path GPS flagging is on or still optional/unused if easy to verify.
- Soften README index if it reads like an unimplemented plan.
- Pass criteria: first screenful says shipped vs optional GPS; no bulk rewrite; no new PIN/GPS product work.

## Implementation notes (coder)

- Added **Status: shipped** banner to `docs/0009-table-pin-security.md` (staff activate/PIN/regenerate/close, public-menu gates, shared order).
- Documented **optional GPS**: Settings + tenant fields exist; order-path flagging in `POST /menu/.../order` when `location_check_enabled` (default off) — flags, does not block; not a missing epic.
- Updated `docs/README.md` Plans row for 0009 to say **shipped** + optional GPS off by default.
- Docs only — no `back/` / `front/` product changes.

## Testing instructions

### What to verify

- `docs/0009-table-pin-security.md` opens as **Status: shipped** with live staff/public PIN behaviour.
- Banner states optional GPS is off by default and flags (does not block) when enabled — not an open product gap.
- `docs/README.md` Plans blurb for 0009 says **shipped** and agrees with the doc.
- No product PIN/GPS logic changed.

### How to test

```bash
# From repo root
head -n 35 docs/0009-table-pin-security.md
grep -nE 'Status: shipped|optional GPS|location_check' docs/0009-table-pin-security.md | head -20

# README Plans row
grep -n '0009-table-pin' docs/README.md

# Docs-only: no product path edits for this task
git diff --name-only -- back/ front/ || true
```

### Pass/fail criteria

- **PASS** if first screenful of 0009 is **Status: shipped** with optional-GPS note; README 0009 blurb says **shipped**; no `back/` / `front/` product edits.
- **FAIL** if the doc still reads as an unimplemented proposal, GPS is framed as a required missing epic, or README omits shipped framing.

## Test report

1. **Date/time (UTC):** 2026-07-26 12:21:16 UTC start; completed ~12:21:40 UTC. Log window: N/A (docs-only verification).
2. **Environment:** Local git worktree on branch `development` (synced via `./scripts/git-sync-development.sh`). Docs checks from repo root; no compose/`BASE_URL` required.
3. **What was tested:** Status banner + optional GPS framing in `docs/0009-table-pin-security.md`; README Plans row for 0009; absence of `back/`/`front/` product edits for this task.
4. **Results:**
   - First screenful is **Status: shipped** with live staff activate/PIN/regenerate/close and public-menu gates — **PASS** (`head -n 35`; line 3 `## Status: shipped`).
   - Optional GPS note: default **off**; flags (does not block) when enabled; not a missing epic — **PASS** (Status section “Optional GPS / location check”).
   - `docs/README.md` Plans blurb for 0009 says **shipped** + optional GPS off by default — **PASS** (line 81).
   - No `back/` / `front/` product path edits — **PASS** (`git diff --name-only -- back/ front/` empty).
5. **Overall:** **PASS**
6. **Product owner feedback:** 0009 now reads as a shipped operator/reference doc instead of an open proposal, which should stop agents from re-scoping PIN or inventing a GPS epic. README and doc agree on shipped + optional GPS. Fine to archive after closing review.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only; no container activity required for pass/fail.

