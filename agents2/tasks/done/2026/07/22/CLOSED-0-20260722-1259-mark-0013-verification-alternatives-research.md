---
## Closing summary (TOP)

- **What happened:** Docs incorrectly framed SMS verification as a POS shipping recommendation.
- **What was done:** Marked `docs/0013-verification-alternatives.md` and its `docs/README.md` index entry as research-only; softened SMS “recommended” framing to research-relative language; no product code changes.
- **What was tested:** Banner, SMS section qualification, README research-only blurb, and empty `back/`/`front/` diff — all **PASS**.
- **Why closed:** All pass/fail criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-26 11:06
---

# Mark 0013 verification alternatives as research-only

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0013-verification-alternatives.md` recommends **SMS verification** as “RECOMMENDED FOR POS” and ranks social login / other options. It sits under Reference in `docs/README.md` like operational guidance, while product auth remains email/password (+ planned email verification in **0002**). Agents may treat SMS as an accepted product decision.

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` — `docs/0013-verification-alternatives.md` (~129d untouched)
- Doc header: “Alternatives to email verification…” with SMS starred recommended
- Related historical snapshot: `NEW-0-20260722-1250-mark-0007-verification-report-historical.md` (explicitly left 0013 out of scope)
- OAuth design lives separately in `docs/0022-oauth-social-login-notes.md` (not implemented)

## High-level instructions for coder

- Edit **only** `docs/0013-verification-alternatives.md` and the **`docs/README.md`** Reference blurb.
- Add a short top banner: **research / alternatives note** — not a shipping decision; current app uses email/password; do not implement SMS/OAuth from this doc alone.
- Optionally tone down or footnote the “RECOMMENDED FOR POS” star so it is clearly relative to the research options, not current roadmap.
- Do not implement SMS, Twilio, or OAuth; do not bulk-rewrite the alternatives body.
- Pass/fail: readers see research-only status from banner + README; no product code changes.

## Coder notes (2026-07-26)

- Added research-only banner under the title on `docs/0013-verification-alternatives.md`.
- Softened SMS section heading from “RECOMMENDED FOR POS” to “Preferred among research options for POS” + one-line research ranking note.
- Updated `docs/README.md` Reference row to **Research only** / not a shipping decision.
- No `back/` or `front/` changes.

## Testing instructions

### What to verify

1. `docs/0013-verification-alternatives.md` opens with a **research / alternatives note** banner stating email/password is current auth and SMS/OAuth must not be implemented from this doc alone.
2. The SMS section no longer reads as an accepted product “RECOMMENDED FOR POS” decision without qualification.
3. `docs/README.md` index blurb for 0013 says research-only / not a shipping decision.
4. No product code changes under `back/` or `front/`.

### How to test

```bash
# From repo root
head -20 docs/0013-verification-alternatives.md
rg -n '0013-verification|Research only|RECOMMENDED FOR POS' docs/0013-verification-alternatives.md docs/README.md
git diff --stat -- docs/0013-verification-alternatives.md docs/README.md
git diff --name-only -- back/ front/
```

Docs-only; no Docker, Puppeteer, or compose required.

### Pass/fail criteria

- **PASS:** Banner present; README row marked research-only; SMS “recommended” framing is clearly research-relative; `back/` and `front/` untouched.
- **FAIL:** Banner missing, README still reads as live ops guidance, or product code was changed.

## Test report

1. **Date/time (UTC):** 2026-07-26 11:05:31–11:05:34 UTC. Log window: N/A — docs-only (no container runs).
2. **Environment:** Local repo on `development` (synced via `./scripts/git-sync-development.sh`). No Docker/compose. No `BASE_URL`.
3. **What was tested:** Research-only banner on `docs/0013-verification-alternatives.md`; SMS section qualification; `docs/README.md` 0013 index blurb; absence of `back/` / `front/` product changes.
4. **Results:**
   - Criterion 1 (banner): **PASS** — `head -20` shows blockquote: “Research / alternatives note — not a shipping decision”; email/password current; do not implement SMS/Twilio/OAuth from this doc alone.
   - Criterion 2 (SMS framing): **PASS** — heading is “Preferred among research options for POS” with “(Research ranking only — not an accepted product decision…)”; `rg` finds no bare `RECOMMENDED FOR POS`.
   - Criterion 3 (README): **PASS** — row: “**Research only** — … not a shipping decision; app uses email/password.”
   - Criterion 4 (no product code): **PASS** — `git diff --name-only -- back/ front/` empty; only docs + task files dirty.
5. **Overall:** **PASS**
6. **Product owner feedback:** 0013 no longer reads as an accepted SMS shipping decision. Agents and humans get a clear research-only signal from the banner and README. No further product work implied by this doc alone.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification (`head`, `rg`, `git diff`).
