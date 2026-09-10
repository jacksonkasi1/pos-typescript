---
## Closing summary (TOP)

- **What happened:** Enhancement reviewer flagged `docs/0057-deploy-css-fix-amvara9.md` as still reading like an open deploy CSS incident while the fixes were already in the repo.
- **What was done:** Added a Status (shipped) banner and historical reframing to 0057; marked the docs README deployment index entry as shipped; left deploy scripts/nginx unchanged.
- **What was tested:** Docs and spot-check greps for deploy `--no-cache` front build and nginx SPA no-cache headers — overall PASS (2026-07-26).
- **Why closed:** All pass criteria met; docs correctly describe a closed historical incident.
- **Closed at (UTC):** 2026-07-26 11:57
---

# Mark 0024 deploy CSS fix as shipped

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

`docs/0057-deploy-css-fix-amvara9.md` still reads like an open incident (“what to change for your confirmation”) while both recommended fixes are already in the repo. Operators and agents may re-open a solved deploy CSS stale-build issue.

## Evidence (008 preflight / review)

- Doc age >90d; not in the 14 SIGNAL basename list but still stale alongside other `docs/*.md`
- `scripts/deploy-amvara9.sh` already runs `docker compose … build --no-cache front`
- `front/nginx.conf` already sets `Cache-Control: no-cache, no-store, must-revalidate` on the SPA `index.html` location
- No existing `agents2/tasks/*` covers **0024-deploy** (WhatsApp notes use a different `0024-whatsapp-*` file)

## High-level instructions for coder

- Add a short **Status (shipped)** banner at the top of `docs/0057-deploy-css-fix-amvara9.md`: front `--no-cache` deploy build + `index.html` no-cache headers are in place; keep the root-cause narrative as historical context.
- Point to current paths (`scripts/deploy-amvara9.sh`, `front/nginx.conf`) instead of “proposed” diff language.
- Do **not** rewrite the whole doc or change deploy behaviour unless a real regression is found.
- Pass criteria: doc opens with shipped status; no contradictory “please confirm these changes” framing; `docs/README.md` index blurb optional one-line update if it still implies an open fix.

## Implementation notes (coder)

- Confirmed in repo: `scripts/deploy-amvara9.sh` removes existing front image then `build --no-cache front`; `front/nginx.conf` `location /` has `Cache-Control: no-cache, no-store, must-revalidate`; compose uses `up -d` (not relying on `up --build` alone for front).
- Updated `docs/0057-deploy-css-fix-amvara9.md`: **Status (shipped)** banner; reframed problem/root-cause as historical; replaced “What to change (for your confirmation)” with “What was changed (now in repo)”; summary table marks items shipped.
- Updated `docs/README.md` deployment index line for 0057 to say **Shipped** + historical notes.
- No product/deploy script changes.

## Testing instructions

### What to verify

1. `docs/0057-deploy-css-fix-amvara9.md` opens with a **Status (shipped)** statement naming `scripts/deploy-amvara9.sh` (`--no-cache` front) and `front/nginx.conf` (SPA document no-cache headers).
2. The doc no longer asks for confirmation of proposed changes (“for your confirmation” / “After applying…” as open work).
3. `docs/README.md` deployment table describes 0057 as shipped (not an open fix).
4. Repo still matches the banner claims (spot-check only; no deploy required for this docs task).

### How to test

```bash
# From repo root
head -n 20 docs/0057-deploy-css-fix-amvara9.md
grep -n '0057-deploy-css' docs/README.md
grep -n 'build --no-cache front' scripts/deploy-amvara9.sh
grep -n 'no-cache, no-store, must-revalidate' front/nginx.conf
```

Optional: confirm no remaining open-incident framing:

```bash
grep -nE 'for your confirmation|After applying \(1\) and \(2\)|What to change' docs/0057-deploy-css-fix-amvara9.md || true
```

(Expect no matches for those open-work phrases.)

### Pass/fail criteria

- **Pass:** First screenful of 0057 says shipped; README index says shipped; grep confirms deploy script + nginx still implement the fix; no “please confirm these changes” framing.
- **Fail:** Doc still reads as an open incident, README still implies an unfixed deploy CSS issue, or banner claims disagree with `deploy-amvara9.sh` / `front/nginx.conf`.

## Test report

1. **Date/time (UTC):** 2026-07-26 11:56:25–11:56:29 UTC. Log window: N/A (docs-only verification; no app deploy or browser).
2. **Environment:** Local repo on branch `development` @ `3d040628`. Compose files `docker-compose.yml` + `docker-compose.dev.yml` (stack up; not exercised for this task). No `BASE_URL`.
3. **What was tested:** Status (shipped) banner on `docs/0057-deploy-css-fix-amvara9.md`; removal of open-confirmation framing; `docs/README.md` deployment index for 0057; spot-check that `scripts/deploy-amvara9.sh` and `front/nginx.conf` still implement the claimed fixes.
4. **Results:**
   - Criterion 1 (Status shipped banner naming deploy script + nginx): **PASS** — `head` shows `**Status (shipped):**` citing `scripts/deploy-amvara9.sh` (`--no-cache`) and `front/nginx.conf` (`Cache-Control: no-cache, no-store, must-revalidate` on SPA document).
   - Criterion 2 (no open “for your confirmation” / “After applying…” framing): **PASS** — `grep -nE 'for your confirmation|After applying \(1\) and \(2\)|What to change'` returned no matches.
   - Criterion 3 (`docs/README.md` describes 0057 as shipped): **PASS** — line 36: `**Shipped:** stale front build on deploy — …`.
   - Criterion 4 (repo matches banner claims): **PASS** — `scripts/deploy-amvara9.sh:82` has `build --no-cache front` (after removing front image); `front/nginx.conf` `location /` has `add_header Cache-Control "no-cache, no-store, must-revalidate";`.
5. **Overall:** **PASS**
6. **Product owner feedback:** The 0057 doc correctly reads as a closed historical incident with a clear shipped banner, and the README index matches. Operators should not reopen this as an open deploy CSS fix. No product or deploy behaviour was changed in this task.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A — docs/script/nginx grep verification only; no container log evidence required.

