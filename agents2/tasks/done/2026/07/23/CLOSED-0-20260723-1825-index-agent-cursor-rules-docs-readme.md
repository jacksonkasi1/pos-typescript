---
## Closing summary (TOP)

- **What happened:** `docs/README.md` Reference did not list the Cursor rules catalog (`docs/agent-cursor-rules.md`) next to `agent-loop.md`.
- **What was done:** Added one Reference & notes row for `agent-cursor-rules.md` immediately after `agent-loop.md`; catalog body left untouched.
- **What was tested:** Docs-only checks passed — `rg` hits the Reference row; `docs/agent-cursor-rules.md` exists on disk.
- **Why closed:** All pass/fail criteria met; no GitHub issue (issue `0`).
- **Closed at (UTC):** 2026-07-26 07:00
---

# Index agent-cursor-rules.md in docs/README

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/agent-cursor-rules.md`** is the categorized index of **`.cursor/rules/*.mdc`** (and is linked from **`AGENTS.md`**), but **`docs/README.md`** only lists **`agent-loop.md`** under Reference. Agents opening the docs index for “where are the cursor rules?” miss the catalog. Sibling **`NEW-0-20260722-1412-fix-agent-cursor-rules-task-paths`** owns a Related-path fix inside the catalog — not a README row.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:24Z: `SIGNAL docs_stale×14` + `changelog_sparse` already owned; `demo_tables_check=ok`; NEW backlog≈88
- `rg` on **`docs/README.md`**: `agent-loop` present; no hits for `agent-cursor-rules`
- File on disk: **`docs/agent-cursor-rules.md`**
- Related open: agent-loop / AGENTS.md path NEWs — do not reopen those files here

## High-level instructions for coder

- In **`docs/README.md` Reference & notes**, add one row for **`agent-cursor-rules.md`**: categorized index of Cursor/agent stack rules (Angular, FastAPI, Docker, security, i18n); pair near **`agent-loop.md`**
- Index only; no product code; do not rewrite the catalog body (leave path fix to **1412** if still open)
- Pass/fail: `rg -n 'agent-cursor-rules' docs/README.md` hits Reference; link resolves

## Implementation notes (coder)

- Added one Reference & notes row for **`agent-cursor-rules.md`** immediately after **`agent-loop.md`** in **`docs/README.md`**.
- Catalog body untouched (path fix remains with sibling **1412** if still open).
- No product code changes.

## Testing instructions

### What to verify
- **`docs/README.md`** Reference & notes lists **`agent-cursor-rules.md`** next to **`agent-loop.md`**.
- Markdown link resolves to the on-disk catalog.

### How to test
```bash
rg -n 'agent-cursor-rules' docs/README.md
test -f docs/agent-cursor-rules.md
```

### Pass/fail criteria
- **Pass:** `rg` hits the Reference & notes table row; `docs/agent-cursor-rules.md` exists; no product/code churn required.
- **Fail:** No `agent-cursor-rules` hit under Reference, or link target missing.

## Test report

- **Date/time (UTC):** 2026-07-26T07:00:07Z start → 2026-07-26T07:00:10Z end. Log window N/A (docs-only; no container exercise).
- **Environment:** Branch `development` (synced via `./scripts/git-sync-development.sh`). Repo root checks only; no compose / `BASE_URL`.
- **What was tested:** Reference & notes row for `agent-cursor-rules.md` next to `agent-loop.md`; on-disk catalog link target.
- **Results:**
  - Reference row present after `agent-loop.md` — **PASS** — `rg -n 'agent-cursor-rules' docs/README.md` → line 88 table row; line 87 is `agent-loop.md`.
  - Link target exists — **PASS** — `test -f docs/agent-cursor-rules.md` → `FILE_EXISTS=OK` (34-line catalog starting `# Cursor rules for agents`).
- **Overall:** **PASS**
- **Product owner feedback:** Docs index now surfaces the Cursor rules catalog beside the agent-loop reference, so operators looking for stack rules from `docs/README.md` no longer miss it. No product or runtime risk; sibling path-fix task 1412 remains separate if still open.
- **URLs tested:** N/A — no browser
- **Relevant log excerpts (last section):** N/A — docs-only verification; no `pos-front` / `pos-back` activity required.
