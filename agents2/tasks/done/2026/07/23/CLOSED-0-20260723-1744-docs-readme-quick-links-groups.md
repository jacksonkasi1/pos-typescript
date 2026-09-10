---
## Closing summary (TOP)

- **What happened:** Enhancement task to add a restaurant-groups Quick link in `docs/README.md` so operators can reach `0054-restaurant-groups.md` without hunting Feature guides.
- **What was done:** Added Quick links row “Manage multi-location restaurant groups” → `0054-restaurant-groups.md` after the platform operator row; Feature guides and other tables left unchanged.
- **What was tested:** Docs-only checks passed — Quick links and Feature guides both reference 0054, target file exists; no product code required.
- **Why closed:** All pass/fail criteria met (tester overall PASS).
- **Closed at (UTC):** 2026-07-26 09:50
---

# Add restaurant groups to docs/README Quick links

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0054-restaurant-groups.md`** is indexed under Feature guides, but **Quick links** (first stop for operators) has no “Need to… multi-location / restaurant groups” row. Sibling **`NEW-0-20260723-1628-docs-readme-quick-links-delivery-paywall`** owns Delivery / paywall / optional platform only.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T17:44Z: `SIGNAL docs_stale×14` owned; index follow-on on recently touched **`docs/README.md`**
- Quick links (~L9–19): no 0054 / restaurant groups
- Feature guides already lists 0054 — do **not** rework that table here
- Out of scope: root README groups (**`NEW-0-20260723-1744-readme-restaurant-groups-and-waitlist`**), waiting-list 0011 Feature guides blurb (**`NEW-0-20260723-1714-…`**), groups Puppeteer smoke (**`NEW-0-20260723-1659-…`**)

## High-level instructions for coder

- In **`docs/README.md` Quick links only**, add one row such as: manage multi-location restaurant groups → **`0054-restaurant-groups.md`**
- Do not edit Feature guides, Deployment tables, or other docs
- Pass/fail: `rg -n '0054|restaurant group' docs/README.md` hits under Quick links; link resolves; no product code

## Coder notes (2026-07-26)

- Added Quick links row: “Manage multi-location restaurant groups” → `0054-restaurant-groups.md` (after platform operator row).
- Feature guides / other tables untouched; no product code.

## Testing instructions

### What to verify
- `docs/README.md` **Quick links** includes a row for multi-location restaurant groups pointing at `0054-restaurant-groups.md`.
- Feature guides still lists 0054 (unchanged by this task).
- Link target file exists.

### How to test
```bash
# From repo root
rg -n '0054|restaurant group' docs/README.md
# Expect a hit in the Quick links table (near top), plus existing Feature guides row.
test -f docs/0054-restaurant-groups.md && echo OK
```

### Pass/fail criteria
- **Pass:** Quick links has the groups row; `docs/0054-restaurant-groups.md` exists; no `back/` / `front/` changes required for this task.
- **Fail:** No Quick links hit for 0054 / restaurant groups, or Feature guides table was rewritten unnecessarily.

## Test report

1. **Date/time (UTC):** 2026-07-26T09:49:42Z start → 2026-07-26T09:50:30Z end. Log window: N/A (docs-only; no container exercise).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`); docs verification on working tree + `docs/0054-restaurant-groups.md` on disk. No compose / `BASE_URL` (docs-only).
3. **What was tested:** Quick links row for multi-location restaurant groups → `0054-restaurant-groups.md`; Feature guides still lists 0054; target file exists; no product-code requirement.
4. **Results:**
   - Quick links has groups → 0054 row: **PASS** — `docs/README.md:22` `| Manage multi-location restaurant groups | [0054-restaurant-groups.md](0054-restaurant-groups.md) |`
   - Feature guides still lists 0054: **PASS** — `docs/README.md:68` Feature guides row intact; not rewritten for this task
   - Link target exists: **PASS** — `test -f docs/0054-restaurant-groups.md` → OK (`docs/0054-restaurant-groups.md` present)
   - No `back/` / `front/` required: **PASS** — task scope is docs index only; no product changes needed for pass criteria
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators can now jump to restaurant-groups docs from Quick links without hunting Feature guides. The row sits after platform operator and points at the existing 0054 guide; Feature guides indexing was left alone as required.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification (`rg` + `test -f`); no `pos-front` / `pos-back` logs.
