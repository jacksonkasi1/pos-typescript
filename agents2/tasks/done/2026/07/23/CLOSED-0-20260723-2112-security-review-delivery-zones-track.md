---
## Closing summary (TOP)

- **What happened:** SECURITY-REVIEW lagged shipped Satisfecho Delivery track/config surfaces and still claimed a ~1h public_order_token.
- **What was done:** Updated `docs/SECURITY-REVIEW.md` for zones/fees, config GET, delivery-status GET, and 24h token (2h unpaid residual); fixed stale token-expiry comment in `main.py`; spot-checked rate limits — no product gap NEW filed.
- **What was tested:** Doc `rg` checks, history delta / no pentest claim, `@public_menu_ip_limit` on config + delivery-status, and `test_public_satisfecho_delivery.py` (14 passed) — overall PASS.
- **Why closed:** All pass/fail criteria met; tester overall PASS.
- **Closed at (UTC):** 2026-07-25 23:03
---

# Security-review delta for delivery zones, fees, and track

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**2.1.32 / #306** shipped delivery fee/radius/postal validation, `GET …/satisfecho-delivery-config`, token-gated `GET …/delivery-status` (track page), and extended `public_order_token` lifetime to **24h**, but **`docs/SECURITY-REVIEW.md`** still describes public Satisfecho Delivery as create-only with token **~1h**. Re-audits miss the track poll surface and the wrong TTL.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T21:12Z: SIGNAL `docs_stale` / `changelog_sparse` basenames owned; Unreleased empty post-**2.1.32** cut (false positive); `demo_tables_check=ok`; NEW≈118
- `docs/0053` documents 24h token + track + config; `docs/SECURITY-REVIEW.md` §4 still says `public_order_token` (~1h) and only lists `POST …/satisfecho-delivery`
- Code: `@public_menu_ip_limit` on config + delivery-status (`back/app/main.py`); tests in `back/tests/test_public_satisfecho_delivery.py`
- Sibling **`NEW-0-20260723-1734-security-review-tenantproduct-delivery-ids`** owns TenantProduct IDOR only — do **not** merge
- Sibling **`NEW-0-20260723-1744-security-review-waiting-list-and-groups`** owns waitlist/groups — do not merge
- Sibling **2103** NEWs own smoke alias, demo fee seed, docs/README 0053 blurb — not SECURITY-REVIEW

## High-level instructions for coder

- Update **`docs/SECURITY-REVIEW.md`** Public Satisfecho Delivery row (and residual notes / changelog table if present) to cover:
  - Zone/fee validation on public create (postal and/or radius; fee snapshotted on order)
  - `GET /public/tenants/{tenant_id}/satisfecho-delivery-config` (no secrets; rate-limited)
  - `GET /public/orders/{order_id}/delivery-status?public_order_token=` (coarse status only; token-gated; rate-limited)
  - Correct **`public_order_token` lifetime = 24h** (pay + track); keep unpaid create TTL **2h** as residual
- Add a short **2026-07-23** delta line in the review history table; do not claim a full pentest
- Pass/fail: `rg -n 'delivery-status|24h|satisfecho-delivery-config|postal|fee' docs/SECURITY-REVIEW.md` hits; no product code required unless a real control gap is found (then file a separate NEW)

## Coder notes (2026-07-26)

- Spot-checked `back/app/main.py`: `PUBLIC_DELIVERY_ORDER_TOKEN_EXPIRY = 86400`; `@public_menu_ip_limit` on create, `satisfecho-delivery-config`, and `delivery-status`. No missing decorators; no separate NEW filed.
- Updated `docs/SECURITY-REVIEW.md` §4 Public Satisfecho Delivery row, rate-limiting note, unpaid residual (2h cleanup vs 24h token), and 2026-07-23 history delta.
- Corrected stale comment above `PUBLIC_DELIVERY_ORDER_TOKEN_EXPIRY` (was “pay ~1h”).

## Testing instructions

### What to verify

- `docs/SECURITY-REVIEW.md` documents delivery zones/fees, config GET, delivery-status GET, and **24h** `public_order_token` (unpaid TTL still **2h**).
- No claim of a full pentest; history has a 2026-07-23 delta line.
- Config + delivery-status remain rate-limited in code (`@public_menu_ip_limit`).

### How to test

```bash
# From repo root
rg -n 'delivery-status|24h|satisfecho-delivery-config|postal|fee' docs/SECURITY-REVIEW.md
rg -n 'PUBLIC_DELIVERY_ORDER_TOKEN_EXPIRY|satisfecho-delivery-config|delivery-status' back/app/main.py

# Optional: public delivery regression (Docker stack up)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec back \
  python3 -m pytest back/tests/test_public_satisfecho_delivery.py -q
```

(If pytest path inside container is `/app/tests/...`, use `python3 -m pytest tests/test_public_satisfecho_delivery.py -q`.)

### Pass/fail criteria

- **Pass:** `rg` hits show config + delivery-status + 24h + postal/fee wording; history table includes 2026-07-23 #306 delta; no residual “~1h” token claim for public delivery in SECURITY-REVIEW.
- **Fail:** SECURITY-REVIEW still says create-only / ~1h token, or omits config/track surfaces.

## Test report

1. **Date/time (UTC):** start 2026-07-25T23:02:25Z — end 2026-07-25T23:02:33Z. Log window: `docker logs --since 2026-07-25T23:02:00Z pos-back`.
2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; branch `development`; no browser (`BASE_URL` N/A).
3. **What was tested:** SECURITY-REVIEW coverage of delivery zones/fees, config GET, delivery-status GET, 24h token vs 2h unpaid TTL; history 2026-07-23 delta without pentest claim; `@public_menu_ip_limit` on config + delivery-status; optional public delivery pytest.
4. **Results:**
   - SECURITY-REVIEW documents postal/fee, `satisfecho-delivery-config`, `delivery-status`, **24h** token, unpaid **2h** residual — **PASS** (`rg` hits at lines 73, 77, 82).
   - History table 2026-07-23 #306 delta; “Not a penetration test” — **PASS** (line 136).
   - No residual “~1h” / create-only public-delivery claim in SECURITY-REVIEW — **PASS** (`rg` no matches for `~1h|1 hour|create-only`).
   - Code: `PUBLIC_DELIVERY_ORDER_TOKEN_EXPIRY = 86400`; `@public_menu_ip_limit()` on config + delivery-status (+ create) — **PASS** (`main.py` ~877, 1187–1191, 1226–1230, 1283–1288).
   - `pytest tests/test_public_satisfecho_delivery.py -q` — **PASS** (14 passed in 1.04s).
5. **Overall:** **PASS**
6. **Product owner feedback:** Security review docs now match the shipped track/config surfaces and 24h pay+track token; unpaid cleanup still correctly called out as 2h. Safe for auditors and re-sweeps; no product gap found in this pass.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):**
```
# pytest (compose exec back)
..............                                                           [100%]
14 passed, 1 warning in 1.04s

# pos-back during window (no errors related to this verification)
INFO:     172.30.0.5:43976 - "GET /docs HTTP/1.0" 200 OK
```
