---
## Closing summary (TOP)

- **What happened:** `docs/0012-translation-implementation.md` §6 still used French/`fr` as the “add a new language” walkthrough even though `fr` (and `bg`) already ship.
- **What was done:** §6 was rewritten to use a hypothetical unused locale (`pt` / Portuguese); a short note warns not to recreate shipped §4 locales; §4 left unchanged; no product or i18n JSON edits.
- **What was tested:** Docs-only `rg` checks confirmed no `fr.json` / “French - fr” new-language recipe, §6 uses `pt`/`pt.json`/Português, and §4 still lists fr and bg — **PASS**.
- **Why closed:** All pass/fail criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-26 05:12
---

# Fix docs/0012 “add a new language” example (fr already ships)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0012-translation-implementation.md`** § “How to Add a New Language” still walks through creating **`front/public/i18n/fr.json`** and registering **`fr`** as if French were not supported. French (and Bulgarian) already ship and appear in §4 Supported Languages. Contributors following the example invent a duplicate language path or think `fr` is unfinished.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T17:52Z: docs SIGNAL basenames owned; i18n leaf-gap NEWs already queued for fr/bg/de/es/ca/zh-CN/hi — **none** retarget the 0012 how-to example
- §4 lists **fr** and **bg**; §6 still says “e.g., French - `fr`” and “Create `front/public/i18n/fr.json`”
- On disk: `front/public/i18n/fr.json` exists; `LanguageService` already includes `fr`
- Out of scope: leaf backfills (**`NEW-0-20260723-1648-backfill-fr-i18n-missing-keys`** and siblings); Urdu RTL section (already current)

## High-level instructions for coder

- In **`docs/0012-translation-implementation.md`** §6 only, replace the French/`fr` walkthrough with a **hypothetical** unused code (e.g. `pt` / Portuguese or `it` / Italian) so the steps stay copy-pasteable without colliding with shipped locales
- Keep §4 Supported Languages list as-is unless a shipped locale is missing (do not remove fr/bg)
- One-line note that `fr` / `bg` already ship is optional
- No product code; no i18n JSON edits in this task
- Pass/fail: `rg -n 'fr\.json|French - \`fr\`' docs/0012-translation-implementation.md` no longer treats fr as the “new language” recipe; example code uses a non-shipped locale

## Coder notes (2026-07-26)

- Updated **`docs/0012-translation-implementation.md` §6 only**: walkthrough now uses hypothetical **`pt`** / Portuguese (`pt.json`, `pt-PT`, Português).
- Added one-line note that §4 locales (including **`fr`** / **`bg`**) already ship — do not recreate their files.
- §4 Supported Languages left unchanged. No product or i18n JSON edits.

## Testing instructions

### What to verify
- §6 “How to Add a New Language” no longer presents French/`fr` as the recipe for adding a new locale.
- Example steps use a non-shipped code (`pt`) and stay copy-pasteable.
- §4 still lists `fr` and `bg` as supported.

### How to test
From repo root:

```bash
# Must not match a “create fr.json / French - fr” new-language recipe
rg -n 'fr\.json|French - `fr`' docs/0012-translation-implementation.md

# Example must use pt
rg -n 'pt\.json|code: .pt.|Português|hypothetical' docs/0012-translation-implementation.md

# §4 still lists shipped fr/bg
rg -n '^\- \*\*fr:\*\*|^\- \*\*bg:\*\*' docs/0012-translation-implementation.md
```

Optional read-through: open `docs/0012-translation-implementation.md` §4 and §6 and confirm the note + Portuguese walkthrough.

### Pass/fail criteria
- **Pass:** No “new language” steps that create `fr.json` or say “e.g., French - `fr`”; §6 uses `pt` / `pt.json` / `Português`; §4 still lists fr and bg.
- **Fail:** §6 still treats `fr` as the add-language example, or §4 lost fr/bg.

## Test report

1. **Date/time (UTC):** 2026-07-26 05:12:08–05:12:16 UTC. Log window: same (docs-only verification; no feature traffic).
2. **Environment:** Local Docker (`docker-compose.yml` + `docker-compose.dev.yml`), branch `development`, BASE_URL N/A (docs-only). Containers up (pos-front/pos-back/pos-haproxy).
3. **What was tested:** `docs/0012-translation-implementation.md` §6 no longer uses French/`fr` as the add-language recipe; uses hypothetical `pt` / Portuguese; §4 still lists `fr` and `bg`.
4. **Results:**
   - No `fr.json` / `French - \`fr\`` new-language recipe: **PASS** — `rg -n 'fr\.json|French - \`fr\`' docs/0012-translation-implementation.md` returned no matches.
   - §6 uses `pt` / `pt.json` / Português / hypothetical: **PASS** — matches at lines 127, 130, 133 (`pt.json`, `code: 'pt'`, `Português`, note that fr/bg already ship).
   - §4 still lists fr and bg: **PASS** — lines 95–96 (`**fr:** Français`, `**bg:** Български`).
5. **Overall:** **PASS**
6. **Product owner feedback:** The how-to now correctly points contributors at a unused locale (`pt`) and warns not to recreate shipped `fr`/`bg` files. Supported-languages list is unchanged and still accurate. No product or i18n JSON risk from this docs-only change.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** Docs-only; no application path exercised. Sample contemporaneous back traffic unrelated: `GET /docs` 200. Front/back healthy throughout window.
