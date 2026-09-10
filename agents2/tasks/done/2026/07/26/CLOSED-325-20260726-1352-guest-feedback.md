---
## Closing summary (TOP)

- **What happened:** Guest feedback enhancement (#325) shipped staff analytics trends and CSV export on top of the existing public/staff feedback flow.
- **What was done:** Added tenant-scoped summary/export APIs and a `/guest-feedback` trends panel (lookback, histogram, daily volume, Export CSV); documented in `docs/0064-guest-feedback-analytics.md`.
- **What was tested:** pytest `test_guest_feedback.py` (12 passed), staff Puppeteer `test:guest-feedback-staff` PASS, public `/feedback/1` 200, docs skim — overall PASS.
- **Why closed:** All acceptance criteria for the MVP vertical passed; NPS/email-SMS left as follow-ups.
- **Closed at (UTC):** 2026-07-26 17:04
---

# Enhance guest feedback (survey + staff analytics)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/325
- **325**

## Problem / goal

Baseline guest feedback already ships (`/feedback/:tenantId`, star rating, Google review deep-link; staff `/guest-feedback`). This issue extends that flow — not a rebuild — with richer surveys and staff-facing analytics (umbrella **#52** / `docs/0050-github-issue-52-split-plan.md` Issue 6; roadmap `docs/0032-github-issues-roadmap.md`). Google reviews remain deep-link only (no review-posting API).

## High-level instructions for coder

- Pick **one** MVP vertical beyond the baseline (prefer staff trend dashboard and/or CSV export over boiling the ocean). Optional NPS template and post-reservation email/SMS link are follow-ups if the first slice is thin.
- Extend existing public + staff feedback surfaces and APIs; respect rate limits in `docs/0020-rate-limiting-production.md` and branding on `/feedback/:tenantId` (`docs/0028-tenant-public-branding.md`).
- Receipt QR → feedback depends on the printing bridge — stub or document the link format if printing is not ready; do not block the whole MVP on hardware.
- Keep Google as deep-link only; do not attempt automated review submission.
- Cover with tests / existing Puppeteer smokes where useful (`test:guest-feedback-staff`, `test:feedback-public-i18n` in `docs/testing.md`); `CHANGELOG.md`; append **Testing instructions**.
- Tenant-scoped; no secrets or live guest PII in fixtures.

## Implementation notes (coder)

**MVP vertical shipped:** staff trends + CSV export (not NPS / email-SMS).

- **API:** `GET /tenant/guest-feedback/summary?days=` and `GET /tenant/guest-feedback/export` (`reservation:read`, admin rate limit).
- **UI:** `/guest-feedback` trends panel (30/90/365 lookback), star histogram, daily volume strip, Export CSV.
- **Docs:** `docs/0064-guest-feedback-analytics.md` (includes receipt QR URL format); updates to 0011, 0020, README, CHANGELOG, testing.md.
- **Follow-ups (out of scope):** NPS templates, post-reservation email/SMS, printer hardware embedding the QR.

## Testing instructions

1. **Backend unit tests** (Docker):
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back \
     python3 -m pytest tests/test_guest_feedback.py -q
   ```
   Expect all tests green (includes summary aggregates + CSV tenant isolation).

2. **Staff Puppeteer smoke** (app on 4202, demo/staff credentials):
   ```bash
   BASE_URL=http://127.0.0.1:4202 HEADLESS=1 \
     LOGIN_EMAIL=… LOGIN_PASSWORD=… \
     npm run test:guest-feedback-staff --prefix front
   ```
   Expect: list + summary GET 200, analytics panel, Export CSV button, no raw `FEEDBACK.*` keys.

3. **Manual spot-check (optional):**
   - Open `/guest-feedback` → Trends shows counts; switch 30/90/365.
   - Click **Export CSV** → file downloads with header `id,created_at,rating,…`.
   - Confirm other tenants’ feedback does not appear (pytest covers this).
   - Public `/feedback/:tenantId` still works (unchanged branding); Google remains a thank-you deep link only.

4. **Docs:** Skim `docs/0064-guest-feedback-analytics.md` for API + QR URL format.

## Test report

1. **Date/time (UTC):** 2026-07-26T17:03:07Z → 2026-07-26T17:03:41Z (log window ~17:03–17:04 UTC).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced before start).
3. **What was tested:** pytest `test_guest_feedback.py` (summary aggregates + CSV tenant isolation); staff Puppeteer `test:guest-feedback-staff`; docs skim `docs/0064-guest-feedback-analytics.md` (API + receipt QR URL format); public `/feedback/1` HTTP 200.
4. **Results:**
   - Backend unit tests: **PASS** — `12 passed` in 1.45s (`tests/test_guest_feedback.py -q`).
   - Staff Puppeteer smoke: **PASS** — list GET 200, summary GET 200, analytics panel OK, Export CSV button OK, feedback table visible; `>>> RESULT: Staff guest-feedback smoke OK`.
   - Docs (0064 API + QR format): **PASS** — documents `GET /tenant/guest-feedback/summary` and `/export`; receipt QR formats `{origin}/feedback/{tenantId}` and `?token=…`; indexed in `docs/README.md` Feature guides.
   - Public feedback still up: **PASS** — `GET http://127.0.0.1:4202/feedback/1` → 200 (spot-check; branding/Google deep-link unchanged per MVP notes).
   - Front build: **PASS** — no TS/NG compile errors in `pos-front` logs for the window.
5. **Overall:** **PASS**
6. **Product owner feedback:** Staff trends + CSV export MVP for guest feedback is solid and tenant-safe. Analytics panel and export control show up correctly on `/guest-feedback`; public feedback route remains available. NPS / post-reservation messaging correctly left as follow-ups.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login (via Puppeteer)
   2. http://127.0.0.1:4202/dashboard
   3. http://127.0.0.1:4202/guest-feedback
   4. http://127.0.0.1:4202/feedback/1
   5. http://127.0.0.1:4202/ (landing HTTP check)
8. **Relevant log excerpts (last section):**
```
............ [100%] 12 passed, 1 warning in 1.45s
INFO: … "GET /tenant/guest-feedback?limit=200 HTTP/1.1" 200 OK
INFO: … "GET /tenant/guest-feedback/summary?days=90 HTTP/1.1" 200 OK
   List GET OK: 200
   Summary GET OK: 200
   Analytics panel OK
   Export CSV button OK
>>> RESULT: Staff guest-feedback smoke OK
```
