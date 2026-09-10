# Relocate Organization Name below Version Info

## GitHub Issues

- **Issue:** https://github.com/satisfecho/pos/issues/197
- **197**

## Problem / goal

The organization name does not fit well beside the main “POS” title. Move it to its own line **below** the version line (version + commit hash), keep visual hierarchy clear, and preserve long-name safety (ellipsis / overflow).

## High-level instructions for coder

- Revert the `.logo` span content to display only **POS** (no org name in that span).
- Add a dedicated element (e.g. `div`/`span`) **below** the `.version` block inside the logo/header area for the organization name (see issue for suggested structure).
- Style that org row: smaller than version text (e.g. ~11px or slightly below version size), muted color, optional max-width with `text-overflow: ellipsis` and `overflow: hidden` for very long names.
- Touch only the landing/header components and styles involved (follow existing patterns from the recent organization-name work if present in history/docs).

## Implementation summary

- **`front/src/app/shared/sidebar.component.ts`:** `.logo` shows **POS** only; `.sidebar-org-name` after `.version` when `tenantOrgName()` is set; mobile header uses `.mobile-brand` with **POS** + optional `.header-org-name`.
- **`front/src/app/shared/sidebar.component.scss`:** Styles for `.sidebar-org-name`, `.mobile-brand`, `.header-org-name`; `.logo-container` carries `title`/`aria-label` via `brandTitle()` for full branding.

## Testing instructions

1. **Manual (staff):** Log in with a tenant that has **Settings → Organization name** set.
2. **Desktop sidebar:** Order from top to bottom: **POS** (primary color, large); **version** + monospace **commit**; **organization name** (smallest, muted). Very long names should truncate with ellipsis; browser tooltip (`title`) should show the full organization name.
3. **Mobile / narrow viewport:** Top bar shows **POS**, then organization name on the next line (smaller, muted), without crowding the single-line `POS (org)` layout.
4. **Automated smoke:** From `front/` with app on HAProxy dev port (e.g. `4202`):  
   `SKIP_LANDING_PACKAGE_VERSION_CHECK=1 BASE_URL=http://127.0.0.1:4202 npm run test:landing-version`  
   With `LOGIN_EMAIL`/`LOGIN_PASSWORD` or `DEMO_LOGIN_*` in `.env`, the script exercises post-login sidebar navigation.

---

## Test report

1. **Date/time (UTC) and log window:** 2026-04-27 ~08:29–08:31 UTC; Docker `pos-front` logs reviewed for ~30 minutes ending 08:31 UTC.

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).

3. **What was tested:** Items 1–4 under **Testing instructions** (staff login with org name, desktop sidebar order/hierarchy/ellipsis/`title`, mobile header layout, automated `test:landing-version`). Additional DOM checks: desktop `.logo-container` child order and font sizes; mobile `.mobile-brand` POS vs org vertical order (390×844 viewport).

4. **Results:**
   - **Staff login + tenant org name visible:** **PASS** — Logged in via `.env` demo credentials; `.sidebar-org-name` present with non-empty text after login.
   - **Desktop sidebar order (POS → version+commit → org):** **PASS** — `.logo` text is `POS` only; DOM order `logo` → `version` → `sidebar-org-name`; org font (10px) smaller than version line (11px); `title` on org matches full name for tooltip.
   - **Long-name safety (ellipsis + title):** **PASS** — Org span has overflow/ellipsis-related computed styles (`overflow: hidden`, `text-overflow` not clip-only path via evaluation).
   - **Mobile narrow viewport:** **PASS** — `.header-title` is `POS`; `.header-org-name` present with `top` below title row.
   - **Automated smoke `test:landing-version`:** **PASS** — Exit code 0; landing version visible; login + all sidebar nav links + inventory sublinks completed.

5. **Overall:** **PASS**

6. **Product owner feedback:** Organization branding now reads clearly under the version line without crowding the main **POS** title. Desktop and mobile both keep a sensible hierarchy and long names remain accessible via the native tooltip. No regressions observed in the navigation smoke run.

7. **URLs tested (full URLs):**
   1. `http://127.0.0.1:4202/`
   2. `http://127.0.0.1:4202/login?tenant=1`
   3. `http://127.0.0.1:4202/dashboard` (and sidebar-driven routes from the automated script: `/my-shift`, `/staff/orders`, `/reservations`, `/guest-feedback`, `/tables`, `/kitchen`, `/bar`, `/customers`, `/products`, `/catalog`, `/reports`, `/working-plan`, `/users`, `/contracts`, `/settings`, plus inventory `/inventory/items`, `/inventory/suppliers`, `/inventory/purchase-orders`, `/inventory/stock`, `/inventory/reports`)

8. **Relevant log excerpts (last section):**

```
# pos-front (build health, UTC)
Application bundle generation complete. [2.531 seconds] - 2026-04-27T08:25:43.451Z
Application bundle generation complete. [1.903 seconds] - 2026-04-27T08:25:45.357Z
```

**Supplementary evidence (DOM verification script, desktop + mobile):** `.logoText` `"POS"`, `orderTop` `["logo","version","sidebar-org-name"]`, `verSize` `"11px"`, `orgSize` `"10px"`, mobile `orgBelowTitle` true.
