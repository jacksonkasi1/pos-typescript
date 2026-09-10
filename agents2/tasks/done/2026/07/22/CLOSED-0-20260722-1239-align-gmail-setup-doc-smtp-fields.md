---
## Closing summary (TOP)

- **What happened:** Docs-only task to align `docs/0018-gmail-setup.md` §5 with Settings SMTP fields so operators can configure Gmail without guessing host/port/TLS.
- **What was done:** §5 rewritten as “Enter SMTP settings in POS” with a field→value table (`smtp.gmail.com`, `587`, TLS on, App Password, optional From); Notes note host/port/TLS are required; siblings **0005** / **0030** left unchanged.
- **What was tested:** Tester verified §5 table + Notes via `rg` and `git diff`; all pass criteria **PASS**; no `back/` / `front/` changes.
- **Why closed:** All criteria passed.
- **Closed at (UTC):** 2026-07-26 06:35
---

# Align Gmail setup doc with Settings SMTP fields

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

**`docs/0018-gmail-setup.md`** tells operators to enter a “Gmail address” and “SMTP password” only. The Settings UI actually requires **SMTP host, port, TLS, user, and password** (plus optional From email / From name). Operators following 0018 alone can leave host/port empty and fail to send mail. Sibling docs (**0005**, **0030**) already describe the full SMTP shape.

## Evidence (008 preflight / review)

- `SIGNAL docs_stale` — **`docs/0018-gmail-setup.md`** untouched >90d while Settings SMTP UI is live
- Settings Email section: `smtp_host`, `smtp_port`, `smtp_use_tls`, `smtp_user`, `smtp_password`, `email_from`, `email_from_name` (`front/src/app/settings/settings.component.ts`)
- 0018 §5 still says “Gmail address” / “SMTP password” without host/port/TLS defaults
- Cross-check: `docs/0005-email-sending-options.md` and `docs/0030-reservation-confirmation-email-troubleshooting.md` already list `smtp.gmail.com` / `587`

## High-level instructions for coder

- Update **only** **`docs/0018-gmail-setup.md`** §5 (and a short Notes bullet if needed) so Gmail setup maps 1:1 to Settings fields:
  - Host `smtp.gmail.com`, port `587`, TLS on, user = Gmail address, password = 16-char App Password
  - Optional From email / From name
- Keep the App Password / 2FA steps; do not rewrite **0005** / **0030**
- Pass criteria: a reader of 0018 can fill every Settings SMTP field for Gmail without opening another doc; no product code changes

## Implementation notes (coder)

- Updated **`docs/0018-gmail-setup.md`** §5: renamed to “Enter SMTP settings in POS”; added a field→value table for host `smtp.gmail.com`, port `587`, TLS on, username = Gmail, password = App Password, optional From email / From name (labels aligned with Settings i18n).
- Added Notes bullet that host/port/TLS are required (not only user/password).
- Left §§1–4 (account, 2FA, App Password) and sibling docs **0005** / **0030** unchanged. No product code.

## Testing instructions

### What to verify
- A reader of **`docs/0018-gmail-setup.md`** alone can fill every Settings Email SMTP field for Gmail (host, port, TLS, user, password, optional From).
- §5 no longer says only “Gmail address” / “SMTP password”.
- **0005** and **0030** were not rewritten.

### How to test
```bash
# From repo root
rg -n 'smtp\.gmail\.com|SMTP host|Use TLS|587' docs/0018-gmail-setup.md
rg -n 'Gmail address:' docs/0018-gmail-setup.md   # should find no matches in §5
# Confirm siblings untouched for this task:
git diff --stat -- docs/0005-email-sending-options.md docs/0030-reservation-confirmation-email-troubleshooting.md
```

### Pass/fail criteria
- **Pass:** §5 table (or equivalent) lists host/port/TLS/user/password (+ optional From); Notes mention host/port required; `rg` finds `smtp.gmail.com` and `587` in 0018; no product (`back/` / `front/`) changes for this task.
- **Fail:** §5 still omits host/port/TLS, or 0005/0030 were rewritten, or product code changed.

## Test report

1. **Date/time (UTC):** 2026-07-26 06:34:48 – 06:34:55 UTC. Log window: N/A (docs-only verification; no container exercise).
2. **Environment:** Local git worktree on branch `development` @ `c9f9095b`. Compose/BASE_URL unused. Working tree had the expected uncommitted edit to `docs/0018-gmail-setup.md` only for this change (siblings and `back/`/`front/` clean).
3. **What was tested:** Reader of `docs/0018-gmail-setup.md` alone can fill every Settings Email SMTP field for Gmail; §5 no longer limited to address/password; **0005** / **0030** not rewritten; no product code for this task.
4. **Results:**
   - §5 field→value table (host/port/TLS/user/password + optional From) — **PASS** — lines 42–56 list SMTP host `smtp.gmail.com`, port `587`, Use TLS on, username, App Password, From email/name.
   - Notes mention host/port/TLS required — **PASS** — Notes bullet “Host / port / TLS required” at line 65.
   - `rg` finds `smtp.gmail.com` and `587` in 0018 — **PASS** — matches at lines 50–51, 65.
   - §5 no longer “Gmail address” / “SMTP password” only — **PASS** — `rg -n 'Gmail address:' docs/0018-gmail-setup.md` exit 1 (no matches); section titled “Enter SMTP settings in POS”.
   - **0005** / **0030** not rewritten — **PASS** — `git diff --stat` empty for both files.
   - No `back/` / `front/` product changes for this task — **PASS** — `git diff --name-only -- back/ front/` empty (0 paths).
5. **Overall:** **PASS**
6. **Product owner feedback:** Operators can configure Gmail from 0018 alone without guessing host/port/TLS. The table matches the Settings Email SMTP controls. Sibling troubleshooting/research docs were correctly left alone.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A — docs-only; no `pos-front` / `pos-back` exercise required.

