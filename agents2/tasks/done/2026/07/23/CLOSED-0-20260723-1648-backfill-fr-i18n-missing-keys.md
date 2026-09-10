---
## Closing summary (TOP)

- **What happened:** French (`fr.json`) lagged English by ~149 leaf keys after recent auth OTP, kitchen, products/tax, and orders work.
- **What was done:** All 149 missing keys were added to `front/public/i18n/fr.json` with French copy; sections reordered to match `en.json`; no Angular code changes.
- **What was tested:** Leaf parity (`fr OK missing=0 extra=0`, 2451 keys), French spot-check on AUTH/SETTINGS/RESERVATIONS/ORDERS/PRODUCTS, and landing smoke — all **PASS**.
- **Why closed:** All pass/fail criteria met; no GitHub issue (enhancement-reviewer task, issue `0`).
- **Closed at (UTC):** 2026-07-25 20:31
---

# Backfill missing French (fr) i18n keys vs en

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`front/public/i18n/fr.json`** lags **`en.json`** by **~149** leaf keys. French is a supported UI language; missing strings fall back or show raw keys after recent auth OTP, kitchen stations, products/tax availability, orders/tax, and related work. Spanish (**`es`**) and German (**`de`**) are already at full leaf parity with `en`.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL docs_stale×14` all owned; `demo_tables_check=ok`; Unreleased filled (2 bullets); NEW backlog≈62 — improvement theme (i18n), not another stale-doc rewrite
- Flat key-diff heuristic: `en − fr` ≈ 149 missing (sample prefixes: `AUTH.*`, `KITCHEN_DISPLAY.*`, `ORDERS.*`, `PRODUCTS.*`, `MENU.*`)
- Open siblings own other locales only — do **not** merge:
  - **`NEW-0-20260723-1638-backfill-ca-i18n-missing-keys`** (Catalan)
  - **`NEW-0-20260723-1638-backfill-zh-cn-hi-i18n-missing-keys`** (zh-CN + hi)
  - **`NEW-0-20260723-1648-backfill-bg-i18n-missing-keys`** (Bulgarian)

## High-level instructions for coder

- Add every leaf key present in **`front/public/i18n/en.json`** but missing from **`fr.json`**, with proper French copy (not English paste-through unless the English string is a brand/proper noun)
- Prioritize user-visible surfaces: `AUTH.*`, `ORDERS.*`, `PRODUCTS.*`, `MENU.*`, `KITCHEN_DISPLAY.*`
- Keep JSON structure/ordering consistent with sibling locale files; no Angular code changes required unless a key path is wrong
- Do **not** invent new product strings; mirror `en` keys only
- Pass/fail: flat key-set diff `en − fr` is **0** (or only intentionally omitted keys documented in the task); spot-check UI in `fr` for login OTP and an orders/products settings surface

## Implementation notes (coder)

- Added all **149** missing leaf keys to **`front/public/i18n/fr.json`** with French copy (OTP placeholders `000000`, technical labels like `IP` / `OK`, and `Taxes (IVA)` kept as in EN where appropriate).
- Touched sections: `AUTH`, `KITCHEN_DISPLAY`, `MENU`, `ORDERS`, `PRODUCTS`, `REPORTS`, `RESERVATIONS`, `SETTINGS` (taxes, providers, OTP/security, kitchen stations, delivery integrations, UI modules), `USERS`, `WORKING_PLAN`.
- Reordered keys within those sections to follow **`en.json`** leaf order; no Angular code changes.
- Verified: `python3 scripts/check-i18n-locale-parity.py` reports **`fr OK`** (`missing=0`, `extra=0`); flat `en − fr` = **0**.
- Landing smoke: `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` → **RESULT: Landing version OK**.

## Testing instructions

### What to verify

1. Leaf key parity: every key in `front/public/i18n/en.json` exists in `front/public/i18n/fr.json`.
2. French copy is present (not English leftovers) for auth OTP, Settings → Taxes / Security / Providers / Kitchen stations, reservations overbooking/notes, products tax/availability, and orders open-menu / tax.
3. App still loads after the JSON edit.

### How to test

```bash
# From repo root — fr must be OK (other locales may still FAIL; out of scope)
python3 scripts/check-i18n-locale-parity.py 2>&1 | rg 'fr\s+'

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
fr = set(flatten(json.loads((root / "fr.json").read_text())))
print("missing", sorted(en - fr))
print("extra", sorted(fr - en))
assert en == fr
print("PASS en==fr")
PY

# Spot-check French (not English) for a few user-visible keys
python3 - <<'PY'
import json
from pathlib import Path

def get(d, path):
    cur = d
    for p in path.split("."):
        cur = cur[p]
    return cur

fr = json.loads(Path("front/public/i18n/fr.json").read_text())
en = json.loads(Path("front/public/i18n/en.json").read_text())
checks = [
    "AUTH.VERIFY_OTP",
    "SETTINGS.SECURITY",
    "SETTINGS.OTP_ENABLE_BUTTON",
    "RESERVATIONS.OVERBOOKED",
    "ORDERS.OPEN_MENU",
    "PRODUCTS.TAX_OVERRIDE",
]
for path in checks:
    fv, ev = get(fr, path), get(en, path)
    assert fv and fv != ev, (path, fv, ev)
    print(path, "=>", fv)
print("PASS French spot-check")
PY

# Smoke (stack up on HAProxy)
BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front
```

Optional UI spot-check: open the app, switch language to **Français**, visit login OTP (if enabled) and Settings → Taxes / Security — no raw `AUTH.*` / `SETTINGS.*` keys in the UI.

### Pass/fail criteria

- **Pass:** `fr` reports `OK missing=0 extra=0`; flat `en == fr` key sets; sample keys are French; landing smoke exits 0.
- **Fail:** any missing `fr` keys, English paste-through on the spot-check keys, or landing smoke failure.

## Test report

1. **Date/time (UTC):** 2026-07-25 20:30:07 start → 20:30:39 end. Log window: `docker logs --since 20m` on `pos-front` / `pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** `fr` leaf parity vs `en` (`check-i18n-locale-parity.py` + flat set equality); French (non-English) spot-check on AUTH/SETTINGS/RESERVATIONS/ORDERS/PRODUCTS keys; landing smoke that the app still loads.
4. **Results:**
   - Leaf key parity (`fr OK missing=0 extra=0`; `en == fr`, 2451 leaves): **PASS** — `python3 scripts/check-i18n-locale-parity.py` → `fr OK missing=0 extra=0`; flat diff `missing []` / `extra []`.
   - French copy (not English leftovers) on spot-check keys: **PASS** — e.g. `AUTH.VERIFY_OTP` → `Vérifier`, `SETTINGS.SECURITY` → `Sécurité`, `SETTINGS.OTP_ENABLE_BUTTON` → `Activer l'authentification à deux facteurs (OTP)`, `RESERVATIONS.OVERBOOKED` → `Sur-réservé`, `ORDERS.OPEN_MENU` → `Ouvrir le menu`, `PRODUCTS.TAX_OVERRIDE` → `Remplacer la taxe (IVA)`.
   - App loads after JSON edit (landing smoke): **PASS** — `npm run test:landing-version` exit 0; `curl /` → HTTP 200; `RESULT: Landing version OK`.
5. **Overall:** **PASS**
6. **Product owner feedback:** French locale is now at full leaf parity with English (2451 keys). Spot-checked OTP/security/overbooking/orders/products strings are real French, not English paste-through. Landing and demo login/nav smoke stayed green; no GitHub issue to update (enhancement-reviewer task).
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
   - `pos-front`: `Application bundle generation complete` (multiple rebuilds in window); only pre-existing `NG8107` optional-chain warnings in `menu.component.html` — no TS/NG build failure tied to `fr.json`.
   - `pos-back`: no `error` / `exception` / `traceback` / `500` lines in the 20m window.
   - Smoke: `>>> RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.` (exit 0). Note: browser console showed WebSocket `1008 Invalid authentication token` on kitchen/bar during nav — unrelated to i18n; smoke still passed.
