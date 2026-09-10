---
## Closing summary (TOP)

- **What happened:** Bulgarian (`bg.json`) lagged English by ~25 leaf keys (mostly Settings delivery integrations plus product image).
- **What was done:** Added all 25 missing keys to `front/public/i18n/bg.json` with Bulgarian (Cyrillic) copy; no Angular/product-code changes.
- **What was tested:** Leaf parity (`en==bg`, `bg OK missing=0 extra=0`), Cyrillic spot-check, landing smoke, and HTTP 200 — all **PASS**.
- **Why closed:** All pass/fail criteria met; no GitHub issue (enhancement-reviewer task, issue `0`).
- **Closed at (UTC):** 2026-07-25 20:42
---

# Backfill missing Bulgarian (bg) i18n keys vs en

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`front/public/i18n/bg.json`** lags **`en.json`** by **~25** leaf keys. Most are **`SETTINGS.DELIVERY_INTEGRATIONS_*`** marketplace-integration labels plus **`PRODUCTS.PRODUCT_IMAGE`**. Bulgarian stays listed as a supported UI language, so Settings → Delivery integrations can show raw keys while **`es`/`de`/`ur`** already have those strings.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL docs_stale×14` owned; demo OK; Unreleased filled; NEW backlog≈62 — small i18n parity gap, not a bulk doc rewrite
- Flat key-diff: `en − bg` ≈ 25; majority `SETTINGS.DELIVERY_INTEGRATIONS_*` (add/mapping/credentials/status/copy URL/etc.)
- Sibling locale NEWs (**`…-1638-…-ca…`**, **`…-1638-…-zh-cn-hi…`**, **`…-1648-…-fr…`**) do **not** own Bulgarian — do not merge

## High-level instructions for coder

- Add every leaf key present in **`front/public/i18n/en.json`** but missing from **`bg.json`**, with proper Bulgarian copy
- Use **`es.json`** / **`de.json`** as structure references for the `SETTINGS.DELIVERY_INTEGRATIONS_*` block (translate into Bulgarian; do not copy Spanish/German text)
- Keep JSON structure/ordering consistent with sibling locale files; no product-code changes unless a key path is wrong
- Pass/fail: flat key-set diff `en − bg` is **0**; spot-check Settings → Delivery integrations tab in `bg` if that module is enabled (no raw `SETTINGS.DELIVERY_INTEGRATIONS_*` keys)

## Implementation notes (coder)

- Added **25** missing leaf keys to **`front/public/i18n/bg.json`** with Bulgarian (Cyrillic) copy:
  - `PRODUCTS.PRODUCT_IMAGE`
  - full `SETTINGS.DELIVERY_INTEGRATIONS_*` block (24 keys), inserted before `SOCIAL_POSTS_TAB` to match `en` ordering
- No Angular / product-code changes.
- Verified: flat `en − bg` = **0** / `extra` = **0**; `python3 scripts/check-i18n-locale-parity.py` reports **`bg OK`**.
- Landing smoke: `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` → **RESULT: Landing version OK**.

## Testing instructions

### What to verify

1. Leaf key parity: every key in `front/public/i18n/en.json` exists in `front/public/i18n/bg.json` (and no extras).
2. New strings are Bulgarian (not English paste-through), especially `PRODUCTS.PRODUCT_IMAGE` and `SETTINGS.DELIVERY_INTEGRATIONS_*`.
3. App still loads after the JSON edit.

### How to test

```bash
# From repo root — bg must be OK (other locales may still FAIL; out of scope)
python3 scripts/check-i18n-locale-parity.py 2>&1 | rg 'bg\s+'

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
bg = set(flatten(json.loads((root / "bg.json").read_text())))
print("missing", sorted(en - bg))
print("extra", sorted(bg - en))
assert en == bg
print("PASS en==bg")
PY

# Smoke (stack up on HAProxy)
BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front
```

Optional UI spot-check: switch language to Bulgarian (`bg`), open Settings → Delivery integrations tab if enabled; confirm no raw `SETTINGS.DELIVERY_INTEGRATIONS_*` keys.

### Pass/fail criteria

- **Pass:** `en − bg` empty; parity script `bg OK`; landing smoke RESULT OK; new copy is Bulgarian.
- **Fail:** any missing/extra keys, invalid JSON, or landing smoke failure.

## Test report

1. **Date/time (UTC) / log window:** 2026-07-25 20:40:55 – 20:41:28 UTC; `docker logs --since 30m` on `pos-front` / `pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** Leaf key parity `en` vs `bg`; Bulgarian (Cyrillic) copy for `PRODUCTS.PRODUCT_IMAGE` + `SETTINGS.DELIVERY_INTEGRATIONS_*`; landing smoke after JSON change.
4. **Results:**
   - Leaf key parity (`en − bg` / `bg − en` empty): **PASS** — `missing []` / `extra []` / `PASS en==bg`.
   - Parity script `bg OK`: **PASS** — `bg OK missing=0 extra=0`.
   - New copy is Bulgarian: **PASS** — 24/25 target keys contain Cyrillic; `SETTINGS.DELIVERY_INTEGRATIONS_STATUS_OK` is intentionally `OK` (same as `en`, not English paste-through of a phrase). Sample: `PRODUCTS.PRODUCT_IMAGE` = `Изображение на продукта`; `SETTINGS.DELIVERY_INTEGRATIONS_TITLE` = `Интеграции с delivery пазари`.
   - Landing smoke: **PASS** — `>>> RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.` (version `2.1.44 3b36fc84`).
   - App HTTP: **PASS** — `curl http://127.0.0.1:4202/` → `200`.
5. **Overall:** **PASS**
6. **Product owner feedback:** Bulgarian locale is now in full leaf-key parity with English for Settings delivery integrations and product image labels, so `bg` users should no longer see raw i18n keys in that area. Copy reads as natural Bulgarian (Cyrillic), with only the status token `OK` left untranslated by design. Landing and core nav still smoke-clean after the JSON-only change.
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
   - Front (warnings only, no build failure): NG8107 optional-chain warnings in `menu.component.html` (pre-existing; unrelated to i18n JSON).
   - Back (window): no `error`/`exception`/`500` lines; routine `GET /docs` 200.
   - Landing smoke: `RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.`
   - Note: browser WebSocket `1008 Invalid authentication token` during sidebar nav (known/dev noise; did not fail smoke).
