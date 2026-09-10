---
## Closing summary (TOP)

- **What was done:** Fixed mobile sidebar scroll loss on staff route change — `ngOnDestroy()` no longer overwrites `sessionStorage` with scroll **0** after `closeSidebar()` already saved the position (`sidebar.component.ts`).
- **Root cause:** `closeSidebar()` → `persistNavScroll()` saved scroll **259**, then destroy-time `persistNavScroll()` clobbered with **0**.
- **What was tested:** Puppeteer `tmp/test-sidebar-nav-scroll.mjs` — desktop + mobile **PASS** (2026-05-29); front bundle **PASS**; landing `curl` **200**.
- **Loop cleanup:** Prior **WIP-215** had **435** duplicate handoff entries (~319 KB); archived here with condensed log.
- **Closed at (UTC):** 2026-05-29
---

# Preserve sidebar nav scroll on staff route change

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/215
- **215**

## Problem / goal
Staff pages embed `<app-sidebar>` inside each route component. Navigating between staff routes destroys and recreates the sidebar, resetting nav scroll. Persist and restore nav `scrollTop` across route changes (desktop and mobile).

## Implementation summary
- **`StaffLayoutService`:** `getNavScrollTop` / `setNavScrollTop` in `sessionStorage` keyed by tenant/user.
- **`SidebarComponent`:** restore on init/`NavigationEnd`; `(scroll)` + `closeSidebar()` persist; active link `scrollIntoView`.
- **Fix (2026-05-29):** `ngOnDestroy()` only persists when `nav.scrollTop > 0` so mobile drawer close does not clobber saved scroll.

## Handoff log (condensed)
- **2026-05-26 – 2026-05-29:** Handoff loop (**435** passes) until `ngOnDestroy` fix; mobile criterion **(5)** **PASS** after fix.

## Testing instructions
1. Login as admin/owner with many nav items.
2. **Desktop:** Scroll nav, navigate Settings ↔ Products — scroll persists in `sessionStorage`.
3. **Mobile (390×844):** Open menu, scroll nav, tap a route — reopen menu; scroll preserved.
4. **Build:** `docker logs --since 5m pos-front` — no TS errors.
5. **Regression:** `curl http://127.0.0.1:4202/` → **200**.

## Test report (2026-05-29)

**Environment:** `BASE_URL=http://127.0.0.1:4202`, `development`, demo login tenant 1.

| Criterion | Result |
|-----------|--------|
| Desktop scroll persistence | **PASS** — `sessionStorage` = 303 |
| Mobile menu scroll preserved | **PASS** — stored = 259, reopened `scrollTop` = 259 |
| Front build | **PASS** |
| Landing curl | **PASS** — 200 |

**Overall: PASS**

**Script:** `tmp/test-sidebar-nav-scroll.mjs`
