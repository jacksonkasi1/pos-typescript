---
## Closing summary (TOP)

- **What happened:** Spanish `es.json` lagged English by ~15 leaf keys (book, working-plan, reservations, auth, menu, users, terms).
- **What was done:** Added the 15 missing keys with Spanish copy and fixed the `PLACEHOLER` typo key; flat `en − es` is now 0; parity script reports `es OK`.
- **What was tested:** Leaf parity, typo check, Spanish spot-check, and landing smoke all passed. Overall PASS.
- **Why closed:** All pass/fail criteria met; no GitHub issue (enhancement reviewer / issue 0).
- **Closed at (UTC):** 2026-07-25 19:59
---

# Backfill missing Spanish (es) i18n keys vs en

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`front/public/i18n/es.json`** lags **`en.json`** by **~15** leaf keys (small but user-visible). Spanish is a primary UI language; gaps cover book validation, reservation cancel/rate-limit copy, working-plan save/delete toasts, auth invalid-email, menu customize, co-owner hint, and public terms placeholder. An earlier 008 note on the fr backfill task incorrectly claimed `es` was at full parity — it is not.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T16:59Z: `SIGNAL docs_stale×14` all owned; `demo_tables_check=ok`; Unreleased=2; NEW backlog≈65 — improvement theme (i18n), not another stale-doc rewrite
- Flat key-diff: `en − es` ≈ 15 (`WORKING_PLAN`×5, `BOOK`×4, `RESERVATIONS`×2, plus `AUTH.INVALID_EMAIL`, `MENU.CUSTOMIZE_OPTIONS`, `SETTINGS.PUBLIC_TERMS_OF_SERVICE_PLACEHOLDER`, `USERS.CO_OWNER_HINT`)
- Open siblings own other locales only — do **not** merge with **`NEW-0-20260723-1659-backfill-de-i18n-missing-keys`** or the ca/fr/bg/zh-CN/hi backfills

## High-level instructions for coder

- Add every leaf key present in **`front/public/i18n/en.json`** but missing from **`es.json`**, with proper Spanish copy
- Keep JSON structure/ordering consistent with sibling locale files; no Angular code changes required unless a key path is wrong
- Do **not** invent new product strings; mirror `en` keys only
- Pass/fail: flat key-set diff `en − es` is **0**; spot-check book validation + working-plan save toast in `es`

## Implementation notes (coder)

- Added the 15 missing leaf keys to **`front/public/i18n/es.json`** with Spanish copy.
- Renamed typo key **`SETTINGS.PUBLIC_TERMS_OF_SERVICE_PLACEHOLER`** → **`PUBLIC_TERMS_OF_SERVICE_PLACEHOLDER`** (kept existing Spanish string).
- No Angular code changes.
- Verified: flat `en − es` = **0** / `extra` = **0**; `python3 scripts/check-i18n-locale-parity.py` reports **`es OK`**.
- Landing smoke: `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` → **RESULT: Landing version OK**.

## Testing instructions

### What to verify

1. Leaf key parity: every key in `front/public/i18n/en.json` exists in `front/public/i18n/es.json` (and no stray typo `PLACEHOLER`).
2. Spanish copy is present (not English leftovers) for book validation, working-plan toasts, cancel confirm, menu customize, co-owner hint, and terms placeholder.
3. App still loads after the JSON edit.

### How to test

```bash
# From repo root — es must be OK (other locales may still FAIL; out of scope)
python3 scripts/check-i18n-locale-parity.py 2>&1 | rg 'es\s+'

# Flat diff must be empty both ways
python3 - <<'PY'
import json
from pathlib import Path

def flatten(d, prefix=""):
    out = {}
    for k, v in d.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out.update(flatten(v, key))
        else:
            out[key] = v
    return out

root = Path("front/public/i18n")
en = set(flatten(json.loads((root / "en.json").read_text())))
es = set(flatten(json.loads((root / "es.json").read_text())))
print("missing", sorted(en - es))
print("extra", sorted(es - en))
assert en == es
print("PASS en==es")
PY

# Smoke (stack up on HAProxy)
BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front
```

Optional UI spot-check (manual): set UI language to **es**, open `/book/1` with invalid email/phone and confirm validation strings; on staff working plan, save/delete a shift and confirm toast copy.

### Pass/fail criteria

- **Pass:** `en − es` and `es − en` are empty; parity script line for `es` is `OK missing=0 extra=0`; no `PUBLIC_TERMS_OF_SERVICE_PLACEHOLER` in `es.json`; landing smoke reports OK.
- **Fail:** any of the 15 keys still missing, typo key still present, or landing smoke fails because of this change.

## Test report

1. **Date/time (UTC):** 2026-07-25 19:58:02–19:58:39 UTC. Log window: `docker logs --since 10m` on `pos-front` / `pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Leaf key parity `en` vs `es`; no typo `PLACEHOLER`; Spanish copy for book validation, working-plan toasts, cancel confirm, menu customize, co-owner hint, terms placeholder; landing smoke after JSON edit.
4. **Results:**
   - Leaf key parity `en == es`: **PASS** — `missing []` / `extra []`; `python3 scripts/check-i18n-locale-parity.py` → `es OK missing=0 extra=0` (script overall FAIL is other locales only, out of scope).
   - No typo `PUBLIC_TERMS_OF_SERVICE_PLACEHOLER`: **PASS** — only `PUBLIC_TERMS_OF_SERVICE_PLACEHOLDER` present in `es.json`.
   - Spanish copy (spot-check): **PASS** — e.g. `BOOK.INVALID_EMAIL` / `BOOK.INVALID_PHONE`, `WORKING_PLAN.SAVED` / `DELETED` / `DELETE_CONFIRM`, `RESERVATIONS.CANCEL_CONFIRM_*`, `MENU.CUSTOMIZE_OPTIONS`, `USERS.CO_OWNER_HINT`, `SETTINGS.PUBLIC_TERMS_OF_SERVICE_PLACEHOLDER` are Spanish (`same_as_en=False`).
   - App loads / landing smoke: **PASS** — `curl /` → 200; `/api/health` → 200; `npm run test:landing-version` → `RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.`
5. **Overall:** **PASS**
6. **Product owner feedback:** Spanish locale is now at full leaf-key parity with English for the previously missing book, working-plan, reservation, auth, menu, users, and terms strings. No product-code risk; remaining English leftovers elsewhere in `es.json` (e.g. some clock QR settings) are outside this task. Safe to close.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/api/health
   3. http://127.0.0.1:4202/dashboard
   4. http://127.0.0.1:4202/my-shift
   5. http://127.0.0.1:4202/staff/orders
   6. http://127.0.0.1:4202/tables
   7. http://127.0.0.1:4202/kitchen
   8. http://127.0.0.1:4202/bar
   9. http://127.0.0.1:4202/customers
8. **Relevant log excerpts (last section):**
   - `pos-front`: `Application bundle generation complete` (no TS/Angular errors tied to i18n JSON); existing `NG8107` MenuComponent warnings only.
   - Landing smoke: `Version element text: 2.1.40 559fbd44` … `>>> RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.`
   - `pos-back`: no new errors/exceptions in the test window; health 200.
