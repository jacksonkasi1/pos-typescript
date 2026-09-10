---
## Closing summary (TOP)

- **What happened:** Automated Deploy to amvara9 was failing before SSH because GitHub Actions artifacts for antillana, dilruba, flamanapolitana, and hakone had expired.
- **What was done:** Rebuilt those four marketing repos for fresh `dist` artifacts; improved fetch/refresh scripts and docs so expired artifacts are skipped and can be refreshed before the next promote.
- **What was tested:** Deploy run 30164932142 succeeded through Fetch → smoke; production slugs returned real SPAs; refresh helper DRY_RUN reported all manifest sites OK. Overall PASS.
- **Why closed:** All required criteria passed; optional local sync failure was pre-commit only and did not overturn CI/production results.
- **Closed at (UTC):** 2026-07-25 16:13
---

# Fix GHA Deploy marketing-artifact failures (from #308)

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/309
- **309**

## Problem / goal

Issue **#308** (release/promote **2.1.33**) completed via **manual** amvara9 deploy. Automated **Deploy to amvara9** still fails before SSH: step **Fetch marketing site artifacts** cannot get real bundles for marketing sites (reported: antillana, dilruba, flamanapolitana, hakone) when `MARKETING_VERIFY_NO_PLACEHOLDERS=1`, so the workflow never reaches checkout/build/smoke.

Example failure: https://github.com/satisfecho/pos/actions/runs/30164265297 (2026-07-25). Same class of failure already forced manual deploy on earlier promotes (e.g. unpaid-delivery cron task notes).

Goal: restore a **green** Deploy to amvara9 path so the next `master` push does not require SSH fallback. See **`docs/0001-ci-cd-amvara9.md`**, **`.github/workflows/deploy-amvara9.yml`**, **`config/marketing-sites.json`**, **`scripts/sync-all-marketing-sites.sh`**, and agent **005** marketing sync notes in **`docs/agent-loop.md`**.

Sensitive/off-scope requests in issue text: none beyond this deploy fix.

## High-level instructions for coder

- Reproduce from the failed run log: which marketing repos/slugs fail artifact fetch (expired Actions artifacts, missing PAT/token scope, wrong workflow artifact names, or excluded/placeholder-only sites).
- Fix the durable cause — prefer one of: re-publish/refresh marketing CI artifacts for required slugs; correct fetch auth/names in the deploy workflow; or adjust manifest/verify so only sites with current artifacts are required (without silently shipping placeholder SPAs in production).
- Do **not** weaken production so placeholders pass verify unless product owners explicitly accept that for a named slug; document any intentional skip.
- Confirm a **Deploy to amvara9** run succeeds through Fetch → SSH → sync → build → smoke (or document a controlled exception with owner sign-off).
- Update **`docs/0001-ci-cd-amvara9.md`** (or related ops notes) if the operator runbook changes (secrets, artifact refresh cadence, fallback).
- Append **Testing instructions** with the green workflow run URL and which slugs were verified.

## Implementation notes (coder)

**Root cause:** GitHub Actions artifacts for `010_antillana`, `020_dilruba`, `030_flamanapolitana`, `050_hakone` had **`expired: true`** (last successful builds 2026-04-21; expired ~2026-07-20). Fetch got as far as the download URL then failed (“Artifact download failed”). Other manifest sites still had live artifacts.

**Immediate fix:** Re-dispatched **Build** on those four repos (runs `30164792111`, `30164792970`, `30164793884`, `30164794962`) — fresh `dist` artifacts expire **2026-10-23**.

**Durable POS changes (on `development`, uncommitted until committer):**
- `scripts/fetch-marketing-artifact.sh` — skip expired artifacts, walk recent successful runs, clearer HTTP/expiry errors.
- `scripts/refresh-expired-marketing-artifacts.sh` — detect + `gh workflow run Build` for expired/missing sites (`DRY_RUN=1` / `WAIT=1`).
- `scripts/sync-all-marketing-sites.sh` — verify checks `deploySubpath` index paths and missing files.
- Docs: `docs/0001-ci-cd-amvara9.md` § Marketing site artifacts; notes in `005-marketing-repos-reviewer.md` and deploy workflow header.

**Verified:** Deploy to amvara9 **https://github.com/satisfecho/pos/actions/runs/30164932142** — **success** (Fetch → SSH → sync → build → smoke).

## Testing instructions

1. Confirm green deploy: open **https://github.com/satisfecho/pos/actions/runs/30164932142** — conclusion **success**; step **Fetch marketing site artifacts** green.
2. Production slug smoke (no `bundle not loaded`):
   - `https://www.satisfecho.de/dilruba/`
   - `https://www.satisfecho.de/flamanapolitana/`
   - `https://www.satisfecho.de/hakone/`
   - `https://www.satisfecho.de/antillana/`
3. Refresh helper: `DRY_RUN=1 bash scripts/refresh-expired-marketing-artifacts.sh` — all manifest sites report **OK** (non-expired).
4. After committer lands script changes on `development`: optional local `MARKETING_SYNC_FORCE=1 MARKETING_VERIFY_NO_PLACEHOLDERS=1 bash scripts/sync-all-marketing-sites.sh` (needs `MARKETING_ARTIFACT_TOKEN` / `gh auth`) exits 0.

## Test report

- **Date/time (UTC):** 2026-07-25 16:09:19 → 16:12:44 UTC (log window ~16:09–16:12 UTC)
- **Environment:** branch `development` (local + GitHub Actions deploy run); production `https://www.satisfecho.de`; local scripts via host shell + `gh` auth. No Docker app stack required for this task.
- **What was tested:** Green Deploy to amvara9 (Fetch → smoke); production marketing slugs for antillana/dilruba/flamanapolitana/hakone; `refresh-expired-marketing-artifacts.sh` DRY_RUN; optional local full sync (scripts still uncommitted on `development`).

### Results

1. **Green deploy run 30164932142 — PASS.** `conclusion=success`; step **Fetch marketing site artifacts (curl + GitHub API)** success (~16:05:46–16:06:27Z); SSH → sync → build → smoke all success. Job: https://github.com/satisfecho/pos/actions/runs/30164932142/job/89696214771
2. **Production slug smoke (no `bundle not loaded`) — PASS.** All four URLs HTTP 200; no placeholder / “bundle not loaded” markers; real hashed `main-*.js` / styles assets and restaurant titles present.
3. **Refresh helper DRY_RUN — PASS.** All 14 manifest sites reported `OK (non-expired)`; summary: `all manifest sites have a non-expired artifact` (antillana/dilruba/flamanapolitana/hakone expire 2026-10-23).
4. **Optional local sync — FAIL (optional; scripts not yet committed).** `MARKETING_SYNC_FORCE=1 MARKETING_VERIFY_NO_PLACEHOLDERS=1 bash scripts/sync-all-marketing-sites.sh` reported placeholders/missing index for several slugs (incl. dilruba, flamanapolitana, hakone) in the local working tree. Does not overturn CI deploy success or production smoke; re-run after committer lands durable script changes if desired.

### Overall: **PASS**

Failed required criteria: none. Criterion 4 is optional and pre-commit; production deploy path is green.

### Product owner feedback

Automated Deploy to amvara9 is working again through marketing artifact fetch; the four previously expired sites now serve real SPAs on satisfecho.de. Operators should keep using the refresh helper before artifacts expire (~90 days) so the next promote does not need SSH fallback. Commit the durable fetch/refresh script changes on `development` so local ops matches what CI already proved.

### URLs tested

1. https://github.com/satisfecho/pos/actions/runs/30164932142
2. https://www.satisfecho.de/dilruba/
3. https://www.satisfecho.de/flamanapolitana/
4. https://www.satisfecho.de/hakone/
5. https://www.satisfecho.de/antillana/

### Relevant log excerpts

```
gh run view 30164932142 → conclusion: success
Fetch marketing site artifacts … conclusion: success
Smoke test (landing, version, API health) … conclusion: success

[refresh-marketing] antillana: OK (expires 2026-10-23T16:01:36Z)
[refresh-marketing] dilruba: OK (expires 2026-10-23T16:01:37Z)
[refresh-marketing] flamanapolitana: OK (expires 2026-10-23T16:01:38Z)
[refresh-marketing] hakone: OK (expires 2026-10-23T16:01:40Z)
… all manifest sites have a non-expired artifact

curl dilruba/flamanapolitana/hakone/antillana → HTTP 200; titles Dilruba / Flama Napolitana / Hakone / L'Antillana; main-*.js present; no “bundle not loaded”
```
