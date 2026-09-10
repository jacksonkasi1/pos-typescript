---
## Closing summary (TOP)

- **What happened:** `docs/SECURITY-REVIEW.md` omitted public waiting-list signup (PII + rate limit) and restaurant groups (join codes + share flags) from public/boundary notes.
- **What was done:** Documented both surfaces in §4, linked rate-limit and related docs (`0011`, `0020`, `0054`), and added a 2026-07-23 Change log delta; docs only.
- **What was tested:** Doc `rg` for waiting-list / restaurant-groups / `join_code` / related links / Change log — overall PASS.
- **Why closed:** All pass/fail criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-26 03:19
---

# SECURITY-REVIEW delta: public waiting list + restaurant groups

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Two shipped multi-tenant surfaces are missing from **`docs/SECURITY-REVIEW.md`** public / boundary notes: anonymous **waiting list** signup (PII + rate limit) and **restaurant groups** (join codes + optional shared products/customers). Re-audits after Delivery/paywall deltas can miss these controls.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T17:44Z: `SIGNAL changelog_sparse` post-2.1.28 (false positive owned); docs-vs-code scan
- `rg` on **`docs/SECURITY-REVIEW.md`**: no hits for waiting list / restaurant group / join code
- Public waitlist: `POST /public/tenants/{tenant_id}/waiting-list` — name, E.164 phone, party size; **`RATE_LIMIT_WAITING_LIST_PER_HOUR`** (default 10/hour/IP); stores client IP/UA (`main.py` ~L1409+)
- Groups: owner/admin `/restaurant-group` create/join/leave; join by `join_code`; optional `share_products` / `share_customers` — see **`docs/0054`**, tests `back/tests/test_restaurant_groups.py`
- Sibling **`NEW-0-20260723-1734-security-review-tenantproduct-delivery-ids`** owns #304 TenantProduct wording only — do **not** merge

## High-level instructions for coder

- In **`docs/SECURITY-REVIEW.md`** § Public surfaces (or Multi-tenant IDOR), add two short rows:
  - **Public waiting list** — unauthenticated create; tenant-scoped; PII (name/phone); rate limit + pointer to **`docs/0020-rate-limiting-production.md`** / **`docs/0011`**; no public token page
  - **Restaurant groups** — join codes are capability secrets for the group; share flags expand product/customer visibility across member tenants; owner/admin only; pointer to **`docs/0054`** and `test_restaurant_groups.py`
- Append a History / delta line dated 2026-07-23 for this pass
- Documentation only; no product code; do not reopen #304 delivery row beyond a cross-link if useful
- Pass/fail: `rg -n 'waiting.list|restaurant.group|join_code' docs/SECURITY-REVIEW.md` hits the new notes

## Coder notes (2026-07-26)

- Updated **`docs/SECURITY-REVIEW.md`** §4 table with **Public waiting list** and **Restaurant groups** rows; rate-limiting row mentions the waiting-list bucket; Related docs + Change log delta 2026-07-23.
- No product code changes.

## Testing instructions

### What to verify

- `docs/SECURITY-REVIEW.md` documents public waiting-list create (PII, rate limit, no public token page) and restaurant groups (`join_code` capability secret, share flags, owner/admin).
- Change log has a 2026-07-23 delta for this pass.
- Related docs link `docs/0011`, `docs/0020` (waiting-list bucket), and `docs/0054`.

### How to test

From repo root:

```bash
rg -n 'waiting.list|restaurant.group|join_code' docs/SECURITY-REVIEW.md
rg -n 'Public waiting list|Restaurant groups|RATE_LIMIT_WAITING_LIST' docs/SECURITY-REVIEW.md
rg -n '0054-restaurant-groups|0011-table-reservation' docs/SECURITY-REVIEW.md
```

Optional skim: open §4 and Change log in `docs/SECURITY-REVIEW.md` and confirm the two new rows plus the 2026-07-23 history line.

### Pass/fail criteria

- **Pass:** `rg` hits include both new table rows (waiting list + restaurant groups / `join_code`), rate-limit mention, related-doc links, and a Change log line for this delta.
- **Fail:** Missing either surface, or no Change log entry for the waiting-list / groups pass.

## Test report

1. **Date/time (UTC):** 2026-07-26T03:19:07Z start → 2026-07-26T03:19:08Z end. Log window: N/A (docs-only `rg` verification; no container exercise).
2. **Environment:** branch `development` @ `7d5a45b4`; local workspace; no Docker/Puppeteer required by Testing instructions.
3. **What was tested:** `docs/SECURITY-REVIEW.md` §4 rows for public waiting list + restaurant groups; rate-limit / Related docs links (`0011`, `0020`, `0054`); Change log delta 2026-07-23 for this pass.
4. **Results:**
   - Public waiting list row (PII, `RATE_LIMIT_WAITING_LIST_PER_HOUR`, no public token page, `docs/0011` / `docs/0020`) — **PASS** — L73 §4 table.
   - Restaurant groups row (`join_code` capability secret, share flags, owner/admin, `docs/0054`, `test_restaurant_groups.py`) — **PASS** — L76 §4 table.
   - Rate-limit waiting-list bucket mention — **PASS** — L73 + L79 (`RATE_LIMIT_WAITING_LIST_PER_HOUR`).
   - Related docs `0011` / `0020` / `0054` — **PASS** — L125–L129 (+ inline in §4 rows).
   - Change log 2026-07-23 waiting-list / groups delta — **PASS** — L143.
5. **Overall:** **PASS**
6. **Product owner feedback:** Security review now calls out the anonymous waitlist PII/rate-limit surface and restaurant-group join-code/share-flag boundaries, so re-audits after Delivery deltas should not skip them. Docs-only change; no runtime regression risk. Ready for closer archive.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A — verification was `rg` against `docs/SECURITY-REVIEW.md` only (hits at L73, L76, L79, L125–L129, L143).
