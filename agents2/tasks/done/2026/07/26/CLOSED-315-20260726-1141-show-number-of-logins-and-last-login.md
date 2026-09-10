---
## Closing summary (TOP)

- **What happened:** Platform operators needed clear all-time login count and last-login time on `/platform`.
- **What was done:** Extended `GET /platform/metrics` with `logins_total` and `last_login_at`, added matching dashboard metric cards and i18n, and updated platform portal docs plus the Puppeteer smoke.
- **What was tested:** Local stack verification passed — UI cards, Recent logins consistency, API fields, and `test-platform-operator.mjs` all PASS.
- **Why closed:** All criteria passed.
- **Closed at (UTC):** 2026-07-26 11:47
---

# Show number of logins & last login (platform)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/315
- **315**

## Problem / goal

On the **platform operator** dashboard (`/platform`, production: https://satisfecho.de/platform/), operators should clearly see **how many logins** have occurred and **when the last login** was.

**Context (do not reinvent blindly):** Docs and code already describe SaaS login metrics via `login_event` and `GET /platform/metrics` — see **`docs/0059-platform-operator-portal.md`**. Local UI (`platform-dashboard.component.ts`) already shows logins last 24h / 7d and a **Recent logins** table. Confirm what is still missing vs the issue ask (e.g. prod lag, unclear UX, all-time count, or **per-tenant** login count / last login on the tenant list or detail).

## High-level instructions for coder

- Read **`docs/0059-platform-operator-portal.md`** and inspect current `/platform` (local + https://satisfecho.de/platform/ with a platform operator account).
- Compare the issue ask to what already ships:
  - Aggregate counts (`logins_last_24_hours`, `logins_last_7_days`)
  - Recent login rows (`recent_logins` / last login time)
  - Tenant list/detail (today: no per-tenant last-login / login-count columns)
- If production already matches the product intent, verify + document and move to UNTESTED with testing instructions (no unnecessary schema work).
- If a gap remains, prefer the **smallest** change that makes “number of logins” and “last login” obvious on `/platform`:
  - Prefer extending existing `LoginEvent` + `/platform/metrics` (and/or tenant list/detail payloads) over a parallel audit store.
  - Preserve tenant isolation and platform-operator auth; do not expose unnecessary PII beyond what the portal already shows.
  - Keep i18n keys in sync across `front/public/i18n/*.json` for any new UI strings.
- After UI/API changes: check `pos-front` build logs; smoke `/platform` (login → dashboard shows counts and last/recent login). Append **Testing instructions** when done.

## Implementation notes (coder)

Gap vs issue ask: 24h/7d + recent table existed, but **total login count** and a dedicated **last login** timestamp were not shown as top-level metrics.

Changes:
- **API** `GET /platform/metrics`: added `logins_total` and `last_login_at` (from existing `login_event`; no schema migration).
- **UI** `/platform`: metric cards for Logins (total) and Last login (plus existing 24h/7d).
- **i18n**: `PLATFORM_DASHBOARD.LOGINS_TOTAL` / `LAST_LOGIN` in all locales.
- **Docs**: `docs/0059-platform-operator-portal.md` updated.
- **Smoke**: `front/scripts/test-platform-operator.mjs` asserts `data-metric` cards for total/last/24h/7d.

## Testing instructions

1. Ensure stack is up (`docker compose -f docker-compose.yml -f docker-compose.dev.yml ps`) and a platform operator exists:
   `docker compose exec -e PLATFORM_OPERATOR_EMAIL=… -e PLATFORM_OPERATOR_PASSWORD=… back python -m app.seeds.ensure_platform_operator`
2. Open `http://127.0.0.1:4202/platform/login`, sign in with platform operator credentials.
3. On `/platform`, confirm metric cards include:
   - **Logins (total)** — non-negative integer
   - **Last login** — locale-formatted datetime (or “No login events…” if empty)
   - Existing **Logins (24 hours)** / **Logins (7 days)**
4. Confirm **Recent logins** table still lists recent events; first row time should match **Last login**.
5. Automated smoke (from repo root, with env set):
   ```bash
   export PLATFORM_OPERATOR_EMAIL=… PLATFORM_OPERATOR_PASSWORD=…
   BASE_URL=http://127.0.0.1:4202 node front/scripts/test-platform-operator.mjs
   ```
   Expect: `OK: login metrics visible (total, last, 24h, 7d)` and tenant detail delivery link OK.
6. Optional API check (cookie session after `POST /api/token?scope=platform`): `GET /api/platform/metrics` includes `logins_total` and `last_login_at`.

## Test report

- **Date/time (UTC):** 2026-07-26T11:45:49Z start → 2026-07-26T11:46:20Z end
- **Log window:** `docker logs --since 20m` for `pos-front` / `pos-back`
- **Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development`; `HEADLESS=1`
- **What was tested:** Platform operator login metrics — total logins, last login, 24h/7d cards, Recent logins consistency, Puppeteer smoke, `GET /api/platform/metrics` fields

### Results

1. **Stack + platform operator** — **PASS** — compose services Up; `ensure_platform_operator` updated operator; landing HTTP 200 on `:4202`
2. **UI metric cards (total / last / 24h / 7d)** — **PASS** — `test-platform-operator.mjs`: `OK: login metrics visible (total, last, 24h, 7d)` (`data-metric` logins_total, last_login, logins_24h, logins_7d)
3. **Recent logins vs Last login** — **PASS** — API `last_login_at` == first `recent_logins[].logged_in_at` (`2026-07-26T11:46:15.329395Z`); `logins_total=156`
4. **Automated smoke** — **PASS** — `BASE_URL=http://127.0.0.1:4202 node front/scripts/test-platform-operator.mjs` → login/dashboard OK + metrics OK + tenant delivery link OK
5. **API `GET /platform/metrics`** — **PASS** — response includes `logins_total`, `last_login_at`, `logins_last_24_hours`, `logins_last_7_days` (session cookie after `POST /api/token?scope=platform`)
6. **Front build** — **PASS** — `Application bundle generation complete` in window; no TS/NG build failures (only existing NG8107 warnings)

### Overall: **PASS**

### Product owner feedback

Operators on `/platform` now see all-time login count and a dedicated last-login timestamp beside the existing 24h/7d cards, which matches the issue ask without a new audit store. The Puppeteer smoke locks the UI contract via `data-metric` attributes. Production (`satisfecho.de`) was out of scope for this local verification; promote when ready so prod operators get the same cards.

### URLs tested

1. http://127.0.0.1:4202/
2. http://127.0.0.1:4202/platform/login
3. http://127.0.0.1:4202/platform
4. http://127.0.0.1:4202/delivery/3722 (tenant detail delivery link from smoke)
5. http://127.0.0.1:4202/api/token?scope=platform
6. http://127.0.0.1:4202/api/platform/metrics

### Relevant log excerpts

```
pos-back: POST /token?scope=platform HTTP/1.1" 200 OK
pos-back: GET /platform/metrics HTTP/1.1" 200 OK
pos-front: Application bundle generation complete. [0.501 seconds]
test-platform-operator.mjs: OK: login metrics visible (total, last, 24h, 7d)
```
