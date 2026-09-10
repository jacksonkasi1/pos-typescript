---
## Closing summary (TOP)

- **What happened:** Catalan (`ca.json`) lagged English by ~132 i18n keys (auth OTP, orders/tax, delivery integrations, etc.).
- **What was done:** All 132 missing leaf keys were added with Catalan copy; section order aligned to `en.json`; parity `en − ca` is 0 / `ca OK`.
- **What was tested:** Key parity, Catalan spot-checks, and landing smoke all **PASS** (tester report 2026-07-25).
- **Why closed:** All pass/fail criteria met; no GitHub issue (enhancement reviewer, issue `0`).
- **Closed at (UTC):** 2026-07-25 20:52
---

# Backfill missing Catalan (ca) i18n keys vs en

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`front/public/i18n/ca.json`** lags **`en.json`** by **~132** keys. Catalan is a supported UI language; missing strings fall back or show raw keys for auth OTP, orders/tax, products availability, and all **`SETTINGS.DELIVERY_INTEGRATIONS_*`** marketplace-integration labels (24 keys). Spanish (**`es`**) and German (**`de`**) already have the delivery-integration set.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL docs_stale×14` all owned; `demo_tables_check=ok`; Unreleased filled; NEW backlog≈60 — no more stale-doc banner tasks this run
- Key-diff heuristic: `en` vs `ca` → 132 missing; delivery-ish subset = 24 `SETTINGS.DELIVERY_INTEGRATIONS_*`; `es`/`de` missing 0 of those 140 delivery-ish keys
- No open `agents2/tasks/*i18n*` owns Catalan backfill (historical CLOSED i18n tasks are product features, not this parity gap)
- Sibling **`NEW-0-20260723-1638-backfill-zh-cn-hi-i18n-missing-keys`** covers other locales — do not merge

## High-level instructions for coder

- Add every key present in **`front/public/i18n/en.json`** but missing from **`ca.json`**, with proper Catalan copy (not English paste-through unless the English string is a brand/proper noun)
- Prioritize user-visible surfaces first: `AUTH.*`, `ORDERS.*`, `PRODUCTS.*`, `MENU.*`, then `SETTINGS.DELIVERY_INTEGRATIONS_*`
- Keep JSON structure/ordering consistent with sibling locale files; no Angular code changes required unless a key path is wrong
- Do **not** invent new product strings; mirror `en` keys only
- Pass/fail: Python/jq key-set diff `en − ca` is **0** (or only intentionally omitted keys documented in the task); spot-check UI in `ca` for login OTP and Settings → Delivery integrations tab if that module is enabled

## Implementation notes (coder)

- Added all **132** missing leaf keys to **`front/public/i18n/ca.json`** with Catalan copy (auth OTP, orders/tax, products availability, reservations, reports overbooking, providers/taxes/OTP/UI modules, all `SETTINGS.DELIVERY_INTEGRATIONS_*`, `USERS.CO_OWNER_HINT`, `WORKING_PLAN` toasts).
- Reordered section keys to follow **`en.json`** order; existing Catalan strings left unchanged.
- Brand/proper nouns kept as in EN where appropriate (`000000`, `OK`, `IP`, `OTP`, `IVA`, `TPV`, `KDS`, `Google Authenticator`, `api_key`).
- No Angular code changes. Sibling **zh-CN/hi** backfill remains out of scope (parity script may still FAIL overall until that task lands).
- Verified: flat `en − ca` = **0** / `extra` = **0**; `python3 scripts/check-i18n-locale-parity.py` reports **`ca OK`**.
- Landing smoke: `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` → **RESULT: Landing version OK**.

## Testing instructions

### What to verify

1. Leaf key parity: every key in `front/public/i18n/en.json` exists in `front/public/i18n/ca.json`.
2. Catalan copy is present (not English leftovers) for auth OTP, orders tax, delivery integrations tab labels, working-plan toasts, and co-owner hint.
3. App still loads after the JSON edit.

### How to test

```bash
# From repo root — ca must be OK (hi/zh-CN may still FAIL; out of scope)
python3 scripts/check-i18n-locale-parity.py 2>&1 | rg 'ca\s+'

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
ca = set(flatten(json.loads((root / "ca.json").read_text())))
print("missing", sorted(en - ca))
print("extra", sorted(ca - en))
assert en == ca
print("PASS en==ca")
PY

# Spot-check priority Catalan strings (not English paste-through)
python3 - <<'PY'
import json
from pathlib import Path
ca = json.loads(Path("front/public/i18n/ca.json").read_text())
en = json.loads(Path("front/public/i18n/en.json").read_text())
samples = [
    "AUTH.OTP_ENTER_CODE",
    "ORDERS.TAX",
    "SETTINGS.DELIVERY_INTEGRATIONS_TITLE",
    "SETTINGS.DELIVERY_INTEGRATIONS_TAB",
    "WORKING_PLAN.SAVED",
]
def get(d, dotted):
    cur = d
    for p in dotted.split("."):
        cur = cur[p]
    return cur
for k in samples:
    ev, cv = get(en, k), get(ca, k)
    assert cv and (cv != ev or ev in ("OK", "IP", "000000")), (k, ev, cv)
    print(k, "=>", cv[:80])
print("PASS sample Catalan")
PY

# Smoke (stack up on HAProxy)
BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front
```

### Pass/fail criteria

- **Pass:** `en − ca` empty; parity line shows `ca OK`; sample strings are Catalan; landing smoke exits 0.
- **Fail:** any missing key, English paste-through on the spot-check keys (except brand/placeholder literals), or landing smoke failure.

## Test report

1. **Date/time (UTC):** 2026-07-25 20:51:24 – 20:52:00 UTC (log window ~20:51Z onward).
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh`). Stack: pos-front / pos-back / pos-haproxy / pos-postgres / pos-redis up.
3. **What was tested:** Leaf key parity `en` vs `ca`; Catalan (not English paste-through) on priority samples; landing smoke after JSON edit.
4. **Results:**
   - Leaf key parity (`en − ca` / `ca − en` empty; 2451 keys each): **PASS** — `missing []` / `extra []` / `PASS en==ca`.
   - Parity script `ca OK`: **PASS** — `ca       OK      missing=   0  extra=   0`.
   - Catalan spot-check (AUTH OTP, ORDERS.TAX, delivery integrations title/tab, WORKING_PLAN.SAVED, USERS.CO_OWNER_HINT): **PASS** — e.g. `AUTH.OTP_ENTER_CODE` → Catalan; `ORDERS.TAX` Tax→IVA; `SETTINGS.DELIVERY_INTEGRATIONS_TAB` → Integracions; 23/24 delivery-integration strings translated (`STATUS_OK` remains brand `OK`).
   - App loads / landing smoke: **PASS** — `npm run test:landing-version` → `RESULT: Landing version OK`; `curl /` → 200; HAProxy serves `/i18n/ca.json` with Catalan OTP + Integracions.
5. **Overall:** **PASS**
6. **Product owner feedback:** Catalan is now key-parity with English for all 2451 leaves, including OTP, tax, and marketplace delivery-integration labels. No product code changes were required; the app still loads and navigates on local HAProxy. Sibling zh-CN/hi gaps remain out of scope and do not block this task.
7. **URLs tested:**
   1. http://127.0.0.1:4202/
   2. http://127.0.0.1:4202/dashboard
   3. http://127.0.0.1:4202/my-shift
   4. http://127.0.0.1:4202/staff/orders
   5. http://127.0.0.1:4202/tables
   6. http://127.0.0.1:4202/kitchen
   7. http://127.0.0.1:4202/bar
   8. http://127.0.0.1:4202/customers
   9. http://127.0.0.1:4202/i18n/ca.json
8. **Relevant log excerpts:**
   - Landing smoke: `>>> RESULT: Landing version OK; demo restaurant card OK; demo login (tenant=1) OK; sidebar nav OK.`
   - Parity: `ca       OK      missing=   0  extra=   0`
   - Served JSON: `AUTH.OTP_ENTER_CODE= Introdueix el codi de 6 dígits…`; `DELIVERY_INTEGRATIONS_TAB= Integracions`
   - pos-back: no error/exception/traceback in recent tail for this window.
   - pos-front: only pre-existing NG8107 optional-chain warnings in `menu.component.html` (unrelated to i18n); no TS/build failure from this change.
