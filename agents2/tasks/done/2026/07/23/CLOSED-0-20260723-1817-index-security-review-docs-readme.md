---
## Closing summary (TOP)

- **What happened:** Docs index lacked a link to the living security review notes.
- **What was done:** Indexed `SECURITY-REVIEW.md` under Quick links and Reference & notes in `docs/README.md` (docs-only; no product code).
- **What was tested:** `rg` confirmed both index rows and on-disk target; overall **PASS**.
- **Why closed:** All pass/fail criteria met.
- **Closed at (UTC):** 2026-07-26 17:23
---

# Index SECURITY-REVIEW.md in docs/README

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/SECURITY-REVIEW.md`** is the living structured security pass (uploads, auth, tenant isolation, public/payment surfaces). **`docs/README.md`** does not link it under Reference, Other, or Quick links, so agents and operators following the docs index miss the review notes that open SECURITY NEWs (waiting-list/groups, TenantProduct delivery) extend. Indexing closes a discoverability gap without rewriting the review.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T18:16Z: `SIGNAL docs_stale` / `changelog_sparse` already owned; `demo_tables_check=ok`; NEW backlog≈85
- `rg` on **`docs/README.md`**: no hits for `SECURITY-REVIEW`
- File on disk: **`docs/SECURITY-REVIEW.md`** (recently touched; open NEWs **1744** waitlist/groups and **1734** TenantProduct append notes here)
- Do **not** merge with those SECURITY content NEWs — this task is **index-only**

## High-level instructions for coder

- In **`docs/README.md` Reference & notes** (or Other), add one row for **`SECURITY-REVIEW.md`**: structured security pass (not a pentest); repeat after major releases
- Optional Quick links one-liner (“Security review notes”) if that table stays short
- Documentation index only; no product code; do not expand SECURITY-REVIEW body here
- Pass/fail: `rg -n 'SECURITY-REVIEW' docs/README.md` hits the new row; link resolves

## Coder notes

- Indexed **`SECURITY-REVIEW.md`** in **Reference & notes** (after `agent-cursor-rules.md`) and **Quick links** (“Security review notes”).
- Did not expand `SECURITY-REVIEW.md` body; no `back/` / `front/` changes.
- Sibling SECURITY content NEWs (waitlist/groups, TenantProduct) left untouched.

## Testing instructions

### What to verify

- `docs/README.md` links **`SECURITY-REVIEW.md`** under Reference & notes (and Quick links).
- The markdown link resolves to the on-disk file.

### How to test

```bash
# From repo root
rg -n 'SECURITY-REVIEW' docs/README.md
test -f docs/SECURITY-REVIEW.md && echo OK
```

### Pass/fail criteria

- **Pass:** `rg` hits the new Reference (and Quick links) row(s); `docs/SECURITY-REVIEW.md` exists; no product code required.
- **Fail:** `SECURITY-REVIEW` absent from `docs/README.md`, or link target missing.

## Test report

1. **Date/time (UTC):** 2026-07-26T17:23:23Z start; finished ~2026-07-26T17:24:00Z. Log window: last ~5m (`pos-front` / `pos-back`).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`); compose `docker-compose.yml` + `docker-compose.dev.yml`; stack up (`pos-back`, `pos-front`, `pos-haproxy`, `pos-postgres`, `pos-redis`). Docs-only verification — no `BASE_URL` browser run required.
3. **What was tested:** `docs/README.md` indexes `SECURITY-REVIEW.md` under Quick links and Reference & notes; on-disk target exists.
4. **Results:**
   - Quick links row for Security review notes → **PASS** — `docs/README.md:25` `| Security review notes … | [SECURITY-REVIEW.md](SECURITY-REVIEW.md) |`
   - Reference & notes row → **PASS** — `docs/README.md:109` `| [SECURITY-REVIEW.md](SECURITY-REVIEW.md) | Structured security pass … |`
   - Link target on disk → **PASS** — `test -f docs/SECURITY-REVIEW.md && echo OK` → `OK` (16205 bytes)
5. **Overall:** **PASS**
6. **Product owner feedback:** Security review notes are now discoverable from the docs index in both Quick links and Reference. Agents following `docs/README.md` will find the structured pass without hunting the filesystem. No product behaviour change; indexing only as scoped.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** Docs-only; no front compile involved. Backend healthy during window:
   ```
   INFO:     172.30.0.5:54720 - "GET /health HTTP/1.1" 200 OK
   ```
