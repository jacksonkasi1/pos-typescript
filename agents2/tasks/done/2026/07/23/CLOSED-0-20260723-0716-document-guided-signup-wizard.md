---
## Closing summary (TOP)

- **What happened:** Enhancement-reviewer docs task to document the guided restaurant signup wizard against the SaaS paywall flow.
- **What was done:** Added a Guided restaurant signup wizard section to `docs/0052-saas-signup-paywall.md` (steps 0–4, finish destinations, 402-exempt priming, 0015 link) and tweaked the `docs/README.md` 0052 blurb; no product code changes.
- **What was tested:** Docs verification (steps, exempt paths, 0015 link, README blurb) plus optional Puppeteer `test:guided-signup-wizard` — overall **PASS**.
- **Why closed:** All pass/fail criteria met; tester handed off as CLOSED.
- **Closed at (UTC):** 2026-07-26 03:28
---

# Document guided restaurant signup wizard

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Guided restaurant signup (`/register`, `/signup` onboarding priming) shipped with the SaaS paywall work, but there is **no** short operator/contributor guide for the wizard steps. **`docs/0052-saas-signup-paywall.md`** covers trial/subscribe after priming; root **`README.md`** (owned by sibling NEW) and **`docs/README.md`** do not describe the multi-step signup UX. Agents and new operators may miss how priming relates to paywall and platform billing.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: changelog/docs SIGNAL lines already queued; scanning recent shipped UX without docs
- **0052** mentions “guided signup priming (`/register` / `/signup`)” only in passing; no step list, routes, or “what gets created”
- No `agents2/tasks/NEW-*` / `FEAT-*` owns a signup-wizard doc (paywall smoke CLOSED; README delivery/saas NEW does not cover wizard steps)
- Related: do **not** expand **WIP-304** or paywall product scope

## High-level instructions for coder

- Add a **short** section to **`docs/0052-saas-signup-paywall.md`** (preferred) **or** a small new `docs/005x-…` only if 0052 would become confusing — cover:
  - Guest/operator path: landing → `/register` / `/signup` priming → tenant created → `/paywall` when enabled vs dashboard when paywall off
  - What priming APIs/routes are exempt from the 402 middleware (pointer to existing 0052 exempt list)
  - Link to **`docs/0015-platform-operator-portal.md`** (or **0055** if renumbered) for platform oversight
- Index the section in **`docs/README.md`** only if the 0052 blurb needs a “includes signup wizard” tweak (one line)
- Do **not** rewrite root README here (**`NEW-0-20260722-1159-readme-delivery-courier-saas-features`** owns that); optional one cross-link from 0052 is enough
- Pass/fail: a reader can follow register → paywall/dashboard from the doc; no product code changes

## Coder notes (2026-07-26)

- Added **Guided restaurant signup wizard** to `docs/0052-saas-signup-paywall.md`: steps 0–4, APIs (`POST /register`, `/onboarding/starter-products`, `/products/*`), finish → `/paywall` vs `/dashboard`, 402-exempt priming table, link to `docs/0015-platform-operator-portal.md`, smoke pointers.
- Tweaked `docs/README.md` 0052 blurb to mention guided `/register`/`/signup` wizard.
- No product code changes; root README left alone (sibling task owns Features/Access Points).

## Testing instructions

### What to verify
- `docs/0052-saas-signup-paywall.md` has a short guided-signup section a reader can follow from landing → register → priming → paywall/dashboard.
- Exempt priming paths and platform-operator cross-link are present.
- `docs/README.md` 0052 index blurb mentions the wizard.

### How to test
```bash
# From repo root
rg -n 'Guided restaurant signup wizard|/register|/onboarding|0015-platform-operator' docs/0052-saas-signup-paywall.md
rg -n 'guided `/register`|0052-saas-signup-paywall' docs/README.md
test -f docs/0015-platform-operator-portal.md

# Optional (docs-only; no code change required): wizard UI smoke if stack is up
# BASE_URL=http://127.0.0.1:4202 npm run test:guided-signup-wizard --prefix front
```

### Pass/fail criteria
- **Pass:** Section documents steps 0–4, paywall-on vs off finish destinations, 402-exempt priming paths, and links to 0015; docs/README blurb mentions the wizard; links resolve.
- **Fail:** Missing step list / finish destinations, no exempt-path pointer, broken 0015 link, or product code changed without need.

## Test report

1. **Date/time (UTC):** 2026-07-26 03:27:32 start → 03:28:00 end. Log window: `docker logs --since 10m` on `pos-front` / `pos-back` (no error/TS/500 lines in window).
2. **Environment:** Local Docker via HAProxy `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced). Docs-only verification + optional Puppeteer wizard smoke (`HEADLESS=1`).
3. **What was tested:** Guided-signup section in `docs/0052-saas-signup-paywall.md` (steps 0–4, finish destinations, 402-exempt priming, 0015 link); `docs/README.md` 0052 blurb; link target exists; no product-code requirement; optional UI smoke on `/register`.
4. **Results:**
   - Steps 0–4 + paywall-on `/paywall` vs paywall-off `/dashboard` documented — **PASS** (`docs/0052` § Guided restaurant signup wizard table rows 0–4; finish CTA line).
   - 402-exempt priming paths present — **PASS** (`### Priming vs 402 middleware` table: `/register`, `/token`, `/onboarding`, `/products`, `/users/me`, `/saas`).
   - Platform-operator cross-link — **PASS** (relative `[0015-platform-operator-portal.md](0015-platform-operator-portal.md)`; `test -f docs/0015-platform-operator-portal.md` → EXISTS).
   - `docs/README.md` 0052 blurb mentions wizard — **PASS** (`Includes guided `/register`/`/signup` wizard steps and 402-exempt priming paths`).
   - No unnecessary product code changes — **PASS** (task scope is docs; `git status` shows only `docs/0052` + `docs/README.md` for this work).
   - Optional wizard UI smoke — **PASS** (`npm run test:guided-signup-wizard` → RESULT OK, no tenant created).
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators and agents can now follow landing → register priming → paywall or dashboard from 0052 without digging into code. The 402-exempt table and 0015 link close the gap between signup UX and platform billing oversight. README index correctly advertises the wizard.
7. **URLs tested:**
   1. `http://127.0.0.1:4202/` (HTTP 200)
   2. `http://127.0.0.1:4202/register` (wizard step 0 → step 1 → Back)
8. **Relevant log excerpts:** Front/back `--since 10m` had no `error`/`TS*`/`500` matches. Puppeteer: `>>> RESULT: Guided signup wizard step 0 → step 1 → Back OK (no tenant created).`
