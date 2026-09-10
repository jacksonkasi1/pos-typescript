---
## Closing summary (TOP)

- **What happened:** Guided `/register` wizard lacked a durable Puppeteer smoke beyond explanation-only `test:register-page`.
- **What was done:** Added `front/scripts/test-guided-signup-wizard.mjs`, npm alias `test:guided-signup-wizard`, and indexed it in `docs/testing.md` (non-destructive: step 0 → step 1 → Back; no tenant create).
- **What was tested:** Local HAProxy `BASE_URL=http://127.0.0.1:4202` — smoke exit 0; `/` and `/register` HTTP 200; alias/docs present; no registration POST — **PASS**.
- **Why closed:** All pass/fail criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-25 22:07
---

# Add Puppeteer smoke for guided restaurant signup wizard

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Guided restaurant signup (`/register` multi-step priming → tenant created) shipped (#286), but existing **`test:register-page`** only asserts the “Who is this for?” explanation and does **not** walk wizard steps. Agents and ops have no durable smoke for the onboarding path that feeds SaaS paywall priming. Sibling doc NEW covers prose only.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T17:52Z: `SIGNAL docs_stale` / changelog owned; recent Jul smokes queued for waiting-list / groups / order-comments — **no** guided-signup smoke
- `front/scripts/test-register-page.mjs` header: explanation-only; `test:register` / `test:register-page` indexed in **`docs/testing.md`** but neither covers multi-step wizard
- Product: guided signup + paywall docs (**`docs/0052`**); doc task **`NEW-0-20260723-0716-document-guided-signup-wizard`** (do **not** merge — this task is smoke + testing index only)
- Out of scope: paywall subscribe UI (**`test:paywall`** already exists); root README / ROADMAP siblings

## High-level instructions for coder

- Add **`front/scripts/test-guided-signup-wizard.mjs`** (or similar) using existing Puppeteer helpers (`puppeteer-headless.mjs`, `BASE_URL`)
- Prefer a **minimal, non-destructive** path: open `/register` → assert step-0 intro / “Get started” → advance into account/restaurant basics fields visible (Back/Next). Avoid creating a real tenant on shared demo/prod unless the script already uses disposable emails / cleanup; prefer local HAProxy and document any `REGISTER_*` env
- Add `test:guided-signup-wizard` (name flexible) to **`front/package.json`** and a short row in **`docs/testing.md`**
- Do **not** rewrite **0052** (owned by sibling doc NEW); link smoke from that doc only if it already exists when this lands
- Pass/fail: `npm run test:guided-signup-wizard --prefix front` exits 0 against local HAProxy; script listed in `docs/testing.md`

## Implementation notes (coder)

- Added `front/scripts/test-guided-signup-wizard.mjs`: step 0 intro → Get started → account fields (tenant/address/phone/email/password) + Back/Next → Back to intro. No form submit / no tenant create.
- npm alias `test:guided-signup-wizard` in `front/package.json`; indexed in `docs/testing.md` (§6 Register + npm scripts table + Staff auth summary).
- Verified locally: `BASE_URL=http://127.0.0.1:4202 npm run test:guided-signup-wizard --prefix front` exit 0.

## Testing instructions

### What to verify

- Guided `/register` wizard smoke exists, is non-destructive, and is discoverable via npm + `docs/testing.md`.

### How to test

```bash
# App via HAProxy (dev)
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4202/

BASE_URL=http://127.0.0.1:4202 npm run test:guided-signup-wizard --prefix front

# Index / alias
rg -n 'test:guided-signup-wizard|test-guided-signup-wizard' front/package.json docs/testing.md
```

Optional visible browser: `HEADLESS=0 BASE_URL=http://127.0.0.1:4202 node front/scripts/test-guided-signup-wizard.mjs`

### Pass/fail criteria

- Pass: smoke exits **0**; console shows step 0 → step 1 fields + Back/Next → Back to intro; **no** tenant created; `test:guided-signup-wizard` listed in `front/package.json` and `docs/testing.md`.
- Fail: missing intro/Get started, missing account fields or wizard nav, pageerror, HTTP ≥400 on `/register`, or alias/docs missing.

## Test report

1. **Date/time (UTC):** 2026-07-25T22:06:33Z start → 2026-07-25T22:06:40Z end. Log window: ~22:05–22:07 UTC.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced). `HEADLESS=1`.
3. **What was tested:** Guided `/register` wizard smoke exists, is non-destructive (no submit / no tenant create), and is discoverable via `npm run test:guided-signup-wizard` + `docs/testing.md`.
4. **Results:**
   - App responds on HAProxy (`/` HTTP 200; `/register` HTTP 200) — **PASS**
   - Smoke exits 0; step 0 intro (lead + 3 bullets + Get started) → step 1 fields (tenant/address/phone/email/password) + Back/Next → Back to intro — **PASS** (console: `>>> RESULT: Guided signup wizard step 0 → step 1 → Back OK (no tenant created).`)
   - No tenant create — **PASS** (script never submits; no POST register in back logs for the window)
   - Alias in `front/package.json` — **PASS** (`test:guided-signup-wizard` → `scripts/test-guided-signup-wizard.mjs`)
   - Indexed in `docs/testing.md` — **PASS** (§6 Register, npm scripts table line 468, Staff auth summary)
5. **Overall:** **PASS**
6. **Product owner feedback:** The guided signup path now has a durable, non-destructive smoke that agents can run before touching onboarding. Ops can discover it from `docs/testing.md` without relying on the explanation-only `test:register-page`. No production deploy was required for this verification.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/`
   2. `http://127.0.0.1:4202/register`
8. **Relevant log excerpts:**
   - Smoke: `Fields: tenant/address/phone/email/password = OK` / `Back: OK | Next: OK` / `>>> RESULT: … (no tenant created).` exit 0
   - HAProxy: `GET /register HTTP/1.1` → 200 at 22:06:36–37 UTC
   - Front: only pre-existing NG8107 optional-chain warnings; no build failure during window
   - Back: no registration POST / tenant create in the test window
