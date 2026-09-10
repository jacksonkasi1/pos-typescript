---
## Closing summary (TOP)

- **What happened:** Docs gap for shipped optional order/item comments (#284) was queued by the enhancement reviewer.
- **What was done:** Added a kitchen-display subsection for public Add comment / order notes, staff edit, and kitchen/bar highlight; short 0008 pointer; README index cue — docs-only.
- **What was tested:** Docs `rg` checks on 0015/0008/README all **PASS**; no product code changes; optional product smokes skipped.
- **Why closed:** All pass/fail criteria met (tester Overall **PASS**).
- **Closed at (UTC):** 2026-07-26 01:39
---

# Document optional order / item comments (#284)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Optional guest/staff free-text comments on order lines and the whole order shipped (#284: `Order.notes` / `OrderItem.notes`, public menu + kitchen/bar highlight). Operators and agents have **no short feature note** in `docs/` — only the closed task and code. Kitchen display docs mention generic “notes” without the public-menu “Add comment” / order-level note UX.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: docs-vs-code scan after `SIGNAL docs_stale` (stale basenames already queued)
- Shipped: `back/app/order_notes.py`; public menu cart comments; kitchen/bar highlight; `back/tests/test_order_notes.py`
- `rg` on `docs/*.md`: no dedicated “order comment” / #284 how-to; **`docs/0015-kitchen-display.md`** only says items include notes; **`NEW-0-20260722-1420-mark-0008-order-mgmt-spec-shipped`** is banner-only (do not expand into a bulk 0008 rewrite here)
- Sibling **`NEW-0-20260723-0716-refresh-kitchen-display-doc-delivery`** is delivery-channel only — do not merge

## High-level instructions for coder

- Add a short subsection (or status callout) to **`docs/0015-kitchen-display.md`** (and optionally one paragraph under Feature guides / **`docs/0008`** banner area only) describing:
  - Public menu: per-item **Add comment** + optional order-level note (optional, never blocks checkout; ~500 char cap)
  - Staff edit of the same `notes` fields
  - Kitchen/bar: comments shown highlighted / full text
- One-line index tweak in **`docs/README.md`** if kitchen/order docs are listed without this cue
- Do **not** re-implement product code; no bulk rewrite of 0008
- Pass/fail: a reader can find how comments work and where they appear without opening CLOSED-284

## Implementation notes

- Added **Order and item comments (#284)** to `docs/0015-kitchen-display.md` (public menu, staff `/orders`, kitchen/bar highlight, 500-char cap, smoke pointer).
- Pointer paragraph under the title of `docs/0008-order-management-logic.md` (no banner rewrite; sibling NEW still owns shipped-status banner).
- `docs/README.md` kitchen-display index row now mentions `/bar` and highlighted comments (#284).
- No product code changes.

## Testing instructions

### What to verify

- Docs describe optional order/item comments (#284): where guests enter them, that they are optional (~500 char), staff edit path, and kitchen/bar highlight — without opening CLOSED-284.
- Index in `docs/README.md` cues comments on the kitchen-display guide.
- No product/runtime regressions required (docs-only).

### How to test

From repo root:

```bash
rg -n 'Order and item comments|#284|ADD_COMMENT|order-comments' docs/0015-kitchen-display.md docs/0008-order-management-logic.md docs/README.md
```

Optional (existing product smoke; not required for this docs handoff):

```bash
# Backend note helpers
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back python3 -m pytest tests/test_order_notes.py -q

# Puppeteer (needs LOGIN_EMAIL / LOGIN_PASSWORD or DEMO_LOGIN_*)
cd front && BASE_URL=http://127.0.0.1:4202 npm run test:order-comments
```

### Pass/fail criteria

- **PASS:** `docs/0015-kitchen-display.md` has a dedicated comments subsection covering public **Add comment**, order-level note, staff edit, kitchen/bar highlight + 500-char cap; `docs/0008-order-management-logic.md` has a short pointer (not a bulk rewrite); `docs/README.md` kitchen row mentions comments / #284; `rg` hits as above.
- **FAIL:** Comments still only mentioned as generic “notes” on kitchen cards, or 0008 was bulk-rewritten / product code changed.

## Test report

1. **Date/time (UTC):** 2026-07-26 01:38:43 – 01:38:51 UTC. Log window: N/A (docs-only; no runtime verification required).
2. **Environment:** branch `development` @ `ca217a15`; compose `docker-compose.yml` + `docker-compose.dev.yml` (stack up: pos-back/front/haproxy/postgres/redis/ws-bridge). `BASE_URL` unused.
3. **What was tested:** Docs for optional order/item comments (#284) — public Add comment + order-level note, optional ~500-char cap, staff `/orders` edit, kitchen/bar highlight; `docs/README.md` kitchen index cue; no bulk 0008 rewrite / no product code.
4. **Results:**
   - Dedicated subsection in `docs/0015-kitchen-display.md` covering public **Add comment**, order-level note, staff edit, kitchen/bar highlight + 500-char cap — **PASS** (`## Order and item comments (#284)` at L21; table L25–29; 500-char / never blocks checkout L23).
   - Short pointer in `docs/0008-order-management-logic.md` (not bulk rewrite) — **PASS** (2-line pointer under title; `git diff --stat` +2 lines only on 1434-line file).
   - `docs/README.md` kitchen row cues comments / #284 and `/bar` — **PASS** (index row L50).
   - `rg` hits on the three docs — **PASS** (`Order and item comments`, `#284`, `order-comments` / `test:order-comments` present).
   - No product/runtime code changed for this handoff — **PASS** (`git diff --name-only -- back/ front/` empty for this tree; docs-only +15/−1).
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators can now find how optional order and item comments work from the kitchen-display guide without opening CLOSED-284. The 0008 pointer and README index cue make the feature discoverable from the main docs map. Optional product smokes (`test_order_notes.py` / `test:order-comments`) were not required for this docs handoff and were skipped.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification; no container log evidence required.

