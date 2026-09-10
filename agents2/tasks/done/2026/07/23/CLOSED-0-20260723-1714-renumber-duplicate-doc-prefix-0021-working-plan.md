---
## Closing summary (TOP)

- **What happened:** Duplicate `docs/0021-` prefix between the living working-plan guide and the pre-build implementation plan caused ambiguous agent/human shortcuts.
- **What was done:** Renamed the implementation plan to `docs/0060-working-plan-implementation-plan.md` with a historical banner, kept living `docs/0021-working-plan.md`, and updated `docs/README.md` Implementation plans rows.
- **What was tested:** Docs-only checks all **PASS** (single `0021-*.md`, `0060` exists with banner, README lists both, no stale basename under `docs/`).
- **Why closed:** All pass/fail criteria met; tester overall **PASS**.
- **Closed at (UTC):** 2026-07-26 08:47
---

# Renumber duplicate docs prefix 0021 (working-plan pair)

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Two living files share **`0021-`**: **`docs/0021-working-plan.md`** (current guide) and **`docs/0021-working-plan-implementation-plan.md`** (pre-build plan). Agent “open 0021” shortcuts and Feature-guide indexes stay ambiguous. Prior renumber NEW explicitly deferred this pair; the mark-historical NEW only adds a banner and does **not** fix the numeric clash.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23T17:14Z: `SIGNAL docs_stale×14` all owned; `demo_tables_check=ok`; Unreleased empty post-2.1.28 (changelog_sparse owned by preflight-after-cut NEW); NEW backlog≈68
- On disk: `docs/0021-working-plan.md` + `docs/0021-working-plan-implementation-plan.md`
- **`NEW-0-20260723-0639-renumber-duplicate-doc-prefixes-0018-0024-0025`** says do not touch `0021-*` (deferred)
- **`NEW-0-20260722-1412-mark-0021-working-plan-impl-historical`** owns banner/status only — keep that scope; this task is **rename + link fix**

## High-level instructions for coder

- Keep **`docs/0021-working-plan.md`** as the living **0021** guide
- Renumber **`docs/0021-working-plan-implementation-plan.md`** to the next free `006x` id (**0060+** — **0055** public-seo; **0056–0058** gmail / deploy-css / overbooking-scenario; **0059** platform-operator portal)
- Update **`docs/README.md`** Implementation plans row and any in-repo links (`rg` under `docs/`, `AGENTS.md`, open `agents2/tasks/NEW-0-*` that cite the old path)
- Preserve / finish the historical banner from the mark-0021 NEW if still open (one short top callout pointing at living 0021)
- No product code changes
- Pass/fail: exactly one `docs/0021-*.md`; README + `rg` for the old implementation-plan filename under `docs/` is clean

## Coder notes (2026-07-26)

- Renamed **`docs/0021-working-plan-implementation-plan.md`** → **`docs/0060-working-plan-implementation-plan.md`**
- Added historical / pre-build banner pointing at living **`0021-working-plan.md`**
- Updated **`docs/README.md`** Implementation plans: clarified **0021** as living guide; added **0060** historical row
- Updated sibling **`NEW-0-20260722-1412-mark-0021-working-plan-impl-historical`** paths (banner already applied here — that NEW is verify/cancel)

## Testing instructions

### What to verify

- Only one `docs/0021-*.md` remains (the living working-plan guide).
- Pre-build plan lives at **`docs/0060-working-plan-implementation-plan.md`** with a top historical banner linking to **0021**.
- **`docs/README.md`** Implementation plans lists both **0021** (current) and **0060** (historical); links resolve.
- No active references to the old basename `0021-working-plan-implementation-plan` under **`docs/`**.
- No product code / `back/` / `front/` changes required for this task.

### How to test

From repo root:

```bash
ls -1 docs/0021-*.md
# expect: docs/0021-working-plan.md only

test -f docs/0060-working-plan-implementation-plan.md && head -n 5 docs/0060-working-plan-implementation-plan.md

rg -n '0021-working-plan-implementation-plan' docs/ || true
# expect: no matches

rg -n '0021-working-plan\.md|0060-working-plan' docs/README.md
```

Optional: open `docs/README.md` Implementation plans rows in a Markdown preview and click both links.

### Pass/fail criteria

- **Pass:** Exactly one `docs/0021-*.md`; `0060` file exists with historical banner → `0021-working-plan.md`; README rows for 0021 + 0060; `rg '0021-working-plan-implementation-plan' docs/` empty; docs-only change.
- **Fail:** Duplicate `0021-` files remain, broken README links, missing banner, or old basename still referenced under `docs/`.

## Test report

1. **Date/time (UTC):** 2026-07-26 08:47:24 – 08:47:33 UTC. Log window N/A (docs-only; no runtime change).
2. **Environment:** Local repo on branch `development` @ `92cdf75d`. Compose up (`pos-back`/`pos-front` healthy) but unused. No `BASE_URL` (no browser).
3. **What was tested:** Duplicate `0021-` docs prefix resolved; living guide vs historical impl plan; README index; no stale basename under `docs/`; docs-only scope.
4. **Results:**
   - Exactly one `docs/0021-*.md` (`0021-working-plan.md`) — **PASS** (`ls -1 docs/0021-*.md` → 1 file).
   - `docs/0060-working-plan-implementation-plan.md` exists with historical banner linking to `0021-working-plan.md` — **PASS** (`head` shows banner + relative link).
   - `docs/README.md` Implementation plans lists **0021** (current) and **0060** (historical); both targets exist — **PASS** (lines 78–79).
   - `rg '0021-working-plan-implementation-plan' docs/` empty — **PASS**.
   - Docs-only (no `back/` / `front/` product edits for this change) — **PASS** (`git diff --stat` → `docs/` rename + README only).
5. **Overall:** **PASS**
6. **Product owner feedback:** The numeric clash is gone: agents and humans can open `0021` for the living working-plan guide without hitting the old pre-build plan. Historical context is preserved under `0060` with a clear pointer back to current behaviour. README rows make the split obvious.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts:** N/A — docs-only verification; no container log evidence required.

