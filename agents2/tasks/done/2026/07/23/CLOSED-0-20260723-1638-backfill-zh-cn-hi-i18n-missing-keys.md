---
## Closing summary (TOP)

- **What happened:** zh-CN and hi locale files were missing ~189 keys vs en after Delivery/SaaS/auth work.
- **What was done:** Added all 189 missing leaf keys to `zh-CN.json` and `hi.json` with Simplified Chinese / Hindi translations; no product-code changes.
- **What was tested:** Locale parity script, flat en↔zh-CN/hi diffs, sample-string spot-checks, HAProxy JSON serve, and landing smoke — all PASS.
- **Why closed:** All pass/fail criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-25 21:04
---

# Backfill missing zh-CN and hi i18n keys vs en

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`front/public/i18n/zh-CN.json`** and **`hi.json`** each miss **~189** keys relative to **`en.json`**. Those locales stay listed as supported UI languages, so staff/guests can hit raw keys or English fallbacks after recent Delivery / SaaS / auth work. **`ur.json`** is already at parity with `en` (0 missing) — use it only as a structure reference, not a copy source for Chinese/Hindi.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL docs_stale×14` owned; demo OK; NEW backlog≈60 — improvement theme (i18n), not another stale-doc rewrite
- Key-diff: `en` has ~2404 leaf keys; `zh-CN` and `hi` each miss ~189; `ur` miss 0; `es`/`de` complete for the delivery-integration subset checked this run
- Sibling **`NEW-0-20260723-1638-backfill-ca-i18n-missing-keys`** owns Catalan only — do not merge
- No open root task filenames mention `zh-CN` / `hi` / Hindi / Chinese backfill

## High-level instructions for coder

- For **`zh-CN.json`** and **`hi.json`**, add every leaf key present in **`en.json`** and missing in that file, with appropriate Simplified Chinese / Hindi translations
- Prefer translating from `en` (or from `es` where meaning is clearer); do not leave empty strings
- No product-code changes; do not drop keys from `en` to “fix” the gap
- Pass/fail: key-set diff `en − zh-CN` and `en − hi` are **0**; briefly smoke the app with each language selected on login or Settings language switcher (landing or dashboard is enough)

## Implementation notes (coder)

- Added all **189** missing leaf keys to **`front/public/i18n/zh-CN.json`** (Simplified Chinese) and **`front/public/i18n/hi.json`** (Hindi): auth OTP, menu/customize, orders tax + open-menu, public take-away, Revolut payments, product availability/tax override, reports overbooking, reservations delay/policies/tech info, providers/taxes/OTP/UI modules, all `SETTINGS.DELIVERY_INTEGRATIONS_*`, reservation settings, Revolut merchant, co-owner hint, working-plan toasts.
- Reordered section keys to follow **`en.json`** order; existing zh-CN/hi strings left unchanged.
- Brand/proper nouns kept as in EN where appropriate (`000000`, `OK`, `IP`, `OTP`, `IVA`, `KDS`, `Google Authenticator`, `api_key`, `Revolut`, `RAL5002`).
- No Angular / backend code changes. One-shot merge helper used under **`tmp/backfill-zh-cn-hi-i18n.py`** (not part of product).
- Verified: flat `en − zh-CN` / `en − hi` = **0** / `extra` = **0**; `python3 scripts/check-i18n-locale-parity.py` → **PASS** (all locales OK).
- Landing smoke: `BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front` → **RESULT: Landing version OK**. Served `/i18n/zh-CN.json` and `/i18n/hi.json` show translated samples.

## Testing instructions

### What to verify

1. Leaf key parity: every key in `front/public/i18n/en.json` exists in `zh-CN.json` and `hi.json`.
2. Simplified Chinese / Hindi copy is present (not English leftovers) for auth OTP, orders tax, delivery integrations tab labels, working-plan toasts, and co-owner hint (except brand/placeholder literals).
3. App still loads after the JSON edits; locale files are served over HAProxy.

### How to test

```bash
# From repo root — all locales including zh-CN and hi must be OK
python3 scripts/check-i18n-locale-parity.py

# Flat diff must be empty both ways for zh-CN and hi
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
for loc in ("zh-CN", "hi"):
    keys = set(flatten(json.loads((root / f"{loc}.json").read_text())))
    print(loc, "missing", sorted(en - keys))
    print(loc, "extra", sorted(keys - en))
    assert en == keys
print("PASS en==zh-CN and en==hi")
PY

# Spot-check priority strings (not English paste-through except brand literals)
python3 - <<'PY'
import json
from pathlib import Path

def get(d, dotted):
    cur = d
    for p in dotted.split("."):
        cur = cur[p]
    return cur

en = json.loads(Path("front/public/i18n/en.json").read_text())
samples = [
    "AUTH.OTP_ENTER_CODE",
    "AUTH.BACK",
    "ORDERS.TAX",
    "SETTINGS.DELIVERY_INTEGRATIONS_TITLE",
    "SETTINGS.DELIVERY_INTEGRATIONS_TAB",
    "WORKING_PLAN.SAVED",
    "USERS.CO_OWNER_HINT",
]
brand_ok = {"OK", "IP", "000000"}
for loc in ("zh-CN", "hi"):
    data = json.loads(Path(f"front/public/i18n/{loc}.json").read_text())
    for k in samples:
        ev, lv = get(en, k), get(data, k)
        assert lv and (lv != ev or ev in brand_ok), (loc, k, ev, lv)
        print(loc, k, "=>", lv[:80])
print("PASS sample zh-CN / hi")
PY

# Optional: confirm HAProxy serves updated JSON
curl -s http://127.0.0.1:4202/i18n/zh-CN.json | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["AUTH"]["BACK"]=="返回"; print("zh-CN served OK")'
curl -s http://127.0.0.1:4202/i18n/hi.json | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["AUTH"]["BACK"]=="वापस"; print("hi served OK")'

# Smoke (stack up on HAProxy)
BASE_URL=http://127.0.0.1:4202 npm run test:landing-version --prefix front
```

### Pass/fail criteria

- **Pass:** `en − zh-CN` and `en − hi` empty; parity script shows both `OK`; sample strings are Simplified Chinese / Hindi (not English paste-through except brand/placeholder literals); landing smoke exits 0.
- **Fail:** any missing key, English paste-through on the spot-check keys (except brand/placeholder literals), or landing smoke failure.

## Test report

1. **Date/time (UTC):** 2026-07-25 21:02:48 – 21:03:37 UTC. Log window: `docker logs --since 10m` on `pos-front`, `pos-haproxy`, `pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; `BASE_URL=http://127.0.0.1:4202`; branch `development` (synced via `./scripts/git-sync-development.sh` before claim).
3. **What was tested:** Leaf key parity `en` vs `zh-CN`/`hi`; Simplified Chinese / Hindi spot-check on priority keys; HAProxy serve of locale JSON; landing smoke.
4. **Results:**
   - Leaf key parity (`python3 scripts/check-i18n-locale-parity.py`): **PASS** — `zh-CN` and `hi` both `OK` (missing=0, extra=0); all locales PASS.
   - Flat diff `en == zh-CN` and `en == hi`: **PASS** — missing/extra both `[]`.
   - Sample strings not English paste-through: **PASS** — e.g. zh-CN `AUTH.BACK`=`返回`, `ORDERS.TAX`=`税费`, `SETTINGS.DELIVERY_INTEGRATIONS_TITLE`=`外卖平台集成`; hi `AUTH.BACK`=`वापस`, `ORDERS.TAX`=`कर`, title=`डिलीवरी मार्केटप्लेस एकीकरण`.
   - HAProxy serves updated JSON: **PASS** — `GET /i18n/zh-CN.json` and `/i18n/hi.json` assert `AUTH.BACK` values; HTTP 200 in haproxy logs.
   - Landing smoke: **PASS** — `npm run test:landing-version` → `RESULT: Landing version OK; … sidebar nav OK` (exit 0).
5. **Overall:** **PASS**
6. **Product owner feedback:** Chinese and Hindi locale files are now at full key parity with English for the recent Delivery/SaaS/auth strings, so those UI languages should no longer show raw keys. Spot-checked copy reads as proper Simplified Chinese and Hindi rather than English leftovers. App load and landing/demo nav still healthy after the JSON-only change.
7. **URLs tested:**
   1. http://127.0.0.1:4202/i18n/zh-CN.json
   2. http://127.0.0.1:4202/i18n/hi.json
   3. http://127.0.0.1:4202/ (landing smoke)
   4. http://127.0.0.1:4202/dashboard
   5. http://127.0.0.1:4202/my-shift
   6. http://127.0.0.1:4202/staff/orders
   7. http://127.0.0.1:4202/tables
   8. http://127.0.0.1:4202/kitchen
   9. http://127.0.0.1:4202/bar
   10. http://127.0.0.1:4202/customers
8. **Relevant log excerpts:**
   - `pos-haproxy`: `GET /i18n/zh-CN.json` → 200; `GET /i18n/hi.json` → 200 (21:02:56 UTC).
   - `pos-front`: `Application bundle generation complete` (no TS/NG build errors in window); only pre-existing MenuComponent NG8107 warnings.
   - `pos-back`: no error/exception/500 lines in the 10m window for this check.
