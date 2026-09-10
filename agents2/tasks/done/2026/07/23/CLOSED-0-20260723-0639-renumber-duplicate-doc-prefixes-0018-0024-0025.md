---
## Closing summary (TOP)

- **What happened:** Doc numeric prefixes 0018/0024/0025 were still shared by two files each, making Feature-guide indexes and agent shortcuts ambiguous.
- **What was done:** Renamed gmail-setup → 0056, deploy-css-fix → 0057, and test-scenario-one-empty-table → 0058; kept verifactu/whatsapp/overbooking on 0018/0024/0025; updated README, docs links, CHANGELOG, config.env.example, and open NEW paths.
- **What was tested:** Docs-only checks — unique 0018/0024/0025 files, 0056–0058 present, no stale basenames under docs/ or open NEW-*.md; overall PASS.
- **Why closed:** All pass/fail criteria met; product owner noted safe to archive.
- **Closed at (UTC):** 2026-07-26 08:09
---

# Renumber remaining duplicate docs prefixes (0018 / 0024 / 0025)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Several `docs/` pairs still share the same numeric prefix, so Feature-guide indexes and agent “open 00NN” shortcuts are ambiguous. **`NEW-0-20260722-1310-renumber-0015-platform-operator-doc`** already owns the **0015** kitchen vs platform split; the same sweep noted **0018**, **0024**, and **0025** still need renames, and those renumber tasks were never queued.

## Evidence (008 preflight / review)

- Weekly docs drift (SIGNAL `docs_stale`); pairs still on disk:
  - `0018-gmail-setup.md` vs `0018-verifactu-fiscal-invoicing.md`
  - `0024-whatsapp-reminder-notes.md` vs `0024-deploy-css-fix-amvara9.md`
  - `0025-reservation-overbooking-detection.md` vs `0025-test-scenario-one-empty-table.md`
- Status/content NEWs already cover some of these files (gmail SMTP, WhatsApp shipped, overbooking shipped, 0025 seat math, 0024 deploy CSS shipped) — **this task is rename + link fix only**, not another status banner rewrite
- Do **not** touch `0015-*` (owned by the platform renumber NEW) or `0021-*` unless a quick `rg` shows a trivial one-liner left; prefer the three pairs above

## High-level instructions for coder

- Assign the next free `005x` / `006x` ids (after **0054** restaurant groups and any **0055** platform rename already applied). Suggested keep-original / rename-newcomer:
  - Keep **verifactu** as 0018; renumber **gmail-setup** → next free
  - Keep **whatsapp** as 0024; renumber **deploy-css-fix** → next free (or reverse if README historically preferred deploy as 0024 — pick one rule and document in the commit message)
  - Keep **overbooking-detection** as 0025; renumber **test-scenario-one-empty-table** → next free
- Update **`docs/README.md`** Feature guides rows and any in-repo links (`rg` under `docs/`, `AGENTS.md`, open `agents2/tasks/NEW-0-*` that cite the old paths)
- Coordinate with open status NEWs that still name the old basenames (update their paths in-place when renaming so coders are not sent to missing files)
- No product code changes
- Pass/fail: each of 0018 / 0024 / 0025 has exactly one `docs/00NN-*.md`; README links resolve; `rg` for old filenames under `docs/` is clean

## Implementation notes (coder)

- **0055** was already taken by `0055-public-seo.md` (platform **0015→0055** not applied). Assigned:
  - `0018-gmail-setup.md` → **`0056-gmail-setup.md`**
  - `0024-deploy-css-fix-amvara9.md` → **`0057-deploy-css-fix-amvara9.md`**
  - `0025-test-scenario-one-empty-table.md` → **`0058-test-scenario-one-empty-table.md`**
- Kept: `0018-verifactu-fiscal-invoicing.md`, `0024-whatsapp-reminder-notes.md`, `0025-reservation-overbooking-detection.md`
- Updated links in `docs/README.md`, `docs/0030-…`, `docs/0019-…`, `docs/0029-…`, `docs/testing.md`, `config.env.example`, `CHANGELOG.md` Unreleased + path notes
- Updated open NEWs that cited old paths (mark-0005, mark-0024-deploy, mark-0025-overbooking, index-0030, renumber-0015, renumber-0021)
- Did **not** touch `0015-*` or `0021-*`

## Testing instructions

### What to verify

- Prefixes **0018**, **0024**, and **0025** each have exactly one `docs/00NN-*.md`
- Renamed files exist as **0056** / **0057** / **0058**
- `docs/README.md` and other `docs/` links use the new basenames; no stale old basenames under `docs/`
- Open status NEWs point at the new paths (not missing files)

### How to test

From repo root (docs-only; no compose / Puppeteer required):

```bash
# Exactly one file per prefix
ls docs/0018-*.md docs/0024-*.md docs/0025-*.md
# Expect: verifactu, whatsapp, reservation-overbooking-detection (one each)

test -f docs/0056-gmail-setup.md
test -f docs/0057-deploy-css-fix-amvara9.md
test -f docs/0058-test-scenario-one-empty-table.md

# No stale basenames under docs/
rg -n '0018-gmail-setup|0024-deploy-css-fix|0025-test-scenario-one-empty-table' docs/ ; echo "exit=$?"
# Expect: no matches (rg exit 1)

# README mentions new ids
rg -n '0056-gmail-setup|0057-deploy-css-fix|0058-test-scenario' docs/README.md

# Open NEWs should not still instruct old deploy-css / scenario paths
rg -n 'docs/0024-deploy-css-fix|docs/0025-test-scenario-one-empty|docs/0018-gmail-setup' agents2/tasks/NEW-*.md ; echo "exit=$?"
# Expect: no matches
```

### Pass/fail criteria

| Check | Pass |
|-------|------|
| One `docs/0018-*.md`, one `0024-*.md`, one `0025-*.md` | PASS if counts are 1 |
| `0056` / `0057` / `0058` files exist | PASS if `test -f` succeeds |
| `rg` old basenames under `docs/` | PASS if no hits |
| README Quick links / Email / Deployment / Plans rows resolve | PASS if linked files exist |
| Open `NEW-*.md` old path citations for the three renames | PASS if no hits |
| No product code (`back/` / `front/`) required for this task | N/A |

## Test report

1. **Date/time (UTC):** 2026-07-26 08:08:18 – 08:08:30 UTC. Log window: N/A (docs-only; no containers exercised).
2. **Environment:** branch `development` @ `735ea616`; docs verification from repo root; no compose/Puppeteer (`BASE_URL` N/A).
3. **What was tested:** Unique prefixes 0018/0024/0025; renamed 0056/0057/0058 files; stale basename cleanup under `docs/`; README links; open `NEW-*.md` path updates.
4. **Results:**
   - One file each for 0018/0024/0025 — **PASS** — `0018-verifactu…`, `0024-whatsapp…`, `0025-reservation-overbooking…` (counts 1/1/1).
   - `0056` / `0057` / `0058` exist — **PASS** — `test -f` succeeded for all three.
   - `rg` old basenames under `docs/` — **PASS** — no hits (`docs_stale_exit=1`).
   - README rows resolve — **PASS** — README cites 0056/0057/0058; linked files exist on disk.
   - Open `NEW-*.md` old path citations — **PASS** — no hits (`new_stale_exit=1`).
   - Product code — **N/A**.
5. **Overall:** **PASS**
6. **Product owner feedback:** Doc prefix collisions for gmail/deploy-css/empty-table are cleared; Feature-guide indexes and agent shortcuts for 0018/0024/0025 are unambiguous again. Safe to archive once closer runs.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification; no `pos-front` / `pos-back` logs.
