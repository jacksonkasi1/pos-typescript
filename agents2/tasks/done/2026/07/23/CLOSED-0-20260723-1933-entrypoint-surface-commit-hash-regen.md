---
## Closing summary (TOP)

- **What happened:** Front docker-entrypoint ran `get-commit-hash.js` on start but swallowed failures with `|| true`, so long-lived containers could keep a stale `commit-hash.ts` with no log signal that regen ran.
- **What was done:** Entrypoint now surfaces script stdout/stderr and exit status, logs a ready summary with written `version`/`commitHash`, warns on package mismatch or script failure, and uses the bind-mounted `/app/docker-entrypoint.sh` via Dockerfile `ENTRYPOINT`.
- **What was tested:** Tester PASS — restart logs show regen + `commit-hash.ts ready: version=2.1.48 commitHash=dba19e1c`; forced script failure emits WARNING and container stays up; `test:landing-version` exit 0 with footer `2.1.48 dba19e1c`.
- **Why closed:** All pass/fail criteria met; no GitHub issue (enhancement reviewer / issue 0).
- **Closed at (UTC):** 2026-07-25 21:35
---

# Surface commit-hash regen result in front docker-entrypoint

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`front/docker-entrypoint.sh`** runs **`get-commit-hash.js`** on start but swallows failures with **`|| true`**. **`commit-hash.ts`** can stay at an old semver (today **2.1.8** vs package **2.1.29**) across long-lived containers with no log line saying regen ran or what version was written. Agents then rely on **`SKIP_LANDING_PACKAGE_VERSION_CHECK`** and miss that a restart/regen would have fixed the footer.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T19:33Z: adjacent to owned sync/process work — **`NEW-0-20260723-1918-sync-landing-commit-hash-semver`** (one-shot regen+commit) and closed **`CLOSED-0-20260723-1918-committer-regen-commit-hash-on-version-bump`** (040/docs). This task is **entrypoint observability only**
- `front/docker-entrypoint.sh` ~L28–31: `node …/get-commit-hash.js || true`
- `get-commit-hash.js` already prints `✓` / `⚠` lines when run interactively; entrypoint discards non-zero exits
- Tracked file still `version = '2.1.8'` while `front/package.json` is `2.1.29`

## High-level instructions for coder

- After calling **`get-commit-hash.js`**, log the written **`version`** / **`commitHash`** (or the script’s stdout) so `docker logs pos-front` shows regen on start
- Prefer **not** hiding failures: if node/script fails, log a clear warning (keep container startable if that is existing policy, but do not stay silent)
- Optional: if written `version` ≠ `package.json` version after a successful run, print a loud warning
- Do not replace the sibling one-shot sync task; do not change landing UI
- Pass/fail: restarting **`pos-front`** emits a log line with the regenerated semver; a forced script failure is visible in logs

## Implementation notes (coder)

- **`front/docker-entrypoint.sh`:** capture script stdout/stderr + exit code; always print script output; on success log `[entrypoint] commit-hash.ts ready: version=… commitHash=…`; warn if that version ≠ `package.json`; on failure log `[entrypoint] WARNING: get-commit-hash.js failed (exit N); continuing with existing commit-hash.ts` and still start the container.
- **`front/Dockerfile`:** `ENTRYPOINT` now uses **`/app/docker-entrypoint.sh`** (bind-mounted `./front`) so host edits apply without baking a stale `/docker-entrypoint.sh` into the image. One-time **`docker compose … build front`** needed after this change.
- Side effect of verification restart: **`front/src/environments/commit-hash.ts`** regenerated to match current `COMMIT_HASH` / package semver (**2.1.48**).

## Testing instructions

### What to verify

1. On **`pos-front`** start, Docker logs show regen progress and a summary line with the written semver + short hash.
2. If **`get-commit-hash.js`** exits non-zero, logs show a clear **WARNING** and the container still starts.
3. Landing footer / smoke still healthy (no UI change intended).

### How to test

From repo root (dev compose):

```bash
export COMMIT_HASH=$(git rev-parse --short HEAD)
# First time after Dockerfile ENTRYPOINT change only:
docker compose -f docker-compose.yml -f docker-compose.dev.yml build front
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d front
docker logs --since 1m pos-front 2>&1 | grep -E '\[entrypoint\]|Build info written'
```

Expect lines similar to:

- `[entrypoint] Regenerating src/environments/commit-hash.ts ...`
- `✓ Build info written: version=…, commitHash=…`
- `[entrypoint] commit-hash.ts ready: version=… commitHash=…`

Forced failure (optional; restore script afterward):

```bash
cp front/scripts/get-commit-hash.js /tmp/get-commit-hash.js.bak
printf '%s\n' '#!/usr/bin/env node' 'console.error("forced failure");' 'process.exit(1);' > front/scripts/get-commit-hash.js
docker compose -f docker-compose.yml -f docker-compose.dev.yml restart front
docker logs --since 30s pos-front 2>&1 | grep '\[entrypoint\] WARNING'
mv /tmp/get-commit-hash.js.bak front/scripts/get-commit-hash.js
docker compose -f docker-compose.yml -f docker-compose.dev.yml restart front
```

Smoke:

```bash
BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front
```

### Pass/fail criteria

- **Pass:** restart logs include `[entrypoint] commit-hash.ts ready: version=<package.json version> …`; forced failure shows WARNING and front still serves; `test:landing-version` exits 0.
- **Fail:** silent `|| true` behaviour returns; container dies on script failure; or landing smoke breaks for reasons introduced by this change.

## Test report

1. **Date/time (UTC):** 2026-07-25T21:34:00Z start → 2026-07-25T21:34:50Z end. Log window: `docker logs --since 10m pos-front`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` @ `dba19e1c`; `front/package.json` version `2.1.48`. Image ENTRYPOINT already `[/app/docker-entrypoint.sh]` (no rebuild required).
3. **What was tested:** Entrypoint commit-hash regen observability on `pos-front` start; forced `get-commit-hash.js` failure WARNING + container continues; landing footer / smoke (`test:landing-version`).
4. **Results:**
   - Regen + summary on start: **PASS** — logs show `[entrypoint] Regenerating…`, `✓ Build info written: version=2.1.48, commitHash=dba19e1c`, `[entrypoint] commit-hash.ts ready: version=2.1.48 commitHash=dba19e1c`.
   - Forced script failure: **PASS** — `[entrypoint] WARNING: get-commit-hash.js failed (exit 1); continuing with existing commit-hash.ts`; container `State.Status=running` (HTTP 503 only during Angular rebuild).
   - Landing smoke: **PASS** — `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` exit 0; footer text `2.1.48 dba19e1c`.
5. **Overall:** **PASS**
6. **Product owner feedback:** Restarting `pos-front` now makes commit-hash regen visible in Docker logs with the written semver and short hash, so agents no longer need to guess whether regen ran. A script failure is a clear WARNING and does not take the container down. Landing footer and nav smoke remain healthy.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/dashboard
   3. http://127.0.0.1:4202/my-shift
   4. http://127.0.0.1:4202/staff/orders
   5. http://127.0.0.1:4202/tables
   6. http://127.0.0.1:4202/kitchen
   7. http://127.0.0.1:4202/bar
   8. http://127.0.0.1:4202/customers
8. **Relevant log excerpts:**
```
[entrypoint] Regenerating src/environments/commit-hash.ts ...
✓ Build info written: version=2.1.48, commitHash=dba19e1c -> /app/src/environments/commit-hash.ts
[entrypoint] commit-hash.ts ready: version=2.1.48 commitHash=dba19e1c
[entrypoint] WARNING: get-commit-hash.js failed (exit 1); continuing with existing commit-hash.ts
Application bundle generation complete. [7.762 seconds] - 2026-07-25T21:34:25.078Z
```
