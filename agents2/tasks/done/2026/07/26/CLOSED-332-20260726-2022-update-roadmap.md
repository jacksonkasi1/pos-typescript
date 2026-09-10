---
## Closing summary (TOP)

- **What happened:** Root ROADMAP.md was hard to scan and lagged the 2026-07-26 shipped product slices.
- **What was done:** Rewrote ROADMAP into Shipped / In progress / Deferred tables with a recurring refresh cadence; synced docs/0032 #52 statuses and agent-loop / 008 notes; CHANGELOG #332 entry.
- **What was tested:** Docs-only checks (structure, no stale Missing for today’s CLOSED features, links, cadence, changelog) — all PASS.
- **Why closed:** All testing criteria passed; docs-only delivery complete.
- **Closed at (UTC):** 2026-07-26 20:48
---

# Update roadmap

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/332
- **332**

## Problem / goal

Root **`ROADMAP.md`** is hard to use: long mixed completed/missing lists, rate-limiting strategy drafts still inline, and it lags the 2026-07-26 shipped slices (TSE, printing, split bill, offline cash, warehouses, import, promos, branch hub, birthday guest, guest feedback / VeriFactu, club loyalty, pricing, and related archives under `agents2/tasks/done/2026/07/26/`). Owner wants it **meaningful** and treated as a **recurring** maintenance task so agents do not need a manual reminder.

Cross-check: **`CHANGELOG.md`**, **`docs/0032-github-issues-roadmap.md`**, **`docs/README.md`**, and today’s CLOSED task summaries.

## High-level instructions for coder

- Rewrite **`ROADMAP.md`** into a short, scannable source of truth: clear **Shipped**, **In progress / next**, and **Deferred** sections (or equivalent). Prefer links to `docs/` and issue numbers over essay-length bullets.
- Sync completed items with what actually shipped (especially 2026-07-26 work and recent Delivery / waitlist / groups / SaaS / platform items already partially listed). Remove or relocate obsolete “strategy draft” blobs (e.g. long rate-limit howto) into the matching doc if still useful — keep ROADMAP as status, not a second implementation guide.
- Fix stale “Missing” rows that are now shipped (e.g. multi-warehouse / split-bill / offline cash MVP slices if still implied only under umbrella #52).
- Make refresh **recurring**: document a lightweight cadence (e.g. after each batch of CLOSED product issues, or weekly with **008** enhancement reviewer) in ROADMAP itself and/or a one-line note in `docs/agent-loop.md` / `docs/0032-github-issues-roadmap.md` — do not invent a new agent role unless needed.
- Do **not** paste secrets, env, or raw logs into the roadmap or this task.
- Append **Testing instructions** (docs-only checks: structure, no stale “missing” for today’s CLOSED features, links resolve).

## Implementation summary

- Rewrote root **`ROADMAP.md`**: Shipped / In progress / Deferred tables + recurring refresh section; removed ~300 lines of rate-limit strategy draft (still covered by `docs/0020`).
- Updated **`docs/0032-github-issues-roadmap.md`** #52 table: split bill, join tables, promos, birthdays statuses match 2026-07-26 CLOSED work.
- Cadence notes in **`ROADMAP.md`**, **`docs/agent-loop.md`**, **`agents2/008-enhancement-reviewer.md`**, and **`docs/README.md`** (0032 blurb).
- **`CHANGELOG.md`** `[Unreleased]` Changed entry for #332.

## Testing instructions

Docs-only verification (no app restart required):

1. **Structure:** Open `ROADMAP.md`. Confirm sections exist in order: **How to keep this current**, **Shipped**, **In progress / next**, **Deferred**, **Related**. Confirm there is **no** long “Recommended Rate Limiting Strategy” / env-var checklist blob (rate limits belong in `docs/0020-rate-limiting-production.md`).
2. **No stale missing for 2026-07-26 CLOSED features:** In `ROADMAP.md` Shipped table and `docs/0032-github-issues-roadmap.md` #52 table, confirm these are **not** listed as Not started / Missing: multi-warehouse (#320), split bill (#318/#331), offline cash MVP (#319), CSV migration (#321), price promos (#322), branch hub (#323), guest birthdays (#324), guest feedback (#325), VeriFactu prep (#326), club loyalty (#327), hardware printing (#317), TSE Phase 1 (#316), floor-plan table join (`docs/0051`).
3. **Links resolve:** From repo root, confirm these paths exist: `docs/0032-github-issues-roadmap.md`, `docs/0020-rate-limiting-production.md`, `docs/0071-split-bill.md`, `docs/0068-price-promotions.md`, `docs/0051-table-groups-mvp.md`, `docs/0066-club-loyalty.md`, `docs/agent-loop.md`, `CHANGELOG.md`.
4. **Recurring cadence:** `ROADMAP.md` “How to keep this current” mentions CLOSED batches and agent **008**; `docs/agent-loop.md` Related section links `ROADMAP.md`; `agents2/008-enhancement-reviewer.md` “Docs vs code” mentions roadmap drift → queue `FEAT-0-…-update-roadmap.md`.
5. **Changelog:** `CHANGELOG.md` `[Unreleased]` → Changed contains a Roadmap (#332) line.

## Test report

1. **Date/time (UTC):** 2026-07-26 20:47:06 – 20:47:22 UTC. Log window: same (docs-only; no app exercise).
2. **Environment:** branch `development` (synced via `./scripts/git-sync-development.sh`). Compose up locally (`docker-compose.yml` + `docker-compose.dev.yml`, HAProxy `http://127.0.0.1:4202`) but **not used** — verification was filesystem/docs only. `BASE_URL`: N/A.
3. **What was tested:** Testing instructions §1–5 (structure, no stale Missing for 2026-07-26 CLOSED features, required paths exist, recurring cadence notes, CHANGELOG `#332` line).
4. **Results:**
   - Structure (sections + no rate-limit strategy blob): **PASS** — `ROADMAP.md` has How to keep this current → Shipped → In progress / next → Deferred → Related; `rg` found no “Recommended Rate Limiting Strategy” / env checklist blob (rate limits pointed at `docs/0020`).
   - No stale Missing for 2026-07-26 CLOSED features: **PASS** — #316–#327 / #318/#331 / floor-plan join (`docs/0051`) appear under Shipped (or Partial / MVP shipped|started in `docs/0032` #52 table). Only unrelated “Not started” rows remain (#53 kitchen SLAs; Uber Eats under #52).
   - Links resolve: **PASS** — all required paths exist: `docs/0032-github-issues-roadmap.md`, `docs/0020-rate-limiting-production.md`, `docs/0071-split-bill.md`, `docs/0068-price-promotions.md`, `docs/0051-table-groups-mvp.md`, `docs/0066-club-loyalty.md`, `docs/agent-loop.md`, `CHANGELOG.md`.
   - Recurring cadence: **PASS** — `ROADMAP.md` “How to keep this current” cites CLOSED batches + agent **008**; `docs/agent-loop.md` Related links `ROADMAP.md`; `agents2/008-enhancement-reviewer.md` Docs vs code queues `FEAT-0-…-update-roadmap.md` on drift.
   - Changelog: **PASS** — `CHANGELOG.md` `[Unreleased]` → Changed has Roadmap (#332) line.
5. **Overall:** **PASS**
6. **Product owner feedback:** Roadmap is now scannable and aligned with today’s CLOSED product slices. Recurring refresh via **008** / CLOSED batches should stop this file from rotting again. No product/runtime risk — docs-only change.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A for pass criteria (docs-only). Containers were healthy (`pos-front`/`pos-back` Up); no test-driven API/UI traffic for this task.

