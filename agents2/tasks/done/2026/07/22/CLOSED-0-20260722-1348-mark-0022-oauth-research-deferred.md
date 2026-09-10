---
## Closing summary (TOP)

- **What happened:** Docs-only task to mark OAuth social-login notes as research/deferred so agents do not queue implementation.
- **What was done:** Status banner added on `docs/0022-oauth-social-login-notes.md`; README and `docs/0023-prioritisation-019-022.md` aligned to deferred/research (no OAuth product code).
- **What was tested:** Doc banner, README blurbs, 0023 deferred status, and absence of OAuth product surface — overall **PASS**.
- **Why closed:** All pass criteria met; tester reported PASS.
- **Closed at (UTC):** 2026-07-26 12:50
---

# Mark 0022 OAuth social-login notes as research / deferred

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0022-oauth-social-login-notes.md` is design-only (Google/Microsoft/etc.). Auth remains email/password JWT. Without a status banner, agents may queue OAuth implementation from a stale “to do” pointer in prioritisation docs.

## Evidence (008 preflight / review)

- Doc age >90d; listed among broader stale docs (prior sweeps covered 0023 prioritisation but not a dedicated 0022 status task)
- `docs/0023-prioritisation-019-022.md` still rows **0022** as **To do** (separate refresh task exists for 0023 — keep this task scoped to **0022** + index clarity)
- No `user_oauth_account` / `/auth/{provider}/authorize` product surface in current app (email+password login only)
- Prefer status note over implementing OAuth (out of scope for a tiny NEW)

## High-level instructions for coder

- Add a top **Status: research / deferred** banner on `docs/0022-oauth-social-login-notes.md`: not implemented; keep notes for a future product decision; do not treat as an active sprint plan.
- Optionally align `docs/README.md` index blurb to say “research notes (not shipped).”
- Do **not** implement OAuth, migrations, or login buttons in this task.
- Pass criteria: doc and index make deferred/research status obvious; no bulk rewrite of the design sections.

## Implementation notes (coder)

- Added **Status: research / deferred** banner at top of `docs/0022-oauth-social-login-notes.md` (email/password JWT remains; no OAuth product surface).
- Updated `docs/README.md` index blurbs for **0022** and **0023** so OAuth is not framed as next open item.
- Minimal status alignment on `docs/0023-prioritisation-019-022.md` (banner, table row, recommendation heading/summary) so it no longer says **To do** / “next open item” — design sections kept; no OAuth code/migrations/UI.
- No product code changes under `back/` or `front/`.

## Testing instructions

### What to verify

- `docs/0022-oauth-social-login-notes.md` opens with an obvious **research / deferred** status (not an active sprint plan).
- `docs/README.md` index describes **0022** as research notes (not shipped) and does not list OAuth as the next open item.
- `docs/0023-prioritisation-019-022.md` marks **0022** as deferred/research (not **To do**).
- No OAuth implementation was added (no new auth routes, migrations, or social login UI).

### How to test

From repo root:

```bash
# Banner present on 0022
head -n 8 docs/0022-oauth-social-login-notes.md

# Index blurbs
rg -n "0022-oauth|research notes|research/deferred" docs/README.md

# 0023 no longer queues OAuth as next open / To do
rg -n "To do|next open item|Deferred / research|research / deferred" docs/0023-prioritisation-019-022.md

# No accidental product OAuth surface from this task
rg -n "user_oauth_account|/auth/.*/authorize" back/ front/src --glob '!**/node_modules/**' || true
```

No Docker / Puppeteer run required (docs-only).

### Pass/fail criteria

- **Pass:** First screenful of **0022** says research/deferred; README + **0023** status no longer treat OAuth as active backlog; design body of **0022** unchanged in substance; no OAuth product code added.
- **Fail:** Missing banner, README still says “next open item **0022 (OAuth)**”, **0023** still rows **To do**, or any OAuth implementation landed.

## Test report

1. **Date/time (UTC):** 2026-07-26 12:49:55 – 12:50:01 UTC. Log window: N/A (docs-only; no container exercise).
2. **Environment:** branch `development` @ `5d8375a2`; local repo docs; no Docker/Puppeteer (`BASE_URL` N/A).
3. **What was tested:** Status banner on `docs/0022-oauth-social-login-notes.md`; README index blurbs for 0022/0023; deferred status in `docs/0023-prioritisation-019-022.md`; absence of OAuth product surface (`user_oauth_account`, `/auth/.../authorize`) under `back/` and `front/src`.
4. **Results:**
   - **0022 research/deferred banner** — **PASS** — `head -n 8` shows blockquote: “Status: research / deferred… do not treat this document as an active sprint plan”.
   - **README index (research notes, not next open)** — **PASS** — `docs/README.md` L105: “research notes (not shipped)”; L106: “0022 is research/deferred (not an active sprint item)”.
   - **0023 marks 0022 deferred (not To do)** — **PASS** — banner L5 “research / deferred”; table L16 “Deferred / research”; no “To do” / “next open item” matches in 0023.
   - **No OAuth product implementation** — **PASS** — `rg user_oauth_account|/auth/.*/authorize` on `back/` + `front/src` returned no matches.
5. **Overall:** **PASS**
6. **Product owner feedback:** Docs now make clear OAuth is research-only and must not be queued as sprint work. Index and prioritisation stay aligned without rewriting the design notes. Safe for agents: no false “implement OAuth next” signal from 0022/0023/README.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification; no `pos-front` / `pos-back` activity required.
