---
## Closing summary (TOP)

- **What happened:** Enhancement-reviewer task to index `docs/0051-table-groups-mvp.md` under Feature guides in `docs/README.md` so agents do not confuse floor-plan table groups with 0054 restaurant groups.
- **What was done:** Added a Feature guides row for `0051-table-groups-mvp.md` (before 0052) with a blurb for floor-plan join/unjoin MVP that explicitly distinguishes it from 0054; index only, no product code.
- **What was tested:** `rg` / file checks — Feature guides hit at line 65, link target exists, blurb distinguishes from 0054; overall **PASS**.
- **Why closed:** All pass/fail criteria met; docs-only change safe to archive.
- **Closed at (UTC):** 2026-07-26 17:32
---

# Index 0051 table-groups MVP in docs/README

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0051-table-groups-mvp.md`** documents floor-plan join/unjoin (combined seats, reservation pool) — distinct from restaurant multi-location groups (**0054**). It is on disk and referenced from closed join-UX work, but **`docs/README.md`** never lists it under Feature guides. Agents scanning the index can confuse **0054** restaurant groups with table groups, or miss the MVP doc entirely. Sibling **`NEW-0-20260722-1412-mark-0051-table-groups-shipped`** owns a shipped banner only — not a README row.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:24Z: `SIGNAL docs_stale×14` + `changelog_sparse` already owned; `demo_tables_check=ok`; NEW backlog≈88
- `rg` on **`docs/README.md`**: Feature guides has **0054** restaurant groups; no hits for `0051` / `table-groups`
- File on disk: **`docs/0051-table-groups-mvp.md`**
- Do **not** merge with **0054** Quick links / Feature guides NEWs (different feature)

## High-level instructions for coder

- In **`docs/README.md` Feature guides**, add one row for **`0051-table-groups-mvp.md`**: floor-plan table join/unjoin, combined seats, reservation pool (MVP; distinguish from **0054** restaurant groups)
- Index only; no product code; leave body/status banner to **1412** if still open
- Pass/fail: `rg -n '0051|table-groups-mvp' docs/README.md` under Feature guides; link resolves; blurb does not conflate with 0054

## Implementation notes (coder)

- Added Feature guides row for **`0051-table-groups-mvp.md`** (before **0052**): floor-plan join/unjoin MVP; blurb explicitly not restaurant multi-location groups (**0054**).
- Index only; no product code; sibling **1412** still owns shipped-banner work.

## Testing instructions

### What to verify
- **`docs/README.md`** Feature guides lists **`0051-table-groups-mvp.md`**.
- Link target exists; description distinguishes floor-plan table groups from **0054** restaurant groups.

### How to test
```bash
# From repo root
rg -n '0051|table-groups-mvp' docs/README.md
test -f docs/0051-table-groups-mvp.md
rg -n '0054-restaurant-groups' docs/README.md
```

### Pass/fail criteria
- **Pass:** `rg` hits the Feature guides row for `0051-table-groups-mvp`; file exists; blurb mentions floor-plan join/unjoin (or combined seats / reservation pool) and does not describe multi-location restaurant groups as the same feature as 0051.
- **Fail:** No Feature guides hit for 0051, broken link, or blurb conflates 0051 with 0054.

## Test report

1. **Date/time (UTC):** 2026-07-26T17:31:42Z – 2026-07-26T17:31:45Z. Log window: last 5m on `pos-front` (no product change expected).
2. **Environment:** Local Docker (`docker-compose.yml` + `docker-compose.dev.yml`); branch `development` @ `c73078f5`; docs-only verification (no `BASE_URL` browser flow).
3. **What was tested:** Feature guides row for `0051-table-groups-mvp.md`; link target exists; blurb distinguishes floor-plan table groups from 0054 restaurant multi-location groups.
4. **Results:**
   - Feature guides lists `0051-table-groups-mvp.md` — **PASS** — `docs/README.md:65` hits `0051-table-groups-mvp`.
   - Link target exists — **PASS** — `test -f docs/0051-table-groups-mvp.md` → yes.
   - Blurb distinguishes from 0054 — **PASS** — line 65: “Floor-plan table join/unjoin … combined seats and reservation pool … not restaurant multi-location groups ([0054]…)”; separate 0054 Feature guides row at line 68.
5. **Overall:** **PASS**
6. **Product owner feedback:** Docs index now surfaces the table-groups MVP next to other feature guides, with an explicit “not 0054” note so agents do not confuse floor-plan joins with multi-location restaurant groups. No product code risk; safe to close.
7. **URLs tested:** N/A — no browser (docs/rg only). Spot health: `http://127.0.0.1:4202/` → 200.
8. **Relevant log excerpts:** `docker logs --since 5m pos-front` — no TS/NG errors in window (docs-only change; stack healthy).

