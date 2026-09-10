---
## Closing summary (TOP)

- **What happened:** Landing footer semver in `commit-hash.ts` was stale vs `package.json`, so strict `test:landing-version` failed without a skip env workaround.
- **What was done:** Regenerated `front/src/environments/commit-hash.ts` via `get-commit-hash.js`; version aligned at **2.1.48** with short hash from current `HEAD`.
- **What was tested:** Version string match and `test:landing-version` on `http://127.0.0.1:4202` without `SKIP_LANDING_PACKAGE_VERSION_CHECK` — **PASS**.
- **Why closed:** All pass/fail criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-25 21:23
---

# Sync stale landing footer semver (commit-hash.ts)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`front/src/environments/commit-hash.ts` still exports **`version = '2.1.8'`** while **`front/package.json`** is **`2.1.29`**. The landing footer prefers the commit-hash export over package.json when non-zero, so **`npm run test:landing-version`** fails strict semver on localhost. Testers keep papering over this with `SKIP_LANDING_PACKAGE_VERSION_CHECK=1` (noted again when closing the Jul `/features` refresh).

## Evidence (008 preflight / review)

- SIGNAL `changelog_sparse` after **2.1.29** cut (owned elsewhere); adjacent finding from closed **`CLOSED-0-20260723-1903-refresh-public-features-page-jul-capabilities`**: landing smoke FAIL on footer **2.1.8** vs package **2.1.28+**
- `front/src/environments/commit-hash.ts`: `version = '2.1.8'`; `front/package.json`: `"version": "2.1.29"`
- `environment.ts` uses commit-hash `version` whenever it is not `'0.0.0'`
- Entrypoint runs `get-commit-hash.js` on container start, but a long-lived bind-mount without restart (or a bump that never regenerates the tracked file) leaves git/source stale

## High-level instructions for coder

- From repo root (host, with `.git`): run **`node front/scripts/get-commit-hash.js`** so `commit-hash.ts` matches current `package.json` version and short HEAD hash
- Commit the regenerated **`front/src/environments/commit-hash.ts`** (do not hand-edit)
- Optionally restart **`pos-front`** so the running app picks up the file if it was already serving
- Pass/fail: `commit-hash.ts` `version` equals `front/package.json` `version`; `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` passes **without** `SKIP_LANDING_PACKAGE_VERSION_CHECK`
- Do **not** broaden into committer process changes — sibling task owns that

## Implementation notes (coder)

- Ran `node front/scripts/get-commit-hash.js` from repo root (2026-07-25).
- Semver was already aligned at **2.1.48** (package.json cut past the original 2.1.8 / 2.1.29 mismatch); refreshed short hash **`23f11c30` → `69e0805f`** (current `HEAD`).
- No hand-edit of `commit-hash.ts`. Sibling entrypoint observability NEW left untouched.
- Verified landing smoke without `SKIP_LANDING_PACKAGE_VERSION_CHECK`.

## Testing instructions

### What to verify

- `front/src/environments/commit-hash.ts` `version` equals `front/package.json` `version` (currently **2.1.48**).
- Landing footer shows that semver and a plausible short git hash.
- `test:landing-version` passes strict package/footer semver check (no skip env).

### How to test

```bash
# From repo root
node -e "const p=require('./front/package.json'); const fs=require('fs'); const t=fs.readFileSync('front/src/environments/commit-hash.ts','utf8'); const m=t.match(/version = '([^']+)'/); console.log('pkg', p.version, 'commit-hash', m&&m[1], 'match', p.version===(m&&m[1]));"

BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front
# Must NOT set SKIP_LANDING_PACKAGE_VERSION_CHECK=1
```

Compose (dev): `docker compose -f docker-compose.yml -f docker-compose.dev.yml` — app via HAProxy on **4202**.

### Pass/fail criteria

- Pass: version strings match; landing smoke exits **0** and reports footer semver matching package.json without skip flag.
- Fail: version mismatch, or smoke only passes with `SKIP_LANDING_PACKAGE_VERSION_CHECK=1`.

## Test report

1. **Date/time (UTC):** 2026-07-25 21:22:40 UTC start → 21:23:06 UTC end. Log window: `docker logs --since 5m` around the smoke run.
2. **Environment:** `docker compose -f docker-compose.yml -f docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `69e0805f`; `HEADLESS=1`; `SKIP_LANDING_PACKAGE_VERSION_CHECK` unset.
3. **What was tested:** `commit-hash.ts` version vs `package.json`; landing footer semver + short hash; strict `test:landing-version` without skip env.
4. **Results:**
   - Version strings match (`2.1.48` == `2.1.48`): **PASS** — `node -e` check: `pkg 2.1.48 commit-hash version 2.1.48 … match true`; file has `commitHash = '69e0805f'`.
   - Landing footer shows semver + plausible short hash: **PASS** — smoke reported `Version element text: 2.1.48 69e0805f…`.
   - `test:landing-version` exit 0 without skip: **PASS** — `>>> RESULT: Landing version OK; …`; exit=0; env confirmed skip unset.
5. **Overall:** **PASS**
6. **Product owner feedback:** Footer semver drift is resolved on localhost; strict landing smoke no longer needs the skip workaround. Keep regenerating `commit-hash.ts` via `get-commit-hash.js` on version bumps so this does not regress.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/dashboard
   3. http://127.0.0.1:4202/my-shift
   4. http://127.0.0.1:4202/staff/orders
   5. http://127.0.0.1:4202/tables
   6. http://127.0.0.1:4202/kitchen
   7. http://127.0.0.1:4202/bar
   8. http://127.0.0.1:4202/customers
8. **Relevant log excerpts (last section):**
   - HAProxy: `GET / HTTP/1.1` → 200 during smoke window.
   - Front: page reload / NG8107 warnings only (pre-existing menu notes optional-chain); no build failure during test.
   - Smoke stdout: `Version element text: 2.1.48 69e0805f…` and `RESULT: Landing version OK`.
