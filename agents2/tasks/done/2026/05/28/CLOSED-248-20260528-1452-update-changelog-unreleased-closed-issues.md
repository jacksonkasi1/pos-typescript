---
## Closing summary (TOP)

- **What happened:** Tester verified that `CHANGELOG.md` [Unreleased] now documents closed issues #213–#244 with correct deduplication and version policy.
- **What was done:** [Unreleased] was filled with grouped and single bullets (bulk import, pricing helper, inventory/PO i18n, floor plan, table tiles, etc.); #215 omitted (still open); version kept at 2.0.85 without cutting a new release section.
- **What was tested:** All five verification criteria passed — coverage scan, dedupe check, #243 under Fixed only, package.json 2.0.85, grep confirms issue references.
- **Why closed:** All acceptance criteria passed; documentation-only scope complete.
- **Closed at (UTC):** 2026-05-28 14:59
---

# Update CHANGELOG [Unreleased] for closed issues #213–#244

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/248
- **248**

## Problem / goal

`CHANGELOG.md` **[Unreleased]** is behind: many issues closed since **[2.0.84]** (2026-04-21) are missing. `front/package.json` is **2.0.85**; changelog entries for **#213–#244** need to be added without duplicate bullets. **No application code changes** — documentation and version policy only.

## High-level instructions for coder

- Edit **`CHANGELOG.md`** **[Unreleased]** only (Added / Changed / Fixed per Keep a Changelog style; past tense, user-visible impact).
- **Deduplicate** when writing (one bullet per grouped theme):
  - **#242 + #244** → one **Added** (bulk JSON import + category/subcategory dropdowns in preview).
  - **#243** → **Fixed** only (preview-json 500 / slowapi async), not a separate feature line.
  - **#213, #232, #233** → one **Changed** (pricing helper UX).
  - **#225, #226** → one **Changed** (PO status help panel / info icon).
  - **#216–#220, #228** → one line (inventory/PO i18n).
  - **#238–#240** → one **Changed** (floor plan sidebar/zoom/shape palette i18n).
  - **#236, #237** → one **Changed** (table tiles / joined group layout).
- **Single bullets** (do not repeat group themes): **#241** book default time today; **#230** kitchen silent refresh; **#231** price € overlap; **#234** subcategory i18n; **#235** join layout restore; **#222–#224, #227, #229, #221, #223** inventory/PO items as needed without duplicating grouped lines above.
- Cross-check closed tasks under **`agents2/tasks/done/2026/05/`** for accurate wording; reference issue numbers in parentheses.
- **Version policy:** confirm whether **[Unreleased]** should stay patch-level for 2.0.85 or warrant a new **`## [2.0.86]`** section per **`.cursor/rules/commit-changelog-version.mdc`** — bump **`front/package.json`** / **`package-lock.json`** only if releasing a version section (not required if only filling [Unreleased]).
- Done when **[Unreleased]** reflects **#213–#244** without duplicate entries; commit on **`development`** when asked.

## Implementation summary

- Updated **`CHANGELOG.md`** **[Unreleased]** only: **Added** bulk import (#242, #244) and centiliter (#214); **Fixed** preview-json slowapi (#243); **Changed** grouped and single bullets for closed **#213–#244** per task dedupe rules.
- **#215** omitted (GitHub issue still **open**).
- **Version policy:** kept **`[Unreleased]`** under existing **2.0.85** in **`front/package.json`** — no new **`## [2.0.86]`** section (documentation fill only, not a release cut).

## Testing instructions

1. Open **`CHANGELOG.md`** and read **`## [Unreleased]`** — confirm bullets cover closed issues **#213–#244** except **#215** (still open).
2. Confirm grouped themes appear **once** (bulk import #242+#244; pricing helper #213+#232+#233; PO help #225+#226; inventory i18n #216–#220+#228; floor plan #238–#240; table tiles #236+#237).
3. Confirm **#243** appears only under **Fixed**, not as a separate feature line.
4. Confirm **`front/package.json`** **`version`** remains **2.0.85** (no version bump).
5. Optional: `grep -E '#21[3-9]|#22[0-9]|#23[0-9]|#24[0-4]' CHANGELOG.md` — each closed issue in range should match at least one bullet (**#215** excluded).

---

## Test report

1. **Date/time (UTC):** 2026-05-28 14:58 UTC (start ~14:55 UTC). Log window: N/A — documentation-only verification, no container exercise required.
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`); local repo read-only review of `CHANGELOG.md`, `front/package.json`, `front/package-lock.json`. No `BASE_URL` / browser.
3. **What was tested:** [Unreleased] coverage for closed issues #213–#244 (excluding open #215); dedupe of grouped themes; #243 placement; version policy (2.0.85, no release section cut).
4. **Results:**
   - Criterion 1 — **PASS:** Python scan of `## [Unreleased]` resolves en-dash ranges (`#216–#220`, `#238–#240`); all issues 213–244 present except **#215** (correctly omitted).
   - Criterion 2 — **PASS:** Each grouped theme appears in a single bullet: bulk import (#242, #244); pricing helper (#213, #232, #233); PO help (#225, #226); inventory i18n (#216–#220, #228); floor plan (#238–#240); table tiles (#236, #237).
   - Criterion 3 — **PASS:** `#243` appears once, under **### Fixed** only (not Added or Changed).
   - Criterion 4 — **PASS:** `front/package.json` and `front/package-lock.json` both `"version": "2.0.85"`; no `## [2.0.86]` section added.
   - Criterion 5 — **PASS:** `grep -E '#21[3-9]|#22[0-9]|#23[0-9]|#24[0-4]' CHANGELOG.md` returns 17 distinct bullets in [Unreleased]; range notation covers #217–#219 and #239.
5. **Overall:** **PASS**
6. **Product owner feedback:** The [Unreleased] section now reads as a coherent release note for the May inventory, products, tables, and kitchen work without duplicate bullets. Keeping 2.0.85 without cutting a new version section matches the “documentation fill only” intent. Ready for committer/changelog commit when requested.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — no Docker/runtime verification required for changelog-only scope.
