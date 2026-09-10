---
## Closing summary (TOP)

- **What happened:** Duplicate `docs/0015-*` prefix conflicted kitchen display with the platform operator portal guide.
- **What was done:** Platform portal doc renamed to `docs/0059-platform-operator-portal.md`; live links updated in docs/README, root README, ROADMAP, testing, screenshots, and related docs/tasks.
- **What was tested:** Filesystem and `rg` checks passed — only kitchen remains as `0015`; `0059` exists; no live `0015-platform-operator` under docs/README/ROADMAP/AGENTS.
- **Why closed:** All pass/fail criteria passed (docs-only; no runtime risk).
- **Closed at (UTC):** 2026-07-26 08:18
---

# Renumber duplicate 0015 platform-operator doc

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Two feature guides share the **`0015-`** prefix: `docs/0015-kitchen-display.md` (kitchen/bar KDS) and `docs/0015-platform-operator-portal.md` (SaaS platform portal). `docs/README.md` indexes both under Feature guides with the same number, so agents and humans cannot tell which “0015” to open. Kitchen display owned the number first; platform portal should get the next free id.

## Evidence (008 preflight / review)

- Weekly docs drift sweep: duplicate numeric prefixes in `docs/` (`0015`, also `0018`/`0024`/`0025` — scope **only 0015 platform** here; other pairs already have or will get separate tasks)
- Platform doc exists and is recent (2026-07-14); kitchen doc is older and correctly listed as kitchen KDS
- Cross-links: `WIP-296` and README delivery/saas NEW mention `docs/0015-platform-operator-portal.md` — update those paths when renaming

## High-level instructions for coder

- Rename `docs/0015-platform-operator-portal.md` → next free id after **0058** (e.g. **`docs/0059-platform-operator-portal.md`**). Do **not** use **0055** (already `0055-public-seo.md`) or **0056–0058** (gmail / deploy-css / overbooking scenario).
- Update **`docs/README.md`** Feature guides row (link + keep kitchen as 0015).
- Update in-repo references that point at the old path (at least open task **`NEW-0-20260722-1159-readme-delivery-courier-saas-features.md`** if still open, and **`WIP-296-…`** context line). Prefer a short `rg '0015-platform-operator'` pass under `docs/` and `agents2/`.
- Do not renumber kitchen display; no product code changes.
- Pass/fail: only one `0015-*.md`; platform guide opens as `0059-…`; README links resolve.

## Implementation notes (coder)

- Renamed `docs/0015-platform-operator-portal.md` → `docs/0059-platform-operator-portal.md` (kitchen display stays `0015`).
- Updated live links in `docs/README.md`, root `README.md`, `ROADMAP.md`, `docs/testing.md`, `docs/screenshots/README.md`, `docs/0052-saas-signup-paywall.md`.
- Updated open NEW sibling `NEW-0-20260723-1628-docs-readme-quick-links-delivery-paywall.md` and free-id note on `NEW-0-20260723-1714-renumber-duplicate-doc-prefix-0021-working-plan.md` (next id **0060+**).
- Left historical `CHANGELOG.md` / `CLOSED-*` / `UNTESTED-*` task text unchanged (not in coder edit scope).

## Testing instructions

### What to verify

- Exactly one `docs/0015-*.md` (kitchen display).
- Platform operator guide exists at `docs/0059-platform-operator-portal.md`.
- Feature guides / root README / ROADMAP / testing / screenshots / 0052 links resolve to `0059`, not the old `0015-platform-operator` path.

### How to test

From repo root:

```bash
# Exactly one 0015 doc (kitchen)
ls docs/0015*.md
test -f docs/0015-kitchen-display.md
test ! -f docs/0015-platform-operator-portal.md
test -f docs/0059-platform-operator-portal.md

# Live docs / root free of old filename
rg -n '0015-platform-operator' docs/ README.md ROADMAP.md AGENTS.md
# expect: no matches

# New path indexed
rg -n '0059-platform-operator' docs/README.md README.md ROADMAP.md docs/testing.md docs/screenshots/README.md docs/0052-saas-signup-paywall.md
```

No Docker / Puppeteer required (documentation rename only).

### Pass/fail criteria

- **PASS** if: only `docs/0015-kitchen-display.md` under `0015-*`; `docs/0059-platform-operator-portal.md` exists; `rg '0015-platform-operator' docs/ README.md ROADMAP.md AGENTS.md` is empty; `docs/README.md` Feature guides row links `0059-platform-operator-portal.md`.
- **FAIL** if: old file still present, duplicate `0015-*`, or broken live markdown links to the old path under `docs/` / root README / ROADMAP.

## Test report

- **Date/time (UTC):** 2026-07-26 08:18 UTC (log window N/A — docs-only; no containers exercised)
- **Environment:** branch `development` @ `6a2cff2c`; local repo filesystem checks only (no Docker / Puppeteer / BASE_URL)
- **What was tested:** Exactly one `docs/0015-*.md` (kitchen); platform guide at `0059`; live docs/root free of old `0015-platform-operator` path; Feature guides / README / ROADMAP / testing / screenshots / 0052 link to `0059`

### Results

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Exactly one `docs/0015-*.md` (kitchen display) | **PASS** | `ls docs/0015*.md` → only `docs/0015-kitchen-display.md` |
| Old path removed | **PASS** | `test ! -f docs/0015-platform-operator-portal.md` |
| Platform guide at `0059` | **PASS** | `test -f docs/0059-platform-operator-portal.md` |
| No live `0015-platform-operator` under docs/README/ROADMAP/AGENTS | **PASS** | `rg -n '0015-platform-operator' docs/ README.md ROADMAP.md AGENTS.md` → empty |
| Feature guides + root indexes use `0059` | **PASS** | `docs/README.md:57` Feature guides row; also README, ROADMAP, testing, screenshots, 0052 |

- **Overall:** **PASS**
- **Product owner feedback:** Duplicate `0015` numbering is resolved; kitchen keeps `0015`, platform portal is consistently `0059` across live docs and root indexes. Safe for closing/archive; no product runtime risk.
- **URLs tested:** N/A — no browser
- **Relevant log excerpts:** N/A — documentation rename only; no container logs collected.
