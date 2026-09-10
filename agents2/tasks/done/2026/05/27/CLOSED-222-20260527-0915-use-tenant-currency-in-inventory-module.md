---
## Closing summary (TOP)

- **What happened:** Inventory screens hardcoded `$` formatting and embedded currency symbols in i18n, so tenants with EUR or other `currency_code` values saw wrong symbols and awkward purchase-order labels.
- **What was done:** `InventoryService` loads tenant settings once and formats amounts with `Intl.NumberFormat` and locale helpers (aligned with Products); `INVENTORY.PURCHASE_ORDERS.UNIT_COST` neutralized across i18n files; purchase-order line-item grid widened with `white-space: nowrap` on labels.
- **What was tested:** Tester **PASS** — EUR tenant (Cobalto) on items, stock, PO list/create modal, and reports; neutral “Unit Cost” label and € totals; EN→DE locale switch; `Application bundle generation complete` with no TS errors (Puppeteer `tmp/test-inventory-currency-222.mjs`).
- **Why closed:** All acceptance criteria met; test report overall **PASS**.
- **Closed at (UTC):** 2026-05-27 09:23
---

# Use tenant currency in inventory module

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/222
- **222**

## Problem / goal

Inventory screens hardcode **$** formatting and embed currency symbols in i18n (e.g. `INVENTORY.PURCHASE_ORDERS.UNIT_COST`: "Unit Cost ($)" in EN, "Coût unitaire (€)" in FR). Tenants using EUR or other `currency_code` values see wrong symbols. Purchase-order line-item form labels also wrap awkwardly because of long unit-cost column text.

Align inventory with the products module: resolve tenant `currency_code` from settings and format amounts with `Intl.NumberFormat` + locale helpers; keep translation strings currency-neutral.

## High-level instructions for coder

- **`front/src/app/inventory/inventory.service.ts`:** Replace `formatCurrency(cents, currencySymbol = '$')` manual string concat with tenant-aware formatting. Follow **`products.component.ts`** (`loadTenantSettingsThenProducts`, `currencySymbolFromIsoCode`, `intlLocaleFromTranslate`) and **`front/src/app/shared/currency-symbol.ts`**.
- **Tenant settings:** Inject/load tenant settings in inventory components **or** centralize currency code/symbol in `InventoryService` (single load, shared by items, POs, stock dashboard, reports). Avoid per-row API calls.
- **Components using `formatCurrency`:** `inventory-items`, `purchase-orders`, `purchase-order-detail`, `stock-dashboard`, `inventory-reports` — verify all displayed money values use the updated helper after tenant load.
- **i18n:** Change `INVENTORY.PURCHASE_ORDERS.UNIT_COST` in **all** `front/public/i18n/*.json` to neutral text (no `$`, `€`, or parentheses with symbols). Show the symbol dynamically next to formatted amounts where needed.
- **Layout:** In `purchase-orders.component.scss`, adjust `.item-row` grid (e.g. wider unit-cost column or `white-space: nowrap` on labels) so neutral labels do not wrap badly on typical viewports.
- **Verify:** Staff inventory pages show correct symbol for tenant currency (test EUR tenant if available); `docker logs pos-front` → `Application bundle generation complete`; spot-check PO create/edit line-item row labels.
- **Out of scope:** Backend currency conversion, multi-currency per line item, or changes outside inventory module formatting/i18n.

## Implementation notes

- **`InventoryService`:** Loads tenant settings once in constructor; `formatCurrency` uses `Intl.NumberFormat` with `currency_code` and `intlLocaleFromTranslate`, with fallback symbol from `currencySymbolFromIsoCode` / legacy `settings.currency`. Subscribes to `onLangChange` for locale updates.
- **Components:** No changes required — all inventory money display already delegates to `inventoryService.formatCurrency`.
- **i18n:** `INVENTORY.PURCHASE_ORDERS.UNIT_COST` neutralized in en, de, es, fr, ca, hi, zh-CN, ur (bg was already neutral).
- **Layout:** `purchase-orders.component.scss` — wider unit-cost column (`minmax(110px, 1.2fr)`), `white-space: nowrap` on row labels.

## Testing instructions

1. Log in as staff for a tenant with **EUR** (or non-USD) `currency_code` in Settings → Payment.
2. Open **Inventory** → Items, Stock dashboard, Purchase orders (list + create modal line items), Inventory reports (valuation / transactions).
3. Confirm all monetary values show the tenant symbol (e.g. `€12.34` or locale-appropriate formatting), not hardcoded `$`.
4. Create/edit a purchase order: **Unit Cost** label should be short (no `$`/`€` in label); line totals and order total use tenant formatting; labels on the item row should not wrap awkwardly on desktop width.
5. Switch UI language (e.g. EN → DE) and confirm amounts still format with correct currency and locale.
6. `docker logs --since 5m pos-front 2>&1 | grep -iE 'error|Application bundle generation'` — expect **Application bundle generation complete** with no TS errors.
7. Optional: repeat with a USD tenant to confirm `$` appears via Intl, not i18n strings.

---

## Test report

1. **Date/time (UTC):** 2026-05-27 09:19–09:22 UTC. Log window: `docker logs --since 15m pos-front` (build events ~09:17 UTC).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; **`BASE_URL`** `http://127.0.0.1:4202`; branch **`development`** @ **`54961675`** (synced via `./scripts/git-sync-development.sh`). Credentials: repo **`.env`** `DEMO_LOGIN_*` (tenant **1** Cobalto, **`currency_code` EUR** per DB).

3. **What was tested:** EUR formatting on inventory items, stock dashboard, purchase orders list, inventory reports; PO create modal line-item labels and order total; EN → DE locale switch; front bundle build.

4. **Results:**
   - **EUR tenant — monetary values use € / Intl (not hardcoded `$`):** **PASS** — Puppeteer visited items, stock, PO list, reports; no `$`-only amounts without `€`; DE sample **`24,50 €`** on items page.
   - **PO create modal — neutral “Unit Cost” label, € totals, nowrap labels:** **PASS** — after **Create PO** + **Add Item**: labels `Name`, `Quantity`, `Unit`, **`Unit Cost`**, `Total` (no `$`/`€` in label text); all labels `white-space: nowrap`; **Order Total:€0.00**.
   - **Language switch (EN → DE) — currency + locale:** **PASS** — `localStorage` `pos_language=de`, reload; EUR amounts remain (German decimal comma).
   - **Build (`Application bundle generation complete`, no TS errors):** **PASS** — `Application bundle generation complete. [0.617 seconds] - 2026-05-27T09:17:07.771Z` (no `error TS` / failed generation in window).
   - **Optional USD tenant:** **N/A** — not required for acceptance; tenant 1 EUR covers primary criteria.

5. **Overall:** **PASS**

6. **Product owner feedback:** Inventory money now follows the tenant’s payment currency like Products, so EUR restaurants no longer see misleading `$` amounts or currency baked into form labels. Purchase-order line rows stay readable with short “Unit Cost” text and proper € formatting on totals.

7. **URLs tested:**
   1. `http://127.0.0.1:4202/login?tenant=1`
   2. `http://127.0.0.1:4202/dashboard`
   3. `http://127.0.0.1:4202/inventory/items`
   4. `http://127.0.0.1:4202/inventory/stock`
   5. `http://127.0.0.1:4202/inventory/purchase-orders` (list + create modal)
   6. `http://127.0.0.1:4202/inventory/reports`

8. **Relevant log excerpts:**
   ```
   Application bundle generation complete. [0.617 seconds] - 2026-05-27T09:17:07.771Z
   Application bundle generation complete. [0.400 seconds] - 2026-05-27T09:17:11.570Z
   ```
   Puppeteer: `PASS: issue #222 inventory currency checks` (`tmp/test-inventory-currency-222.mjs`, headless Chrome).
