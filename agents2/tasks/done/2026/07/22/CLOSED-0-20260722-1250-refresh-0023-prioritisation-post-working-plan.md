---
## Closing summary (TOP)

- **What happened:** Docs still framed prioritisation as “0021 vs 0022” after working plan (0021) had already shipped.
- **What was done:** Updated `docs/0023-prioritisation-019-022.md` and the `docs/README.md` 0023 index so next open item is 0022 (OAuth), with 0021 as completed background and optional 0020 as non-blocking hardening.
- **What was tested:** Docs-only `rg` / file checks — all criteria **PASS** (stale “do 0021 first” narrative gone; status and recommendation agree; README accurate; no product code).
- **Why closed:** All pass/fail criteria passed.
- **Closed at (UTC):** 2026-07-26 10:28
---

# Refresh 0023 prioritisation after working plan shipped

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0023-prioritisation-019-022.md` still frames the decision as “0021 vs 0022”, but the status table already marks **0021 (Working plan) Done**. Agents and humans reading the recommendation section get outdated advice and may re-open shipped work.

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` — `docs/0023-prioritisation-019-022.md` (~126d untouched) while code moved
- Status table: **0021 Done**, **0022 To do**, **0019 Done**, **0020 Mostly done**
- Narrative still says “the real what do we do first is between 0021 and 0022” and recommends doing working plan first
- Working plan is live (`/working-plan`, `docs/0021-working-plan.md`, Puppeteer `test:working-plan`)

## High-level instructions for coder

- Update **only** `docs/0023-prioritisation-019-022.md` (no bulk roadmap rewrite).
- Keep the status table; refresh the recommendation so **next open item is 0022 (OAuth)**; treat 0021 as completed background.
- Optionally note optional **0020** follow-ups (public-menu / upload limits) as hardening, not blocking OAuth.
- Point readers to `docs/0022-oauth-social-login-notes.md` for OAuth design; do not implement OAuth in this task.
- Pass/fail: doc no longer recommends doing working plan before OAuth; status and recommendation agree; `docs/README.md` index row for 0023 still accurate (one-line tweak OK).

## Coder notes (2026-07-26)

- Rewrote recommendation in `docs/0023-prioritisation-019-022.md`: status banner + table kept; next open item is **0022**; **0021** treated as completed background; **0020** follow-ups called out as non-blocking hardening; links to `docs/0022-oauth-social-login-notes.md` and `docs/0021-working-plan.md`.
- Tweaked `docs/README.md` Reference row for 0023 to say **0021 done**; next **0022 (OAuth)**.
- No product code changes.

## Testing instructions

### What to verify

- `docs/0023-prioritisation-019-022.md` no longer recommends doing working plan before OAuth.
- Status table and recommendation agree (**0021 Done**, next open = **0022**).
- Doc links to `docs/0022-oauth-social-login-notes.md` for OAuth design.
- Optional **0020** items are hardening, not blockers for OAuth.
- `docs/README.md` index row for 0023 reflects the updated prioritisation.

### How to test

```bash
# From repo root
rg -n "Working plan first|between \*\*0021\*\* and \*\*0022\*\*|do \*\*0021" docs/0023-prioritisation-019-022.md
# Expect: no matches (outdated “do 0021 first” narrative gone)

rg -n "next open item|0022|completed background|0020 follow-ups" docs/0023-prioritisation-019-022.md
# Expect: recommendation points at 0022; 0021 completed; 0020 hardening

rg -n "0023-prioritisation" docs/README.md
# Expect: blurb mentions 0021 done and next 0022 (OAuth)

test -f docs/0022-oauth-social-login-notes.md && test -f docs/0021-working-plan.md
```

No app/Puppeteer run required (docs-only).

### Pass/fail criteria

- **Pass:** No “do working plan first / 0021 vs 0022” recommendation; next open item is OAuth (0022) with link to design notes; README index accurate; no product code in the diff.
- **Fail:** Doc still prioritises 0021 over 0022, or README still says generic “what to do first” without reflecting shipped 0021.

## Test report

- **Date/time (UTC):** 2026-07-26T10:28:08Z start → 2026-07-26T10:28:16Z end. Log window: N/A (docs-only; no container exercise).
- **Environment:** branch `development` @ `8b00239d`; local workspace after `./scripts/git-sync-development.sh`. No `BASE_URL` / compose (docs-only).
- **What was tested:** Stale “do 0021 / working plan first” narrative removed; status table vs recommendation (**0021 Done**, next **0022**); link to `0022-oauth-social-login-notes.md`; **0020** as non-blocking hardening; `docs/README.md` 0023 index row; no `back/`/`front/` product diff for this change set.

### Results

| Criterion | Result | Evidence |
|-----------|--------|----------|
| No “do working plan first / 0021 vs 0022” recommendation | **PASS** | `rg` for `Working plan first\|between \*\*0021\*\* and \*\*0022\*\*\|do \*\*0021` and extra stale phrases → no matches (exit 1). |
| Status table and recommendation agree (**0021 Done**, next open **0022**) | **PASS** | Table L15 **0021**/**Done**, L16 **0022**/**To do**; banner + `## Recommendation: next open item is **0022 (OAuth)**`; “**0021 … completed background**”. |
| Links to OAuth design notes | **PASS** | Relative links to `0022-oauth-social-login-notes.md` in banner, table, and recommendation; `test -f docs/0022-oauth-social-login-notes.md` and `docs/0021-working-plan.md` OK. |
| Optional **0020** = hardening, not OAuth blocker | **PASS** | Section `### Optional: 0020 follow-ups (hardening, not blocking OAuth)` + summary order places 0020 after 0022 as hardening only. |
| `docs/README.md` 0023 index accurate | **PASS** | L106: “**0021 done**; next open item **0022 (OAuth)**”. |
| No product code in the change | **PASS** | `git diff --name-only HEAD -- back/ front/` empty (0 files). |

- **Overall:** **PASS**
- **Product owner feedback:** Prioritisation doc and README index now match reality: working plan is shipped background, and the next open item in 0019–0022 is clearly OAuth (0022) with a pointer to the design notes. Optional rate-limit hardening is correctly demoted so agents will not re-open 0021 as the “what to do first” choice.
- **URLs tested:** N/A — no browser
- **Relevant log excerpts:** N/A — docs-only verification; no `pos-front` / `pos-back` logs collected.
