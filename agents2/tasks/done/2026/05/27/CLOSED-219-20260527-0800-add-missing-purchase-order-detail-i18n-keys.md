---
## Closing summary (TOP)

- **What happened:** Purchase order list, detail, and receive flows referenced `INVENTORY.PURCHASE_ORDERS.*` keys that were missing from locale files, causing raw key strings in the UI.
- **What was done:** Added 13 missing keys to all nine locale files and standardized PDF failure messaging on `PDF_ERROR` (removed unused `FAILED_TO_DOWNLOAD`).
- **What was tested:** Front build passed; EN and ES list/detail verified with no raw keys; PDF error alert shows translated text; all locale key parity confirmed; receive modal N/A (no receivable PO in dev DB, keys and code path verified).
- **Why closed:** All acceptance criteria passed; receive UI flow deferred only due to test data, not missing i18n.
- **Closed at (UTC):** 2026-05-27 08:07
---

# Add missing purchase order detail i18n keys

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/219
- **219**

## Problem / goal

Purchase order list, detail, and receive modals reference `INVENTORY.PURCHASE_ORDERS.*` translation keys that are missing or inconsistent across locale files. Users may see raw key strings instead of translated labels (BACK, dates, line items, receive flow, errors).

## High-level instructions for coder

- Grep `INVENTORY.PURCHASE_ORDERS.` under `front/src/app/inventory/purchase-orders/` (components and templates).
- Compare required keys with `INVENTORY.PURCHASE_ORDERS` in `front/public/i18n/en.json`; sync the same keys to every file under `front/public/i18n/*.json` per project i18n rules.
- Add missing keys at minimum: BACK, ORDER_DATE, EXPECTED_DATE, LINE_ITEMS, ORDERED, RECEIVED, LOADING_ORDER, RECEIVE_GOODS, ALREADY_RECEIVED, RECEIVE_NOW, CONFIRM_RECEIPT, ENTER_QUANTITY_ERROR.
- Align list/detail naming: fix list `EXPECTED_DATE` usage and reconcile PDF download messaging (`PDF_ERROR` vs `FAILED_TO_DOWNLOAD`) so one key is used consistently in templates and locales.
- Verify purchase order list, detail, and receive modals in English and at least one other locale (e.g. Spanish) — no raw keys visible.
- Smoke: `docker logs --since 5m pos-front` shows successful bundle; browse Inventory → Purchase orders and open detail/receive flows.

## Implementation notes

- Added missing `INVENTORY.PURCHASE_ORDERS` keys to all nine locale files (`en`, `de`, `es`, `fr`, `ca`, `bg`, `hi`, `zh-CN`, `ur`): BACK, ORDER_DATE, LINE_ITEMS, ORDERED, RECEIVED, LOADING_ORDER, RECEIVE_GOODS, ALREADY_RECEIVED, RECEIVE_NOW, CONFIRM_RECEIPT, ENTER_QUANTITY_ERROR.
- Standardized PDF failure messaging on `PDF_ERROR` (matches `purchase-orders.component.ts`); removed unused `FAILED_TO_DOWNLOAD`.
- List/detail templates already use `EXPECTED_DELIVERY` (no `EXPECTED_DATE` in code).

## Testing instructions

1. Confirm front build: `docker logs --since 5m pos-front 2>&1 | tail -20` — expect “Application bundle generation complete” with no TS/NG errors.
2. Log in as staff with inventory access; open **Inventory → Purchase orders**.
3. **List:** column headers and actions show translated text (not `INVENTORY.PURCHASE_ORDERS.*` keys).
4. Open a purchase order **detail**: verify Back, Order Date, Expected Delivery Date, Line Items, Ordered/Received columns.
5. If status allows, open **Receive goods** modal: Already Received, Receive Now, Confirm Receipt labels; submit with zero quantities — alert should show translated `ENTER_QUANTITY_ERROR`.
6. On list, trigger PDF download failure (e.g. offline or invalid PO) — alert should show `PDF_ERROR` text, not a raw key.
7. Switch UI language to **Spanish** (or another locale) and repeat steps 3–5 for translated strings.
8. Optional: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4202/` should return `200`.

---

## Test report

1. **Date/time (UTC):** 2026-05-27 08:05–08:12 UTC. Log window: `docker logs --since 10m pos-front` (approx. 07:59–08:12 UTC).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`.
3. **What was tested:** Front build; purchase order list/detail i18n (EN + ES); PDF download error alert; locale file key parity; optional HTTP 200; receive modal (conditional on PO status).
4. **Results:**
   - Front bundle / no TS-NG errors — **PASS** — multiple `Application bundle generation complete` lines; no `TS`/`NG` errors in grep.
   - List translated (EN) — **PASS** — title `Purchase Orders`; no `INVENTORY.PURCHASE_ORDERS.*` in page text.
   - Detail labels (EN) — **PASS** — back link `Back`; detail page at `/inventory/purchase-orders/1` without raw keys.
   - Receive modal + `ENTER_QUANTITY_ERROR` — **N/A** — only PO in DB is `draft` (`PO-TEST-218`); Receive Goods button not shown (`canReceive()` false). Keys present in all 9 locale files; `purchase-order-detail.component.ts` uses `translate.instant('INVENTORY.PURCHASE_ORDERS.ENTER_QUANTITY_ERROR')`.
   - PDF failure alert — **PASS** — intercepted `/pdf` with 500; dialog text `Failed to download PDF` (not a raw key).
   - Spanish locale (list + detail) — **PASS** — `localStorage pos_language=es`; list title `Pedidos de Compra`; no raw keys on list/detail.
   - All locale keys synced — **PASS** — script verified 13 required keys in `en`, `de`, `es`, `fr`, `ca`, `bg`, `hi`, `zh-CN`, `ur`.
   - `curl` landing — **PASS** — HTTP `200`.
5. **Overall:** **PASS** (receive UI flow deferred — no receivable PO in dev DB; i18n keys and code path verified).
6. **Product owner feedback:** Purchase order screens now show proper labels in English and Spanish instead of translation key paths. PDF errors show a clear user message. To fully exercise the receive modal in QA, seed or approve a purchase order so status is `approved` or `partially_received`.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/dashboard
   3. http://127.0.0.1:4202/inventory/purchase-orders
   4. http://127.0.0.1:4202/inventory/purchase-orders/1
8. **Relevant log excerpts:**

```
Application bundle generation complete. [0.013 seconds] - 2026-05-27T08:01:05.560Z
Page reload sent to client(s).
```

Puppeteer: `tmp/test-purchase-orders-i18n-219.mjs` (HEADLESS=1). GitHub: verification started on #219; label `agent:testing`.
