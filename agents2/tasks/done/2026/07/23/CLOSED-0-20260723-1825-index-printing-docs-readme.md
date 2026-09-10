---
## Closing summary (TOP)

- **What happened:** Docs index missed `PRINTING.md`, so kitchen/LAN print design notes were hard to discover.
- **What was done:** Added a Reference & notes row in `docs/README.md` linking `PRINTING.md` with an honest “not implemented” blurb; body of PRINTING left unchanged.
- **What was tested:** `rg` found the README row; `docs/PRINTING.md` exists; blurb does not claim a shipped LAN print agent — overall PASS (2026-07-26T06:25:45Z).
- **Why closed:** All pass/fail criteria met; docs-only indexing complete.
- **Closed at (UTC):** 2026-07-26 06:26
---

# Index PRINTING.md in docs/README

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/PRINTING.md`** holds the kitchen/LAN print-agent design notes (and is cross-linked from kitchen display), but **`docs/README.md`** never lists it. Operators and agents searching the docs index miss the only print reference. Sibling **`NEW-0-20260722-1213-printing-doc-design-status`** owns a top-of-file status banner only — it does not add a README row.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:24Z: `SIGNAL docs_stale×14` + `changelog_sparse` already owned; `demo_tables_check=ok`; Unreleased=1 post-2.1.28; NEW backlog≈88
- `stale_doc path=docs/PRINTING.md` still in digest; basename refresh already queued (1213)
- `rg` on **`docs/README.md`**: no hits for `PRINTING`
- File on disk: **`docs/PRINTING.md`**

## High-level instructions for coder

- In **`docs/README.md` Reference & notes** (or Other), add one row for **`PRINTING.md`**: restaurant LAN / kitchen ticket printing design notes; **not implemented** in current POS (browser/invoice print is supported today)
- Index only; do not rewrite PRINTING body (leave banner to **1213** if still open); no product code
- Pass/fail: `rg -n 'PRINTING' docs/README.md` hits; link resolves

## Coder notes

- Added one Reference & notes row for **`PRINTING.md`** in **`docs/README.md`** (after `0033-postgres-adhoc-sql-table-names.md`).
- Did not change **`docs/PRINTING.md`** body (status banner left to sibling **1213** if still open).
- No product code.

## Testing instructions

### What to verify

- **`docs/README.md`** lists **`PRINTING.md`** under **Reference & notes**.
- The relative link target **`docs/PRINTING.md`** exists.
- Blurb states LAN/kitchen print design is **not implemented**, and that browser/invoice print is supported today.

### How to test

From repo root:

```bash
rg -n 'PRINTING' docs/README.md
test -f docs/PRINTING.md && echo OK
```

Optional: open `docs/README.md` and follow the PRINTING link.

### Pass/fail criteria

- **Pass:** `rg` hits the Reference row; `docs/PRINTING.md` exists; description does not claim a shipped LAN print agent.
- **Fail:** no `PRINTING` hit in `docs/README.md`, broken link, or blurb implies printing agent is implemented.

## Test report

1. **Date/time (UTC):** 2026-07-26T06:25:45Z — log window N/A (docs-only).
2. **Environment:** branch `development` @ `696188a3`; no Docker/compose; no `BASE_URL` (docs verification only).
3. **What was tested:** `docs/README.md` Reference & notes row for `PRINTING.md`; file exists; blurb does not claim LAN print agent shipped.
4. **Results:**
   - Reference row lists `PRINTING.md`: **PASS** — `rg` hit line 96: `| [PRINTING.md](PRINTING.md) | Restaurant LAN / kitchen ticket printing design notes (**not implemented**); browser and invoice print from staff UI are supported today. |`
   - Target file exists: **PASS** — `test -f docs/PRINTING.md` → OK
   - Blurb does not claim shipped LAN agent: **PASS** — text says **not implemented**; notes browser/invoice print today
5. **Overall:** **PASS**
6. **Product owner feedback:** The docs index now surfaces the kitchen/LAN print design notes with an honest “not implemented” status, so operators won’t mistake research for a live print agent. Quick to find from README; no further docs work needed for this indexing task.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only; no container logs required.

