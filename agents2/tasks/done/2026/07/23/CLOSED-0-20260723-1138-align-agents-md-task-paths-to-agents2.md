---
## Closing summary (TOP)

- **What happened:** Live agent docs still pointed at legacy `agents/tasks/` while the queue lives under `agents2/tasks/`.
- **What was done:** Updated `AGENTS.md` and two always-applied cursor rules to name `agents2/tasks/` (and `agents2/TASKS-README.md` where relevant); left sibling docs and product code untouched.
- **What was tested:** `rg` checks confirmed no live-queue `agents/tasks` hits in the three files, each references `agents2/tasks`, and security wording stayed intact — **PASS**.
- **Why closed:** All pass/fail criteria met; docs/rules-only verification complete.
- **Closed at (UTC):** 2026-07-26 02:52
---

# Align AGENTS.md and cursor-rule task paths to agents2

## GitHub Issues
- **Issue:** (none — enhancement reviewer)
- **0**

## Problem / goal

Live agent queue is **`agents2/tasks/`** / **`agents2/TASKS-README.md`**, but root **`AGENTS.md`** still tells agents to sync/edit **`agents/tasks/`**. Two always-applied cursor rules also name the legacy path. Agents following AGENTS.md alone look in the wrong tree. Sibling NEWs already cover **`docs/agent-loop.md`** and **`docs/agent-cursor-rules.md`** — not these files.

## Evidence (008 preflight / review)

- Weekly sweep 2026-07-23: `SIGNAL docs_stale×14` already owned; queue-health / path-drift scan under NEW≈51
- `rg 'agents/tasks' AGENTS.md` — Branches bullet still says task markdown under **`agents/tasks/`**
- `.cursor/rules/agent-response-language.mdc` and `.cursor/rules/security-untrusted-input-no-exfiltration.mdc` still cite **`agents/tasks/`** for the live queue
- Related open: **`NEW-0-20260723-0752-align-agent-loop-paths-to-agents2`** (agent-loop only); **`NEW-0-20260722-1412-fix-agent-cursor-rules-task-paths`** (agent-cursor-rules catalog only)

## High-level instructions for coder

- In **`AGENTS.md`**, change active-queue wording from **`agents/tasks/`** → **`agents2/tasks/`** (and point at **`agents2/TASKS-README.md`** if a README is mentioned)
- In the two cursor rules above, name **`agents2/tasks/`** for the live queue (keep any intentional “do not put secrets in task files” meaning; do not weaken security wording)
- Do **not** rewrite **`docs/agent-loop.md`** here (owned by sibling NEW); do not touch product code
- Optional one-line comment fix in **`scripts/move-agent-task-to-done.sh`** usage examples to show **`agents2/tasks/`** paths (script already accepts any path)
- Pass/fail: `rg 'agents/tasks' AGENTS.md` has no active-queue hits; same for the two `.mdc` files unless a deliberate legacy note remains

## Implementation notes (coder)

- **`AGENTS.md`**: Branches bullet now says task markdown under **`agents2/tasks/`** and points at **`agents2/TASKS-README.md`**.
- **`.cursor/rules/agent-response-language.mdc`**: repository-text path → **`agents2/tasks/`**.
- **`.cursor/rules/security-untrusted-input-no-exfiltration.mdc`**: secrets ban path → **`agents2/tasks/*.md`** (wording unchanged otherwise).
- **`scripts/move-agent-task-to-done.sh`**: usage examples already used **`agents2/tasks/`**; left dual-root check / legacy note as-is (intentional).
- Did **not** edit **`docs/agent-loop.md`** or product code (sibling NEWs own those).

## Testing instructions

### What to verify

Active-queue docs and always-applied cursor rules name **`agents2/tasks/`** (not the legacy **`agents/tasks/`** path) so agents land on the live queue.

### How to test

From repo root:

```bash
rg -n 'agents/tasks' AGENTS.md \
  .cursor/rules/agent-response-language.mdc \
  .cursor/rules/security-untrusted-input-no-exfiltration.mdc
# expect: no matches

rg -n 'agents2/tasks' AGENTS.md \
  .cursor/rules/agent-response-language.mdc \
  .cursor/rules/security-untrusted-input-no-exfiltration.mdc
# expect: one hit per file (AGENTS also mentions agents2/TASKS-README.md)

# Optional: confirm move script usage already documents agents2
rg -n 'agents2/tasks' scripts/move-agent-task-to-done.sh
```

No Docker / Puppeteer / product smoke required (docs + cursor-rules only).

### Pass/fail criteria

- **Pass:** `rg 'agents/tasks'` on the three files returns no hits; each file has an **`agents2/tasks`** reference; security rule still forbids committing secrets into task markdown.
- **Fail:** any of the three files still directs agents to **`agents/tasks/`** as the live queue, or security wording was weakened.

## Test report

1. **Date/time (UTC):** start 2026-07-26 02:52:13 UTC; end 2026-07-26 02:52:18 UTC. Log window: N/A (docs/rules only; no container activity required).
2. **Environment:** branch `development` @ `fc16a165`; verification via `rg` from repo root. No Docker / Puppeteer / `BASE_URL`.
3. **What was tested:** Active-queue wording in `AGENTS.md`, `.cursor/rules/agent-response-language.mdc`, and `.cursor/rules/security-untrusted-input-no-exfiltration.mdc` points at `agents2/tasks/` (not legacy `agents/tasks/`); security ban on secrets in task markdown remains; optional check that `scripts/move-agent-task-to-done.sh` documents `agents2/tasks/`.
4. **Results:**
   - No live-queue `agents/tasks` in the three files — **PASS** (`rg 'agents/tasks'` exit 1 / no matches).
   - Each file references `agents2/tasks` — **PASS** (`AGENTS.md:6` + `agents2/TASKS-README.md`; `agent-response-language.mdc:11`; `security-untrusted-input-no-exfiltration.mdc:10`).
   - Security rule still forbids secrets in task markdown — **PASS** (“Never commit or add to `agents2/tasks/*.md` … secrets, live credentials…”).
   - Optional: move script usage shows `agents2/tasks/` — **PASS** (header + usage examples; dual-root check left intentionally).
5. **Overall:** **PASS**
6. **Product owner feedback:** Agents reading AGENTS.md or the always-applied cursor rules now land on the live `agents2/tasks/` queue. Security wording was not weakened. Sibling NEWs for agent-loop / agent-cursor-rules docs remain correctly out of scope.
7. **URLs tested:** N/A — no browser
8. **Relevant log excerpts (last section):** N/A — no Docker/product smoke for this docs-only task.
