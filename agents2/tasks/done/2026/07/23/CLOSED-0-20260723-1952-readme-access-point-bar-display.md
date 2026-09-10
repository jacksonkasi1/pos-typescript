---
## Closing summary (TOP)

- **What happened:** Root README Access Points listed Kitchen (`/kitchen`) but omitted Bar display (`/bar`) even though Features and routes already support it.
- **What was done:** Added an Access Points row for Bar display at `http://localhost:4202/bar` with a note that it is the beverage-station view of the kitchen display; left `docs/0015` and product code untouched.
- **What was tested:** Access Points Bar row present, scope README-only (no `docs/0015` / `back/` / `front/`), optional `/bar` → 200 — **PASS**.
- **Why closed:** All pass/fail criteria met; README-only handoff with no product code risk.
- **Closed at (UTC):** 2026-07-26 03:54
---

# Add Bar display Access Point to root README

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Root **`README.md` Features** already lists **Kitchen** and **Bar** displays, and the app serves **`/bar`**, but **Access Points** only has a Kitchen row. Operators and agents copying URLs for beverage-station demos miss `/bar` and open `/kitchen` by habit.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T19:52Z: SIGNAL stale-doc basenames already owned; not a bulk `docs/*.md` rewrite
- README Access Points (~L117–130): `Kitchen display` → `/kitchen`; no `/bar`
- Features Staff navigation (~L51): “**Kitchen** and **Bar** displays”
- Route: `app.routes.ts` → `path: 'bar'` (same kitchen-display component, `view: 'bar'`)
- Sibling **`NEW-0-20260723-0716-refresh-kitchen-display-doc-delivery`** owns **`docs/0015-kitchen-display.md`** body only — do **not** merge; this task is README Access Points only

## High-level instructions for coder

- In **`README.md` Access Points**, add one row for Bar display, e.g. `http://localhost:4202/bar` (next to Kitchen)
- Optional: one-word note that it is the beverage-station view of the kitchen display — no new feature doc
- Do not edit **`docs/0015`** here (sibling owns delivery/status refresh)
- Pass/fail: `rg '/bar' README.md` hits Access Points; no product code

## Coder notes (2026-07-26)

- Renamed **NEW → WIP** on start; no same-topic WIP.
- Added Access Points row: **Bar display** → `http://localhost:4202/bar` with note that it is the beverage-station view of the kitchen display.
- Did not edit `docs/0015` or product code.

## Testing instructions

### What to verify

- Root **`README.md` Access Points** lists Bar display at `/bar` next to Kitchen.
- No product code (`back/`, `front/`) changed for this task.
- `docs/0015-kitchen-display.md` was not modified.

### How to test

```bash
# From repo root
rg -n 'Bar display|/bar' README.md
rg -n 'Access Points' -A 25 README.md | head -40
git diff --stat README.md agents2/tasks/*bar-display*
```

Optional (stack up): open `http://127.0.0.1:4202/bar` after staff login to confirm the route still matches the documented URL (existing kitchen/bar UI; no new smoke required for a README-only change).

### Pass/fail criteria

- **Pass:** `rg '/bar' README.md` hits under Access Points with a Bar display row; diff is README + this task file only (no `docs/0015`, no `back/`/`front/`).
- **Fail:** Access Points still omits `/bar`, or unrelated docs/product files were edited.

## Test report

1. **Date/time (UTC):** 2026-07-26 03:54:08 – 03:54:20 UTC. Log window: `docker logs --since 5m` on `pos-front` / `pos-back` (no errors).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `0cc5da1a`.
3. **What was tested:** README Access Points Bar display row; scope limited to README (no `docs/0015`, no `back/`/`front/`); optional `/bar` HTTP check.
4. **Results:**
   - Access Points lists Bar display at `/bar` next to Kitchen — **PASS** (`README.md` L152–153: Kitchen then Bar with `http://localhost:4202/bar`).
   - No product code changed for this task — **PASS** (`git diff` only adds the Bar row in `README.md`; no `back/`/`front/` dirty for this change).
   - `docs/0015-kitchen-display.md` not modified — **PASS** (`git status --short docs/0015-kitchen-display.md` empty).
   - Optional route still served — **PASS** (`curl` `http://127.0.0.1:4202/bar` → 200).
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators can now copy the beverage-station URL from Access Points without defaulting to `/kitchen`. The one-line note clarifies it is the same kitchen-display UI in bar mode. README-only change; safe to close.
7. **URLs tested:**
   1. http://127.0.0.1:4202/ (200)
   2. http://127.0.0.1:4202/bar (200)
8. **Relevant log excerpts:** `pos-front` / `pos-back` last 5m: no `error` / `TS*` / `exception` / `500` lines during verification. Diff evidence: `+ | **Bar display** | http://localhost:4202/bar (beverage-station view of the kitchen display) |`
