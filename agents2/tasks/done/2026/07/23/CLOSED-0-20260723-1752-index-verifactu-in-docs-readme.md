---
## Closing summary (TOP)

- **What happened:** Docs index missed VeriFactu feature guide `0018-verifactu-fiscal-invoicing.md` beside billing/Factura 0017.
- **What was done:** Added a Feature guides row for 0018 after 0017 and a short “see also VeriFactu 0018” cross-link on the 0017 blurb in `docs/README.md` (docs-only).
- **What was tested:** `rg` Feature guides hits for verifactu/0018, on-disk link target, and 0017 cross-link — **PASS** (2026-07-26T09:40Z).
- **Why closed:** All pass/fail criteria met; no product code; no GitHub issue (enhancement reviewer / issue 0).
- **Closed at (UTC):** 2026-07-26 09:41
---

# Index VeriFactu fiscal doc in docs/README Feature guides

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0018-verifactu-fiscal-invoicing.md`** is a living feature guide (tenant `fiscal_mode`, server issuance stubs, Factura QR/disclaimer) complementary to **`docs/0017-billing-customers-factura.md`**, but **`docs/README.md`** never lists it under Feature guides, Email, or Reference. Operators and agents following the docs index stop at 0017 and miss VeriFactu configuration and the explicit “no AEAT wire yet” disclaimer.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T17:52Z: `SIGNAL docs_stale×14` + `changelog_sparse` already owned; `demo_tables_check=ok`; Unreleased empty post-2.1.28; NEW backlog≈80
- `rg` on **`docs/README.md`**: no hits for `verifactu` / `0018-verifactu`
- File on disk: **`docs/0018-verifactu-fiscal-invoicing.md`** (complements 0017)
- Sibling **`NEW-0-20260723-0639-renumber-duplicate-doc-prefixes-0018-0024-0025`** keeps verifactu as **0018** and renumbers gmail — **do not** merge; this task is **index-only** (use the post-renumber path if that NEW lands first)
- Sibling **`NEW-0-20260723-0734-align-0017-customers-operations-nav`** owns 0017 Operations nav only — do not expand 0017 here

## High-level instructions for coder

- In **`docs/README.md` Feature guides** (near the 0017 row), add one row for **`0018-verifactu-fiscal-invoicing.md`** describing: tenant `fiscal_mode` (off/test/live), server-issued fiscal stub, Factura QR/disclaimer; **no production AEAT submission yet**
- Optional one cross-link phrase on the 0017 blurb (“see also VeriFactu 0018”) — keep to a short phrase
- Documentation index only; no product code; no bulk rewrite of 0018
- Pass/fail: `rg -n 'verifactu|0018-verifactu' docs/README.md` hits Feature guides; link resolves

## Implementation notes (coder)

- Added Feature guides row for **`0018-verifactu-fiscal-invoicing.md`** immediately after 0017.
- Short “see also VeriFactu 0018” cross-link on the 0017 blurb.
- No product code changes.

## Testing instructions

### What to verify

- **`docs/README.md`** Feature guides lists VeriFactu **0018** next to billing/Factura **0017**.
- Link path **`0018-verifactu-fiscal-invoicing.md`** resolves on disk.
- 0017 blurb mentions VeriFactu 0018 without rewriting 0017 content.

### How to test

From repo root:

```bash
rg -n 'verifactu|0018-verifactu' docs/README.md
test -f docs/0018-verifactu-fiscal-invoicing.md && echo OK
```

Optional: open `docs/README.md` Feature guides and confirm the 0018 row sits under Feature guides (not Email/Reference only).

### Pass/fail criteria

- **Pass:** `rg` hits include Feature guides rows for `0018-verifactu` / `verifactu`; file exists; no `back/` or `front/` changes required for this task.
- **Fail:** No Feature guides hit, broken relative link, or unrelated docs rewrites.

## Test report

1. **Date/time (UTC):** 2026-07-26T09:40:30Z start → 2026-07-26T09:40:33Z end. Log window: N/A (docs-only; no containers exercised).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`); local repo root; no Docker compose / no `BASE_URL` (docs index verification only).
3. **What was tested:** Feature guides indexing of VeriFactu **0018** next to billing **0017**; on-disk link target; short cross-link on 0017 blurb; no product code required.
4. **Results:**
   - Feature guides lists **0018-verifactu** immediately after **0017** — **PASS** (`docs/README.md` lines 60–61; `rg -n 'verifactu|0018-verifactu' docs/README.md` hits both rows).
   - Link path resolves — **PASS** (`test -f docs/0018-verifactu-fiscal-invoicing.md` → `FILE_OK`; file opens with VeriFactu purpose header).
   - 0017 blurb mentions VeriFactu 0018 without rewriting 0017 body — **PASS** (line 60: “See also VeriFactu [0018](0018-verifactu-fiscal-invoicing.md).”).
   - No `back/` / `front/` changes required — **PASS** (`git status` shows only `docs/README.md` modified for this work area).
5. **Overall:** **PASS**
6. **Product owner feedback:** VeriFactu is now discoverable from the docs index beside Factura billing, with an explicit “no AEAT wire yet” note in the 0018 row. Operators following Feature guides will no longer stop at 0017 alone. Docs-only change; ready to close.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — no container logs for this docs-index check. Evidence commands:

```text
$ rg -n 'verifactu|0018-verifactu' docs/README.md
60:| [0017-billing-customers-factura.md](...) | ... See also VeriFactu [0018](0018-verifactu-fiscal-invoicing.md). |
61:| [0018-verifactu-fiscal-invoicing.md](0018-verifactu-fiscal-invoicing.md) | VeriFactu-oriented fiscal invoicing: ... **no production AEAT submission yet**. |
$ test -f docs/0018-verifactu-fiscal-invoicing.md && echo FILE_OK
FILE_OK
```
