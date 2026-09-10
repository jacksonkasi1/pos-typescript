---
## Closing summary (TOP)

- **What happened:** Staff lost in-progress form data when data-entry modals closed on accidental backdrop clicks across inventory, settings, orders, and similar flows.
- **What was done:** Removed overlay `(click)="close…"` handlers from data-entry modals app-wide (inventory items/POs, settings providers, order edit, reservations, menu, etc.) so only Cancel, X, and submit close them; kept backdrop dismiss on lightweight confirmation dialogs (shared confirmation, delete confirms, orders confirm). Optional dirty-form discard prompt deferred as follow-up.
- **What was tested:** Puppeteer on `http://127.0.0.1:4202` — inventory new item/adjust stock backdrop ignored, settings add provider, orders edit #708, delete confirm still dismisses on backdrop, X closes; front bundle clean — **PASS** (tester report 2026-05-27 13:18–13:23 UTC).
- **Why closed:** All acceptance criteria and test report **PASS**; issue #227 fully delivered (dirty-form prompt documented as non-blocking follow-up).
- **Closed at (UTC):** 2026-05-27 13:25
---

# Stop closing form modals on outside click

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/227
- **227**

## Problem / goal

Staff lose in-progress form data when a modal closes from an accidental backdrop click. Data-entry modals (inventory, settings, orders, and similar) should close only via explicit actions: **Cancel**, **X**, or successful **submit**. Simple yes/no confirmation dialogs may still allow backdrop dismiss. Optionally prompt **“Discard unsaved changes?”** when closing a dirty form.

## High-level instructions for coder

- **Audit modals:** Find templates using `modal-overlay` with `(click)="close…"` (inventory items/POs, settings, orders, products, etc.) and any `MatDialog` / CDK dialogs used for data entry.
- **Backdrop:** Remove or guard overlay click handlers on data-entry modals so clicks on the overlay do not close the dialog; keep `(click)="$event.stopPropagation()"` on the modal panel where already used.
- **Explicit close only:** Ensure Cancel, X, and submit paths still call the existing close/save logic.
- **Confirmations:** Leave backdrop dismiss enabled only for lightweight confirm/cancel prompts (delete confirm, discard OK/Cancel) — document which dialogs keep dismiss.
- **Dirty forms (optional):** If feasible without large scope, intercept close when the form is dirty and show a discard confirmation; otherwise note as follow-up in the task or issue comment.
- **Consistency:** Apply the same rule across inventory, settings, and order-related modals called out in the issue; avoid one-off behavior per screen unless technically required.
- **i18n:** Add translation keys only for new user-visible strings (e.g. discard prompt).
- **Verify:** Manual pass on inventory create/edit modals and at least one settings and one orders modal; `docker logs --since 5m pos-front` shows successful bundle generation; no regressions to intentional confirm dialogs.

## Implementation summary

Removed `(click)="close…"` from the backdrop overlay on all data-entry modals. Cancel, X, and submit buttons unchanged. No `MatDialog` usage found in the codebase.

**Backdrop dismiss still enabled (confirmation / lightweight prompts):**
- `shared/confirmation-modal.component.ts` (reused e.g. tables group-safety confirm)
- Inventory items delete confirm
- Inventory suppliers delete confirm
- Customers delete confirm
- Products delete confirm
- Orders generic confirm modal (`closeConfirmModal`)

**Backdrop dismiss removed (data entry):**
- Inventory: items create/edit, stock adjust; purchase orders create; PO receive
- Orders: edit order, factura, mark-as-paid
- Settings: add/edit provider, add product to provider; contract templates
- Reports: work session adjust
- Users, staff contracts, catalog add, customers edit, suppliers edit
- Reservations create/edit and seat modal; working plan modals; tables reassign-before-delete
- Menu: name, product questions, PIN, payment options, Stripe checkout

**Follow-up:** Dirty-form “Discard unsaved changes?” prompt not implemented (would need per-form dirty tracking); deferred to a future task.

## Testing instructions

1. **Build:** `docker logs --since 5m pos-front 2>&1 | tail -20` — expect “Application bundle generation complete” with no TS errors.
2. **Inventory (staff login):** Open `/inventory/items` → New item → type in SKU/name → click outside overlay → modal stays open. Close via Cancel or X. Repeat for Adjust stock modal. Open delete confirm → click outside → modal closes (backdrop dismiss still works).
3. **Settings:** Settings → Providers → Add provider → click backdrop → modal stays; Cancel closes.
4. **Orders:** Orders → Edit an open order → change quantity → click backdrop → modal stays; X closes.
5. **Confirm regression:** Trigger any delete confirm (e.g. inventory item delete) → backdrop click still dismisses.

## Test report

1. **Date/time (UTC):** 2026-05-27T13:18:41Z – 2026-05-27T13:23:30Z (log window for `pos-front`: ~13:14–13:23 UTC).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`, `BASE_URL=http://127.0.0.1:4202`, branch `development` @ `54961675`, tenant 1 (`ralf@roeber.de`).
3. **What was tested:** Front build health; inventory new item + adjust stock + delete confirm; settings add provider; staff order edit (#708); explicit X close on new-item modal.
4. **Results:**
   - **Build / no TS errors:** **PASS** — `Application bundle generation complete` in `pos-front` logs; no `TS*` or build failures in window.
   - **Inventory new item — backdrop ignored:** **PASS** — Puppeteer: modal stayed open after synthetic overlay click; SKU typed first.
   - **Inventory new item — X closes:** **PASS** — modal hidden after `.form-header .icon-btn` click.
   - **Inventory adjust stock — backdrop ignored:** **PASS** — modal stayed open after overlay click.
   - **Settings add provider — backdrop ignored:** **PASS** — `[data-testid="settings-add-provider-btn"]` modal stayed open.
   - **Orders edit — backdrop ignored:** **PASS** — `/staff/orders`, order `#708`, edit modal stayed open after overlay click.
   - **Delete confirm — backdrop dismisses:** **PASS** — inventory delete modal closed after overlay click (`visible before=true after=false`).
5. **Overall:** **PASS**
6. **Product owner feedback:** Accidental backdrop clicks no longer discard in-progress inventory, settings, or order edits; lightweight delete confirms still dismiss on outside click as expected. Optional dirty-form discard prompt remains a follow-up and does not block this change.
7. **URLs tested:**
   1. http://127.0.0.1:4202/login?tenant=1
   2. http://127.0.0.1:4202/dashboard
   3. http://127.0.0.1:4202/inventory/items
   4. http://127.0.0.1:4202/settings
   5. http://127.0.0.1:4202/staff/orders
8. **Relevant log excerpts:**

```
Application bundle generation complete. [0.785 seconds] - 2026-05-27T13:14:55.892Z
Application bundle generation complete. [0.924 seconds] - 2026-05-27T13:15:08.077Z
(no TS errors or "Application bundle generation failed" in window)
```

**Automation:** `tmp/test-modal-backdrop-227.mjs` (HEADLESS=1, ORDER_ID=708) — all six checks exited 0.
