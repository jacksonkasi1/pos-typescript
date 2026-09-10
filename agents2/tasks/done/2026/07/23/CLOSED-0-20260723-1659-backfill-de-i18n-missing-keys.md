---
## Closing summary (TOP)

- **What happened:** German `de.json` lagged English by ~91 leaf keys across auth OTP, settings, reservations, products, and book validation.
- **What was done:** Added all 91 missing keys with German copy and aligned section key order to `en.json`; flat `en − de` is now 0; parity script reports `de OK`.
- **What was tested:** Leaf parity, German spot-check on six user-visible keys, and landing smoke all passed. Overall PASS.
- **Why closed:** All pass/fail criteria met; no GitHub issue (enhancement reviewer / issue 0).
- **Closed at (UTC):** 2026-07-25 20:20
---

# Backfill missing German (de) i18n keys vs en

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`front/public/i18n/de.json`** lags **`en.json`** by **~91** leaf keys. German is a primary supported UI language; missing strings fall back or show raw keys on auth OTP, settings (taxes/providers/OTP/security), reservations overbooking/notes, products tax/availability, and book validation. An earlier 008 note on the fr backfill task incorrectly claimed `de` was at full parity — it is not.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T16:59Z: `SIGNAL docs_stale×14` all owned; `demo_tables_check=ok`; Unreleased=2; NEW backlog≈65 — improvement theme (i18n), not another stale-doc rewrite
- Flat key-diff: `en − de` ≈ 91 (prefixes: `SETTINGS` ~53, `RESERVATIONS` ~16, `AUTH` ~7, `PRODUCTS` ~7, `BOOK` ~4, plus `ORDERS`/`MENU`/`REPORTS`)
- Open siblings own other locales only — do **not** merge:
  - **`NEW-0-20260723-1638-backfill-ca-i18n-missing-keys`**
  - **`NEW-0-20260723-1638-backfill-zh-cn-hi-i18n-missing-keys`**
  - **`NEW-0-20260723-1648-backfill-fr-i18n-missing-keys`**
  - **`NEW-0-20260723-1648-backfill-bg-i18n-missing-keys`**
  - **`CLOSED-0-20260723-1659-backfill-es-i18n-missing-keys`** (Spanish, same run — already closed)

## High-level instructions for coder

- Add every leaf key present in **`front/public/i18n/en.json`** but missing from **`de.json`**, with proper German copy (not English paste-through unless the English string is a brand/proper noun)
- Prioritize user-visible surfaces: `AUTH.*`, `SETTINGS.*` (taxes, providers, OTP, security), `RESERVATIONS.*`, `PRODUCTS.*`, `BOOK.*`
- Keep JSON structure/ordering consistent with sibling locale files; no Angular code changes required unless a key path is wrong
- Do **not** invent new product strings; mirror `en` keys only
- Pass/fail: flat key-set diff `en − de` is **0**; spot-check UI in `de` for login OTP and Settings → Taxes / Security

## Implementation notes (coder)

- Added all **91** missing leaf keys to **`front/public/i18n/de.json`** with German copy (OTP placeholders `000000`, technical labels like `IP` / `Fingerprint`, and `RAL5002 (Azul)` kept as in EN where appropriate).
- Touched sections: `AUTH`, `BOOK`, `MENU`, `ORDERS`, `PRODUCTS`, `REPORTS`, `RESERVATIONS`, `SETTINGS` (taxes, providers, OTP/security, public background).
- Reordered keys within those sections to follow **`en.json`** leaf order; no Angular code changes.
- Verified: `python3 scripts/check-i18n-locale-parity.py` reports **`de OK`** (`missing=0`, `extra=0`); flat `en − de` = **0**.
- Landing smoke: `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` → **RESULT: Landing version OK**.

## Testing instructions

### What to verify

1. Leaf key parity: every key in `front/public/i18n/en.json` exists in `front/public/i18n/de.json`.
2. German copy is present (not English leftovers) for auth OTP, Settings → Taxes / Security / Providers, reservations overbooking/notes, products tax/availability, and book validation.
3. App still loads after the JSON edit.

### How to test

```bash
# From repo root — de must be OK (other locales may still FAIL; out of scope)
python3 scripts/check-i18n-locale-parity.py 2>&1 | rg 'de\s+'

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
de = set(flatten(json.loads((root / "de.json").read_text())))
print("missing", sorted(en - de))
print("extra", sorted(de - en))
assert en == de
print("PASS en==de")
PY

# Spot-check German (not English) for a few user-visible keys
python3 - <<'PY'
import json
from pathlib import Path

def get(d, path):
    cur = d
    for p in path.split("."):
        cur = cur[p]
    return cur

de = json.loads(Path("front/public/i18n/de.json").read_text())
en = json.loads(Path("front/public/i18n/en.json").read_text())
checks = [
    "AUTH.VERIFY_OTP",
    "SETTINGS.SECURITY",
    "SETTINGS.TAXES",
    "SETTINGS.OTP_ENABLE_BUTTON",
    "RESERVATIONS.OVERBOOKED",
    "BOOK.INVALID_EMAIL",
]
for path in checks:
    dv, ev = get(de, path), get(en, path)
    assert dv and dv != ev, (path, dv, ev)
    print(path, "=>", dv)
print("PASS German spot-check")
PY

# Smoke (stack up on HAProxy)
BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front
```

Optional UI spot-check: open the app, switch language to **Deutsch**, visit login OTP (if enabled) and Settings → Taxes / Security — no raw `AUTH.*` / `SETTINGS.*` keys in the UI.

### Pass/fail criteria

- **Pass:** `de` reports `OK missing=0 extra=0`; flat `en == de` key sets; sample keys are German; landing smoke exits 0.
- **Fail:** any missing `de` keys, English paste-through on the spot-check keys, or landing smoke failure.

## Test report

1. **Date/time (UTC):** start 2026-07-25T20:19:30Z — end 2026-07-25T20:20:01Z. Log window: ~15m before end.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`).
3. **What was tested:** `de` leaf-key parity vs `en`; German (not English) spot-check on AUTH/SETTINGS/RESERVATIONS/BOOK keys; landing smoke after JSON edit.
4. **Results:**
   - Leaf key parity (`check-i18n-locale-parity.py` + flat `en == de`): **PASS** — `de OK missing=0 extra=0`; `missing []` / `extra []`; leaf_count=2451.
   - German copy spot-check (6 keys ≠ EN): **PASS** — e.g. `AUTH.VERIFY_OTP` → `Bestätigen`, `SETTINGS.SECURITY` → `Sicherheit`, `SETTINGS.TAXES` → `Steuern (IVA)`, `RESERVATIONS.OVERBOOKED` → `Überbucht`, `BOOK.INVALID_EMAIL` → German validation text.
   - App load / landing smoke: **PASS** — `home_http=200`; `npm run test:landing-version` → `RESULT: Landing version OK` (exit 0).
5. **Overall:** **PASS**
6. **Product owner feedback:** German locale is now at full key parity with English (2451 leaves). Spot-checked strings are proper German, not EN paste-through. No production/amvara9 deploy required for this locale JSON backfill; local HAProxy smoke is green.
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
   - `pos-front`: page reload / Angular NG8107 optional-chain warnings in `menu.component.html` (pre-existing; no TS/bundle failure during smoke).
   - `pos-back`: `GET /users/me`, `/tenant/settings`, `/orders`, `/saas/subscription` → **200 OK** during landing/nav smoke; no 5xx in window.
   - Note: browser WebSocket `1008 Invalid authentication token` appeared during smoke (known/non-blocking for this i18n task; landing script still exited 0).

**GitHub:** Issue **#0** (none) — no issue comment/labels.
