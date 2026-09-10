---
## Closing summary (TOP)

- **What happened:** Ops troubleshooting doc `0027` still framed the HAProxy/StaticFiles 404 fix as possibly pending on amvara9.
- **What was done:** Added a shipped-routes status banner and result→meaning table; labeled Cause and fix as historical; fixed compose orphan-clear paths; updated `docs/README.md` 0027 blurb. No product code.
- **What was tested:** Banner/table, compose paths vs 0001/0004, README blurb, in-container upload probe (`OK routes active 404`), empty back/front diff — overall **PASS**.
- **Why closed:** All pass/fail criteria met.
- **Closed at (UTC):** 2026-07-26 10:47
---

# Refresh 0027 menu-images troubleshooting status

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0027-amvara9-menu-images-troubleshooting.md` still describes the HAProxy/`StaticFiles` 404 fix as if it might be pending on amvara9, with no “routes shipped” banner. Explicit upload routes have been in `back/app/main.py` for months. Operators and agents may re-diagnose an already-fixed mount issue instead of missing-on-disk / orphan `image_filename` cases (see open catalog NEW).

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` continuation — **>90d**; deferred earlier; only referenced (not owned) by **`NEW-0-20260604-1325-catalog-provider-images-404-missing-on-disk.md`**
- Doc “Cause and fix” section: explicit `GET /uploads/...` routes — still the right ops story, but needs a current-status cue
- Preflight demo/catalog hygiene still noisy; keep this as a **small doc** task (no product rewrite)

## High-level instructions for coder

- Add a short top banner: **ops guide — upload routes shipped**; if curl shows JSON `Image not found`, treat as missing file / DB orphan (link **`docs/`** catalog/provider notes and the open catalog-images NEW if still open), not as “redeploy for StaticFiles”.
- Skim verify commands (`docker compose … -f docker-compose.prod.yml`, curl `/api/uploads/...`) against current amvara9 docs (**0001** / **0004**); fix only broken path strings if any.
- Do **not** re-implement upload routes or expand into a full images redesign.
- Pass/fail: first screenful states routes are in tree; remaining 404s point to file/DB; no product code changes unless a one-line doc command path is wrong.

## Coder notes

- Added **Status: ops guide — upload routes shipped** with a result→meaning table (200 / JSON `Image not found` / non-JSON 404).
- Relabeled “Cause and fix” as historical; verify curl comments no longer push “redeploy for StaticFiles” as the primary path.
- Linked **testing.md** (orphan clear) and **0014-provider-portal.md**; catalog NEW is already **CLOSED** (`done/2026/06/04/...`) so linked those docs instead.
- Prod compose orphan-clear command now matches SSH section (`--env-file` + `-f docker-compose.prod.yml`); local/dev one-liner added.
- Updated `docs/README.md` 0027 blurb. No `back/` / `front/` code changes.
- Verified in-container probe: `GET /uploads/1/products/__nonexistent__.jpg` → 404 JSON `Image not found`.

## Testing instructions

### What to verify

- First screenful of `docs/0027-…` states upload routes are shipped; JSON `Image not found` maps to missing file / orphan, not StaticFiles redeploy.
- Verify/SSH compose paths still match amvara9 docs (**0001** / **0004**).
- `docs/README.md` index blurb for 0027 reflects shipped-routes / orphan guidance.
- No product code diffs for this task.

### How to test

```bash
# From repo root
rg -n 'ops guide — upload routes shipped|Image not found|0014-provider-portal|testing\.md|Cause and fix \(in repo — historical\)' \
  docs/0027-amvara9-menu-images-troubleshooting.md

rg -n '0027-amvara9-menu-images-troubleshooting' docs/README.md

# Confirm routes still active (dev stack)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T back python3 -c "
import urllib.request
try:
    urllib.request.urlopen(urllib.request.Request('http://localhost:8020/uploads/1/products/__nonexistent__.jpg', method='GET'))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    assert 'Image not found' in body or 'Invalid filename' in body, body[:200]
    print('OK routes active', e.code)
"

# No product code in this task
git diff --stat -- back/ front/
```

### Pass/fail criteria

- **Pass:** Status banner present; table points JSON 404 at file/DB; README blurb updated; in-container probe prints OK; `git diff` shows no `back/` / `front/` changes for this work.
- **Fail:** Doc still frames StaticFiles fix as pending; primary advice is “redeploy”; probe returns non-JSON 404 or connection error with stack up.

## Test report

1. **Date/time (UTC):** 2026-07-26 10:46:55 – 10:47:02 UTC. Log window: `docker logs --since 5m pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development`; local stack up (`pos-back` healthy). No browser `BASE_URL` (docs + in-container probe only).
3. **What was tested:** Status banner and result→meaning table in `docs/0027-…`; compose/SSH command paths vs **0001** / **0004**; `docs/README.md` 0027 blurb; in-container upload route probe; no `back/` / `front/` product diffs.
4. **Results:**
   - Status banner “ops guide — upload routes shipped” + JSON `Image not found` → file/DB orphan: **PASS** — lines 3–15 of `docs/0027-amvara9-menu-images-troubleshooting.md`.
   - Verify/SSH compose paths match amvara9 docs: **PASS** — `--env-file config.env -f docker-compose.yml -f docker-compose.prod.yml` aligns with `docs/0004-deployment.md`.
   - README 0027 blurb reflects shipped-routes / orphan guidance: **PASS** — `docs/README.md:38`.
   - In-container probe: **PASS** — printed `OK routes active 404`.
   - No product code diffs: **PASS** — `git diff --stat -- back/ front/` empty.
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators now see immediately that upload routes are shipped and that JSON 404s mean missing files or orphan DB refs, not a StaticFiles redeploy. The README index matches that guidance, so agents should stop re-diagnosing an already-fixed mount issue.
7. **URLs tested:** N/A — no browser (docs + container probe only).
8. **Relevant log excerpts:**
```
INFO:     127.0.0.1:56134 - "GET /uploads/1/products/__nonexistent__.jpg HTTP/1.1" 404 Not Found
INFO:     127.0.0.1:55208 - "GET /uploads/1/products/__nonexistent__.jpg HTTP/1.1" 404 Not Found
```
Probe stdout: `OK routes active 404`
