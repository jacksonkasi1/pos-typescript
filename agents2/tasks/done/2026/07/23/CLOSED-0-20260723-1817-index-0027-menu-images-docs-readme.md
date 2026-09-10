---
## Closing summary (TOP)

- **What happened:** `docs/README.md` Deployment & operations never listed the amvara9 menu/catalog uploads-404 runbook (`0027`), so operators scanning the index after image outages could miss it.
- **What was done:** Added a Deployment & operations row for `0027-amvara9-menu-images-troubleshooting.md` and short see-also cross-links from the 0004 and 0026 blurbs; left the 0027 body to sibling 1420.
- **What was tested:** `rg` confirmed Deployment listing plus 0004/0026 see-also; on-disk `docs/0027-…` exists — overall PASS (2026-07-26 09:05 UTC).
- **Why closed:** All pass/fail criteria met; docs-index-only change complete.
- **Closed at (UTC):** 2026-07-26 09:05
---

# Index 0027 menu-images troubleshooting in docs/README

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0027-amvara9-menu-images-troubleshooting.md`** is the amvara9 ops guide for public menu / catalog `/api/uploads/…` 404s, but **`docs/README.md`** Deployment & operations never lists it. Operators scanning the index after image outages only see HAProxy/CSS/deploy docs and may re-open StaticFiles theories. Sibling **`NEW-0-20260722-1420-refresh-0027-…`** owns the status banner / verify commands — not the README index.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:16Z: `SIGNAL docs_stale×14` owned for listed basenames; **0027** is age >90d and **absent from docs/README** (`rg` no `0027` / `menu-images`)
- Related open: catalog missing-on-disk **`NEW-0-20260604-1325-…`** (product/data); this task is **index-only**
- `demo_tables_check=ok`; NEW backlog deep — one README row

## High-level instructions for coder

- In **`docs/README.md` Deployment & operations**, add one row for **`0027-amvara9-menu-images-troubleshooting.md`**: public menu/catalog image 404s on amvara9, explicit upload routes vs missing-on-disk
- Optional short cross-link from **0026** / **0004** blurbs (“see also 0027 for uploads 404”) — one phrase max
- Documentation index only; no product code; leave body refresh to **1420**
- Pass/fail: `rg -n '0027|menu-images-troubleshooting' docs/README.md` hits Deployment; link resolves

## Coder notes

- Added Deployment & operations row for **`0027-amvara9-menu-images-troubleshooting.md`** (after **0026**).
- Appended short “See also 0027 for uploads 404” on **0004** and **0026** blurbs.
- Did not change **`docs/0027-…`** body (left to sibling **1420**).
- No `back/` / `front/` changes.

## Testing instructions

### What to verify

- `docs/README.md` lists **0027** under **Deployment & operations**.
- The markdown link resolves to the on-disk runbook.
- Optional: **0004** / **0026** blurbs mention see-also **0027**.

### How to test

```bash
# From repo root
rg -n '0027|menu-images-troubleshooting' docs/README.md
test -f docs/0027-amvara9-menu-images-troubleshooting.md && echo OK
```

### Pass/fail criteria

- **Pass:** `rg` hits Deployment & operations for **0027**; `docs/0027-amvara9-menu-images-troubleshooting.md` exists; no product code required.
- **Fail:** 0027 missing from Deployment table, or link target missing.

## Test report

- **Date/time (UTC):** 2026-07-26 09:05:17 – 09:05:23 UTC (log window ~same)
- **Environment:** local repo on `development` @ `30ef0b3f`; compose `docker-compose.yml` + `docker-compose.dev.yml` (stack up; docs-only check). No `BASE_URL` / browser.
- **What was tested:** `docs/README.md` Deployment & operations lists **0027**; on-disk runbook exists; optional **0004** / **0026** see-also blurbs.

### Results

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 0027 listed under Deployment & operations | **PASS** | `docs/README.md:37` row for `0027-amvara9-menu-images-troubleshooting.md` under `## Deployment & operations` |
| Markdown link target exists | **PASS** | `test -f docs/0027-amvara9-menu-images-troubleshooting.md` → OK (4932 bytes) |
| Optional 0004 / 0026 see-also 0027 | **PASS** | `docs/README.md:34` (0004) and `:36` (0026) both “See also [0027]… for uploads 404” |

- **Overall:** **PASS**
- **Product owner feedback:** Operators scanning Deployment & operations now find the menu/catalog uploads-404 runbook next to HAProxy/deploy docs, with short cross-links from 0004 and 0026. Index-only change; no product code involved.
- **URLs tested:** N/A — no browser

### Relevant log excerpts

Docs verification only; no app regression exercised. Stack healthy at test time (`pos-back`/`pos-front` Up). Sample back access during window (unrelated):

```
INFO:     172.30.0.5:43924 - "GET /docs HTTP/1.0" 200 OK
```

`rg` excerpt:

```
34:| [0004-deployment.md](0004-deployment.md) | … See also [0027](0027-amvara9-menu-images-troubleshooting.md) for uploads 404. |
36:| [0026-haproxy-ssl-amvara9.md](0026-haproxy-ssl-amvara9.md) | … See also [0027](0027-amvara9-menu-images-troubleshooting.md) for uploads 404. |
37:| [0027-amvara9-menu-images-troubleshooting.md](0027-amvara9-menu-images-troubleshooting.md) | amvara9 public menu/catalog image 404s on `/api/uploads/…` … |
```
