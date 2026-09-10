---
## Closing summary (TOP)

- **What happened:** Joined table group tiles stacked a full `tableTileInner` (including large QR) per member, so group cards grew very tall on the Tiles view.
- **What was done:** Group tiles now use collapsible member summary rows by default; expanding a member shows a compact `tableTileInner` (96px QR, no duplicate title) with per-table menu URL, session actions, and double-click order targeting unchanged.
- **What was tested:** Tester PASS on demo floor (group 13): compact collapsed layout, per-member expand with distinct QR URLs, double-click opens orders for the correct table, Angular rebuild clean, landing HTTP 200.
- **Why closed:** All acceptance criteria and testing instructions passed; ready for archive.
- **Closed at (UTC):** 2026-05-28 08:31
---

# Compact joined-table tile card (keep per-table QR)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/237
- **237**

## Problem / goal

Joined table groups render as `.table-card--group` with a full `tableTileInner` (including ~180px QR block) **per member**, so group tiles become very tall. Staff need a compact group card: accordion or compact member rows with smaller QR, while **each physical table still has its own QR/token**. Consider collapsing member details by default.

See `docs/0051-table-groups-mvp.md` for group semantics.

## High-level instructions for coder

- In `front/src/app/tables/tables.component.ts`, refactor the `block.kind === 'group'` branch (`.table-card--group`, `.group-tile-member`, `tableTileInner` outlet).
- Do **not** remove per-table QR/token generation — one QR per physical table must remain reachable (expand row, modal, or compact inline QR).
- Reduce vertical stacking: avoid N × full `tableTileInner` with large `.qr-section` in one group card; use accordion, collapsed summary rows, or a compact member template with smaller QR sizing.
- Default collapsed state is acceptable if PIN/status/QR remain discoverable per member.
- Align visually with single-table cards from issue **#236** where practical (shared grid/card height patterns).
- Add i18n keys for any new expand/collapse or member labels across `front/public/i18n/*.json`.
- After edits, confirm `docker logs --since 10m pos-front` shows a clean Angular build.
- **Testing:** Create or use an existing table group on a floor; verify group tile height is reasonable, each member QR still works when expanded, and double-click / session actions still target the correct table.

## Implementation notes

- `tables.component.ts`: group tiles use collapsible member summary rows (name, status, PIN when active); expanded rows render `tableTileInner` with `compact` (96px QR, no tenant header) and `hideTitle` (no duplicate name).
- `expandedTileGroupMemberKeys` tracks per-member expansion; group cards use `align-self: start` so they do not stretch to single-table height.
- i18n: `GROUP_TILE_SHOW_TABLE`, `GROUP_TILE_HIDE_TABLE`, updated `GROUP_TILE_MEMBER_HINT` in all locale files.

## Testing instructions

1. Log in as staff with table access (demo: `pos-staff-demo@amvara.de` / env password).
2. Open **Tables** → **Tiles** on a floor with a **joined table group** (create via floor plan if needed).
3. Confirm the group card is compact: member rows show name, active/inactive, and PIN when set; full QR blocks are not stacked by default.
4. Expand one member row: compact QR (96px), session actions (Activate / New PIN / Close), Open menu, and Copy link work for that table only.
5. Double-click the expanded member area: session/order flow targets that table (same as single-table tiles).
6. Expand a second member: each still shows its own QR URL (`getMenuUrl(table)` per table token).
7. Regression: `docker logs --since 10m pos-front` shows successful Angular rebuild; `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` returns `200`.

---

## Test report

1. **Date/time (UTC):** 2026-05-28 08:27–08:32 UTC. Log window: `docker logs --since 30m pos-front` (build events ~08:11 UTC; no errors at test time).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch **`development`** @ `54961675`. Staff login via `.env` demo credentials. Floor **A dentro** (group 13: Mesa 14 + Mesa 15).

3. **What was tested:** All steps in **Testing instructions** (compact group tile, per-member expand, QR/actions, double-click table targeting, distinct menu URLs, front build + landing HTTP).

4. **Results:**
   - **Login + Tables tiles on grouped floor** — **PASS** — Puppeteer; group card `.table-card--group` with 2 member summary rows (Mesa 14 / Mesa 15).
   - **Compact default (no stacked full QR)** — **PASS** — Collapsed group height ~781px, **0** visible `.qr-section`; member rows show name, active/inactive, **PIN 5670** on active Mesa 14.
   - **Expand member: compact QR + actions** — **PASS** — `.table-tile-inner--compact`, QR present, Copy link + menu actions in expanded detail.
   - **Copy link per table** — **PASS** — `http://127.0.0.1:4202/menu/670e43bb-7f5a-4124-b9f6-df8ca872f2c9` (Mesa 14) vs `http://127.0.0.1:4202/menu/4c1e2eeb-14a2-41e8-afc1-2bf37d86e5ab` (Mesa 15); matches DB tokens.
   - **Double-click targets correct table** — **PASS** — Double-click expanded Mesa 14 detail → `http://127.0.0.1:4202/staff/orders?table=634` (table id 634 = Mesa 14).
   - **Second member distinct URL** — **PASS** — See copy-link URLs above (different tokens).
   - **Front build + HTTP 200** — **PASS** — `Application bundle generation complete` for `tables-component`; `curl` → `200`.

5. **Overall:** **PASS**

6. **Product owner feedback:** Joined-table tiles no longer stack full-height QR blocks for every member; the group card stays short until a member is expanded. Each table keeps its own menu link and staff can still open orders for the correct table via double-click. Ready for closer archive.

7. **URLs tested:**
   1. `http://127.0.0.1:4202/login?tenant=1`
   2. `http://127.0.0.1:4202/tables` (Tiles, floor A dentro)
   3. `http://127.0.0.1:4202/staff/orders?table=634` (after double-click on Mesa 14 member detail)

8. **Relevant log excerpts:**

```
Application bundle generation complete. [0.815 seconds] - 2026-05-28T08:11:31.682Z
Lazy chunk files | tables-component | 225.77 kB |
Component update sent to client(s).
```

`curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` → `200`
