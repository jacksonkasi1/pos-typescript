---
## Closing summary (TOP)

- **What happened:** `docs/0026-haproxy-ssl-amvara9.md` pointed production SSL bind at `haproxy.cfg` instead of the prod mount `haproxy.prod.cfg`.
- **What was done:** Updated §3 and the Summary table so SSL `bind *:443` is attributed to `haproxy.prod.cfg`, with an explicit local/dev vs prod/amvara9 config split aligned to `haproxy/README.md` and `docker-compose.prod.yml`.
- **What was tested:** Docs-only `rg`/`git` checks — SSL bind narrative and repo truth both PASS; no product code or unrelated docs changed.
- **Why closed:** All pass criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-26 03:10
---

# Fix docs/0026 to reference haproxy.prod.cfg

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0026-haproxy-ssl-amvara9.md`** tells operators that production SSL bind lives in **`haproxy/haproxy.cfg`**, but local/dev uses `haproxy.cfg` (no HTTPS) and production mounts **`haproxy.prod.cfg`**. Wrong filename sends ops/agents to the wrong file when restoring certs or debugging 443.

## Evidence (008 preflight / review)

- `stale_doc path=docs/0026-haproxy-ssl-amvara9.md age_days=126`
- `SIGNAL docs_stale count=14` — **edit 0026 only**; no bulk docs rewrite
- Doc §3 and summary table say **`haproxy.cfg`** for `bind *:443 ssl crt /etc/haproxy/certs`
- Repo truth: SSL bind is in **`haproxy/haproxy.prod.cfg`**; `haproxy/README.md` already documents the split; `haproxy.cfg` is HTTP-only for docker-compose.dev

## High-level instructions for coder

- In **`docs/0026-haproxy-ssl-amvara9.md`**, replace incorrect **`haproxy.cfg`** references for the SSL bind with **`haproxy.prod.cfg`**
- Add one sentence clarifying: **dev** = `haproxy.cfg` (no certs); **prod/amvara9** = `haproxy.prod.cfg` + cert mount
- Cross-check against `haproxy/README.md` and `docker-compose.prod.yml` volume/config — do not invent new deploy steps
- Pass criteria: searching 0026 for SSL bind points only at `haproxy.prod.cfg`; no other stale docs edited

## Coder notes (2026-07-26)

- Updated **`docs/0026-haproxy-ssl-amvara9.md`** §3 and Summary table: SSL `bind *:443` is documented on **`haproxy.prod.cfg`** (prod mount via `docker-compose.prod.yml`).
- Clarified **dev** = `haproxy.cfg` (no certs / no HTTPS) vs **prod/amvara9** = `haproxy.prod.cfg` + cert mount.
- Cross-checked against `haproxy/README.md`, `haproxy/haproxy.prod.cfg`, and `docker-compose.prod.yml` — no new deploy steps invented. No other docs edited.

## Testing instructions

### What to verify

- `docs/0026-haproxy-ssl-amvara9.md` attributes the SSL bind (`bind *:443 ssl crt /etc/haproxy/certs`) to **`haproxy.prod.cfg`**, not to the local/dev **`haproxy.cfg`**.
- Doc clearly states the dev vs prod config split.
- No product code or unrelated docs were changed.

### How to test

From repo root:

```bash
# SSL bind narrative should name haproxy.prod.cfg (not claim SSL lives in haproxy.cfg alone)
rg -n 'bind \*:443|haproxy\.prod\.cfg|haproxy\.cfg' docs/0026-haproxy-ssl-amvara9.md

# Repo truth: SSL bind only in prod config
rg -n 'bind \*:443' haproxy/

# Prod compose mounts haproxy.prod.cfg
rg -n 'haproxy\.prod\.cfg' docker-compose.prod.yml
```

### Pass/fail criteria

- **Pass:** §3 and Summary table point SSL bind at `haproxy.prod.cfg`; remaining `haproxy.cfg` mentions are only for the local/dev (no HTTPS) case; `rg 'bind \*:443' haproxy/` shows the bind only in `haproxy.prod.cfg`.
- **Fail:** Doc still says production SSL bind is defined in `haproxy/haproxy.cfg`, or omits the dev vs prod split.

## Test report

1. **Date/time (UTC):** 2026-07-26 03:10:21 UTC (start) → 2026-07-26 03:11:00 UTC (finish). Log window: N/A — docs-only verification (no container runtime exercised).
2. **Environment:** branch `development` @ `7a4ebcbe`; repo-root `rg` / `git diff` checks (no compose up required; no `BASE_URL`).
3. **What was tested:** `docs/0026-haproxy-ssl-amvara9.md` SSL bind attribution to `haproxy.prod.cfg`; dev vs prod config split; repo truth in `haproxy/` and `docker-compose.prod.yml`; scope limited to that doc (no product code / unrelated docs).
4. **Results:**
   - §3 attributes `bind *:443 ssl crt /etc/haproxy/certs` to **haproxy.prod.cfg**, with explicit local/dev vs prod/amvara9 sentence — **PASS** (`docs/0026-haproxy-ssl-amvara9.md:29–31`).
   - Summary table row names **haproxy.prod.cfg** for SSL bind and notes local/dev `haproxy.cfg` (no HTTPS) — **PASS** (`docs/0026-haproxy-ssl-amvara9.md:100`).
   - Remaining `haproxy.cfg` mentions are only for the local/dev (no HTTPS) case — **PASS** (`rg` lines 29, 100).
   - Repo truth: `bind *:443` only in `haproxy/haproxy.prod.cfg` (not in `haproxy.cfg`) — **PASS** (`haproxy/haproxy.prod.cfg:28`).
   - Prod compose mounts `./haproxy/haproxy.prod.cfg` — **PASS** (`docker-compose.prod.yml:28`).
   - No product code (`back/`/`front/`) and no other docs changed — **PASS** (`git diff --name-only`).
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators and agents will now open the correct prod HAProxy file when restoring certs or debugging 443. The short dev-vs-prod sentence matches `haproxy/README.md` and the compose overlay, so the doc no longer misleads toward the HTTP-only local config.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only; verification evidence is `rg`/`git` output above (no container logs).
