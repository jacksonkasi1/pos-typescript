---
## Closing summary (TOP)

- **What happened:** Root README Features/Access Points omitted shipped restaurant groups and a dedicated public waitlist entry.
- **What was done:** Added a Restaurant groups Features row (link to docs/0054), a Reservations waiting-list cue (link to docs/0011), and a Public waiting list Access Point URL.
- **What was tested:** Docs-only `rg` + file existence checks — all PASS (Features, Access Points, linked docs resolve).
- **Why closed:** All pass/fail criteria met; no product code changes.
- **Closed at (UTC):** 2026-07-26 05:04
---

# Add restaurant groups + waitlist to root README Features / Access Points

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Root **`README.md`** Features and Access Points still omit shipped **restaurant groups** (#283) and a dedicated **waiting list** Access Point. Waiting list appears only in later prose under Reservations; groups are absent entirely. Sibling **`NEW-0-20260722-1159-readme-delivery-courier-saas-features`** owns Delivery / courier / SaaS paywall / platform only — not these two.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T17:44Z: `SIGNAL docs_stale×14` + `changelog_sparse` owned; `demo_tables_check=ok`; NEW≈77 — docs-vs-code follow-on, not a bulk stale-doc rewrite
- Features table (~L45–58): no restaurant-groups row; Multi-tenant / Staff navigation omit groups join/Settings tab
- Access Points (~L117–130): has `/book/{tenantId}` but no `/waitlist/{tenantId}`
- Docs exist: **`docs/0054-restaurant-groups.md`**, waiting list in **`docs/0011`**
- Out of scope / do not merge: ROADMAP (**`NEW-0-20260723-1628-refresh-root-roadmap-shipped-jul-features`**), docs/README Feature guides 0011 blurb (**`NEW-0-20260723-1714-…`**), delivery/courier/paywall README (**`NEW-0-20260722-1159-…`**)

## High-level instructions for coder

- In root **`README.md` Features**, add a short **Restaurant groups** row (create/join/leave, optional shared customers/products, Settings tab) linking **`docs/0054-restaurant-groups.md`**
- Optionally extend the **Reservations** Features cell with a brief Waiting list cue (public `/waitlist/:tenantId` + staff tab) — keep one sentence; full guide stays in 0011
- In **Access Points**, add a row for public waiting list, e.g. `http://localhost:4202/waitlist/{tenantId}`
- Do **not** rework Delivery/courier/paywall rows (owned by sibling NEW); no product code
- Pass/fail: `rg -i 'restaurant group|0054|waitlist' README.md` hits Features and Access Points; links resolve

## Implementation notes (coder)

- **Status:** implemented 2026-07-26T05:03Z UTC
- Root `README.md` Features: added **Restaurant groups** row linking `docs/0054-restaurant-groups.md`; extended **Reservations** with waiting-list cue + link to `docs/0011-table-reservation-user-guide.md`
- Access Points: added **Public waiting list** → `http://localhost:4202/waitlist/{tenantId}`
- Left Delivery / courier / SaaS / platform rows untouched

## Testing instructions

### What to verify

- Root `README.md` Features table documents restaurant groups (create/join/leave, optional shared customers/products, Settings tab) with a working link to `docs/0054-restaurant-groups.md`
- Reservations Features cell mentions public `/waitlist/:tenantId` and staff waiting-list management
- Access Points includes a public waiting list URL using `{tenantId}`

### How to test

```bash
# From repo root
rg -n -i 'restaurant group|0054|waitlist' README.md
test -f docs/0054-restaurant-groups.md
test -f docs/0011-table-reservation-user-guide.md

# Optional: confirm Access Points row
rg -n 'Public waiting list|/waitlist/\{tenantId\}' README.md
```

No product code or Docker stack required (docs-only).

### Pass/fail criteria

- **Pass:** `rg` hits Features (**Restaurant groups** + waitlist under Reservations) and Access Points (**Public waiting list**); both linked doc files exist
- **Fail:** missing Features row, missing Access Points waitlist URL, or broken relative links to `docs/0054` / `docs/0011`

## Test report

1. **Date/time (UTC):** 2026-07-26 05:03:30–05:03:36 UTC. Log window: N/A (docs-only; no container exercise).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`). Docs-only verification; Docker stack up but not required (`BASE_URL` N/A).
3. **What was tested:** Root `README.md` Features row for restaurant groups + Reservations waiting-list cue; Access Points public waitlist URL; linked docs `0054` and `0011` exist.
4. **Results:**
   - Features **Restaurant groups** (create/join/leave, optional shared customers/products, Settings tab) + link to `docs/0054-restaurant-groups.md` — **PASS** (`README.md:71`; `test -f docs/0054-restaurant-groups.md`)
   - Reservations Features mentions public `/waitlist/:tenantId` and staff waiting-list tab + link to `docs/0011-…` — **PASS** (`README.md:67`; `test -f docs/0011-table-reservation-user-guide.md`)
   - Access Points **Public waiting list** → `http://localhost:4202/waitlist/{tenantId}` — **PASS** (`README.md:146`)
5. **Overall:** **PASS**
6. **Product owner feedback:** Root README now surfaces restaurant groups and the public waitlist where operators look first (Features + Access Points). Docs links resolve; Delivery/courier/paywall ownership left alone as intended.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only; no product runtime checks.
