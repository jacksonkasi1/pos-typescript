---
## Closing summary (TOP)

- **What happened:** Inventory item forms and tables showed terse “Reorder” / “Reorder Qty” copy that staff found unclear; the work was a copy-only i18n refresh across all locales.
- **What was done:** Updated `INVENTORY.ITEMS.REORDER`, `REORDER_LEVEL`, and `REORDER_QTY` in all nine `front/public/i18n/*.json` files with clearer hospitality wording (e.g. EN “Minimum stock” / “Usual order quantity”; ES “Stock mínimo” / “Cantidad habitual al pedir” per issue #220).
- **What was tested:** Tester PASS — JSON validity for nine locales, staff Inventory → Items and Stock dashboard in EN/ES/DE, front bundle build clean on `http://127.0.0.1:4202`.
- **Why closed:** All acceptance criteria met; test report overall **PASS**; no backend or follow-up scope.
- **Closed at (UTC):** 2026-05-27 08:39
---

# Friendlier reorder labels in inventory items

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/220
- **220**

## Problem / goal

Inventory item forms and tables use terse English keys **REORDER**, **REORDER_LEVEL**, and **REORDER_QTY** (`INVENTORY.ITEMS.*` in i18n). Staff find labels like “Reorder Level” unclear. Replace copy in **all** locale files with friendlier, domain-appropriate wording (form labels and table headers). Spanish example from the issue: **Stock mínimo** / **Cantidad habitual al pedir** for the level/qty fields; align other languages with the same intent (minimum stock vs habitual order quantity), not literal “reorder” jargon.

## High-level instructions for coder

- Update **`INVENTORY.ITEMS.REORDER`**, **`INVENTORY.ITEMS.REORDER_LEVEL`**, and **`INVENTORY.ITEMS.REORDER_QTY`** in **every** `front/public/i18n/*.json` file (nine locales: en, es, de, fr, ca, bg, hi, ur, zh-CN).
- Keys are used in **`inventory-items.component.ts`** (table header + form labels) and **`stock-dashboard.component.ts`** (labels/headers); no template key renames unless product asks—only translation values.
- **English:** use clear hospitality/inventory phrasing (e.g. minimum stock threshold, usual order quantity)—avoid cryptic “Reorder Qty”.
- **Spanish:** follow issue guidance (**Stock mínimo**, **Cantidad habitual al pedir** or equivalent for the three strings as appropriate).
- Keep JSON valid; run front build / smoke (`npm run test:landing-version` or inventory UI spot-check) after edits.
- **Out of scope:** backend fields, reorder logic, or new features—copy-only change.

## Implementation notes

Updated `INVENTORY.ITEMS.REORDER`, `REORDER_LEVEL`, and `REORDER_QTY` in all nine locale files under `front/public/i18n/`. English examples: “Minimum stock”, “Minimum stock level”, “Usual order quantity”. Spanish per issue: “Stock mínimo”, “Cantidad habitual al pedir”. No TS/template changes.

## Testing instructions

1. Log in as staff with inventory access (tenant with items).
2. Open **Inventory → Items** (`/inventory/items`). Confirm table column formerly “Reorder” shows friendlier label (e.g. EN: “Minimum stock”; ES: “Stock mínimo”). Open add/edit item modal: form labels for minimum stock and usual order quantity match locale (no “Reorder Qty” / “Nivel de Reorden” in ES).
3. Open **Inventory → Stock dashboard**. Low-stock alert stat and stock table header use the new labels.
4. Switch UI language (e.g. ES, DE) and repeat steps 2–3.
5. Optional: `python3 -c "import json; json.load(open('front/public/i18n/en.json'))"` for each locale; `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` should return 200. `npm run test:landing-version` may fail on unrelated landing semver vs `package.json` mismatch—ignore for this copy-only task unless version is synced.

---

## Test report

1. **Date/time (UTC):** 2026-05-27T08:35:20Z – 2026-05-27T08:37:58Z. Log window: same interval (`pos-front`, `pos-back`).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).

3. **What was tested:** i18n JSON validity (9 locales); staff login; Inventory → Items table header + add-item modal labels; Inventory → Stock dashboard labels; language switch EN → ES → DE per testing instructions.

4. **Results:**
   - **JSON parse all 9 locale files:** PASS — `python3 json.load` on en, es, de, fr, ca, bg, hi, ur, zh-CN.
   - **HTTP /** : PASS — `curl` returned 200.
   - **EN `/inventory/items` column + modal:** PASS — table `<th>` “Minimum stock”; modal “Minimum stock level”, “Usual order quantity”; no “Reorder Qty” / “Reorder Level”.
   - **EN `/inventory/stock`:** PASS — body contains “Minimum stock” / “Minimum stock level” (case-insensitive).
   - **ES items + stock:** PASS — “Stock mínimo”, “Cantidad habitual al pedir” in modal; no “Nivel de Reorden”.
   - **DE items + stock:** PASS — “Meldebestand” in headers/dashboard.
   - **Front build:** PASS — `pos-front` logs show “Application bundle generation complete” with no TS errors in window.

5. **Overall:** **PASS**

6. **Product owner feedback:** Copy-only change delivers clearer hospitality wording (“Minimum stock”, “Usual order quantity”) without touching backend or keys. Spanish matches issue guidance. Safe to ship on next `development` promotion; no production-only verification required.

7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/inventory/items (EN, ES, DE)
   3. http://127.0.0.1:4202/inventory/stock (EN, ES, DE)

8. **Relevant log excerpts**

`pos-front` (build OK):
```
Application bundle generation complete. [0.007 seconds] - 2026-05-27T08:32:07.560Z
chunk-WDRDZNK3.js   | inventory-items-component    |  78.19 kB |
```

`pos-back` (inventory API during browser test):
```
GET /inventory/items?active_only=false HTTP/1.1" 200 OK
GET /inventory/stock-levels HTTP/1.1" 200 OK
GET /inventory/low-stock HTTP/1.1" 200 OK
```

**Evidence command:** `HEADLESS=1 BASE_URL=http://127.0.0.1:4202 node tmp/test-issue-220-reorder-labels.mjs` (Puppeteer; demo credentials from repo `.env`).
